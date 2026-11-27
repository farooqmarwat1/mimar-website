"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { pick, type Locale } from "@/i18n/config";

/**
 * Invisible Google reCAPTCHA v2, shared by every public form (server side: src/lib/recaptcha.ts).
 * Visitors see no checkbox: the check runs when they press Send, and Google only shows a picture
 * challenge to traffic it finds suspicious. The floating badge is hidden in globals.css, which Google
 * allows only while the form says it is protected by reCAPTCHA - that is <RecaptchaNotice>, so keep
 * the two together.
 *
 * Public key, inlined at build time. It must be a "v2 Invisible reCAPTCHA badge" key (a checkbox key
 * shows "invalid key type"). When it is unset - local development without keys - the forms skip the
 * widget and the server skips the check outside production.
 */
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || null;

export type RecaptchaHandle = {
  /**
   * Runs the check. A token when it passes, null when it cannot run (script blocked, network error),
   * undefined when a newer call replaced this one (the visitor closed a challenge and pressed Send again).
   */
  getToken: () => Promise<string | null | undefined>;
};

/** Shown by a form when the check fails or cannot run. */
export const recaptchaFailed = (lang: Locale) =>
  pick(
    lang,
    "We couldn't confirm you're not a robot. Please try again, or email us instead.",
    "تعذّر التأكد من أنك لست برنامج روبوت. يرجى المحاولة مرة أخرى أو مراسلتنا بالبريد الإلكتروني.",
  );

type RecaptchaApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      size: "invisible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => number;
  execute: (widgetId: number) => void;
  reset: (widgetId: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
    __mimarRecaptchaLoaded?: () => void;
  }
}

const SCRIPT_ID = "google-recaptcha-script";
let loading: Promise<RecaptchaApi> | null = null;

/**
 * Loads api.js once per page. render=explicit: we render each widget ourselves, so it also works in the
 * quote pop-up and after a client-side navigation. The language is fixed by `hl` for the page's
 * lifetime; switching between English and Arabic is a full page load (two root layouts), so that holds.
 */
function loadRecaptcha(lang: Locale): Promise<RecaptchaApi> {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (loading) return loading;
  loading = new Promise<RecaptchaApi>((resolve, reject) => {
    window.__mimarRecaptchaLoaded = () => (window.grecaptcha ? resolve(window.grecaptcha) : reject(new Error("missing")));
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?onload=__mimarRecaptchaLoaded&render=explicit&hl=${lang}`;
    script.async = true;
    script.defer = true;
    script.addEventListener("error", () => {
      loading = null;
      script.remove();
      reject(new Error("blocked"));
    });
    document.head.appendChild(script);
  });
  return loading;
}

export default function RecaptchaWidget({ siteKey, lang = "en", ref }: { siteKey: string; lang?: Locale; ref: Ref<RecaptchaHandle> }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<Promise<{ api: RecaptchaApi; id: number } | null>>(Promise.resolve(null));
  const pending = useRef<((token: string | null | undefined) => void) | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const settle = (token: string | null | undefined) => {
    const resolve = pending.current;
    pending.current = null;
    resolve?.(token);
  };

  useEffect(() => {
    let cancelled = false;
    const host = container.current;
    widget.current = loadRecaptcha(lang).then(
      (api) => {
        if (cancelled || !host) return null;
        // A fresh child each time: grecaptcha refuses to render twice into the same element.
        const target = document.createElement("div");
        host.replaceChildren(target);
        const id = api.render(target, {
          sitekey: siteKey,
          size: "invisible",
          callback: (token) => settle(token),
          "expired-callback": () => settle(null),
          "error-callback": () => settle(null),
        });
        return { api, id };
      },
      () => {
        if (!cancelled) setLoadFailed(true);
        return null;
      },
    );

    return () => {
      cancelled = true;
      settle(undefined);
      host?.replaceChildren();
    };
  }, [siteKey, lang]);

  useImperativeHandle(ref, () => ({
    async getToken() {
      const ready = await widget.current;
      if (!ready) return null;
      settle(undefined);
      return new Promise<string | null | undefined>((resolve) => {
        pending.current = resolve;
        // A token works once, so every Send starts a fresh check.
        ready.api.reset(ready.id);
        ready.api.execute(ready.id);
      });
    },
  }));

  return (
    <>
      <div ref={container} className="absolute size-0" />
      {loadFailed && (
        <p className="w-full text-sm text-red-600">
          {pick(
            lang,
            "The security check couldn't load. Please disable any content blocker and refresh the page.",
            "تعذّر تحميل التحقق الأمني. يُرجى تعطيل أي أداة لحظر المحتوى ثم تحديث الصفحة.",
          )}
        </p>
      )}
    </>
  );
}

/**
 * The wording Google requires on a form whose reCAPTCHA badge is hidden. Since 2 April 2026 Google is
 * the site's data processor and asks sites NOT to link its own Privacy Policy and Terms here
 * (docs.cloud.google.com/recaptcha/docs/faq); our privacy policy covers reCAPTCHA instead.
 * Renders nothing without a key.
 */
export function RecaptchaNotice({ lang = "en", className = "" }: { lang?: Locale; className?: string }) {
  if (!RECAPTCHA_SITE_KEY) return null;
  return (
    <p className={`text-[11px] leading-relaxed text-muted ${className}`}>
      {pick(lang, "This site is protected by reCAPTCHA.", "هذا الموقع محمي بواسطة reCAPTCHA.")}
    </p>
  );
}
