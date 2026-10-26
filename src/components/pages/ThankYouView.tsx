import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { thankYouContent } from "@/content/pages/contact";
import { localeHref, type Locale } from "@/i18n/config";

/** Shared body of /thank-you and /ar/thank-you. */
export default function ThankYouView({ lang = "en" }: { lang?: Locale }) {
  const c = thankYouContent[lang];
  return (
    <div className="flex min-h-[70svh] items-center py-24">
      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="page-heading max-w-3xl">
            {`${c.heading1} `}<span className="text-accent">{c.heading2}</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-xl">
            {c.body}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Link href={localeHref(lang, "/")} className="button-pill mt-10 text-ink">{c.back}</Link>
        </Reveal>
      </div>
    </div>
  );
}
