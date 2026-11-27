"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { openQuote } from "@/components/quote/open-quote";
import { trackEvent } from "@/lib/track-event";
import { isRtl, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export type ChatTurn = { role: "user" | "assistant"; text: string };

/** Must match the API's caps (src/app/api/assistant/route.ts). */
const MAX_TURNS = 12;
const MAX_CHARS = 1000;

/**
 * The AI agent chat panel above the corner button. Answers come from /api/assistant (Gemini, the same
 * key as the blog). The conversation lives only in this component: nothing is stored, and closing the
 * panel or leaving the page ends it. Replies are shown as plain text (never as HTML).
 */
export default function AssistantChat({ lang, dict, onClose }: { lang: Locale; dict: Dictionary["contactFab"]; onClose: () => void }) {
  const rtl = isRtl(lang);
  const reduceMotion = useReducedMotion();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    field.current?.focus({ preventScroll: true });
    trackEvent("assistant_open", { lang });
  }, [lang]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [turns, busy, reduceMotion]);

  const full = turns.length >= MAX_TURNS - 1;

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim().slice(0, MAX_CHARS);
    if (!text || busy || full) return;
    const next: ChatTurn[] = [...turns, { role: "user", text }];
    setTurns(next);
    setDraft("");
    setBusy(true);
    setError(null);
    trackEvent("assistant_message", { lang, turn: next.length });
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, messages: next }),
      });
      if (res.status === 429) {
        setError(dict.assistantLimit);
        return;
      }
      const data = (await res.json().catch(() => null)) as { reply?: string } | null;
      if (!res.ok || !data?.reply) {
        setError(dict.assistantError);
        return;
      }
      setTurns([...next, { role: "assistant", text: data.reply }]);
    } catch {
      setError(dict.assistantError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.section
      role="dialog"
      aria-label={dict.assistantTitle}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      transition={{ duration: 0.2 }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="flex h-[min(34rem,calc(100svh-7.5rem))] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden border border-line bg-paper text-ink shadow-[0_16px_48px_rgba(14,15,18,.18)]"
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <p className="text-sm font-medium">{dict.assistantTitle}</p>
          <p className="text-[11px] text-muted">{dict.assistantNote}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.assistantClose}
          className="flex size-9 items-center justify-center text-ink transition-colors hover:text-accent"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M2 2 14 14M14 2 2 14" />
          </svg>
        </button>
      </header>

      <div ref={list} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4" aria-live="polite">
        <Bubble role="assistant" text={dict.assistantIntro} />
        {turns.map((turn, index) => (
          <Bubble key={index} role={turn.role} text={turn.text} />
        ))}
        {busy && <p className="text-xs text-muted">{dict.assistantThinking}</p>}
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-line px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={() => openQuote("assistant")}
          className="mb-3 text-xs font-medium text-accent underline-offset-2 hover:underline"
        >
          {dict.assistantQuote} {rtl ? "←" : "→"}
        </button>
        <form onSubmit={send} className="flex items-end gap-2">
          <textarea
            ref={field}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void send();
              }
            }}
            rows={1}
            maxLength={MAX_CHARS}
            disabled={full}
            placeholder={full ? dict.assistantLimit : dict.assistantPlaceholder}
            aria-label={dict.assistantPlaceholder}
            className="max-h-28 min-h-10 flex-1 resize-none border-b border-line bg-transparent py-2 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
          />
          <button
            type="submit"
            disabled={busy || full || !draft.trim()}
            className="h-10 shrink-0 rounded-full bg-ink px-4 text-xs font-medium uppercase tracking-wide text-paper transition-opacity disabled:opacity-40 rtl:tracking-normal"
          >
            {dict.assistantSend}
          </button>
        </form>
      </div>
    </motion.section>
  );
}

function Bubble({ role, text }: ChatTurn) {
  const mine = role === "user";
  return (
    <p
      dir="auto"
      className={`max-w-[85%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-sm leading-relaxed ${
        mine ? "self-end bg-ink text-paper" : "self-start bg-ink/[.05] text-ink"
      }`}
    >
      {text}
    </p>
  );
}
