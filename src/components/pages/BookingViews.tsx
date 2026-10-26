import Link from "next/link";
import { jsonLdScript } from "@/lib/seo";
import { localizedBreadcrumb } from "@/lib/page-helpers";
import { bookingContent, myBookingsContent, proposalContent } from "@/content/pages/booking";
import { isRtl, localeHref, localizeDigits, type Locale } from "@/i18n/config";
import Num from "@/i18n/Num";

/** Shared body of /booking and /ar/booking. */
export function BookingView({ lang = "en" }: { lang?: Locale }) {
  const c = bookingContent[lang];
  const rtl = isRtl(lang);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(localizedBreadcrumb(lang, [
          { name: c.home, path: "/" },
          { name: c.breadcrumbName, path: "/booking" },
        ]))}
      />

      <section className="container-page flex min-h-[30rem] flex-col justify-end pb-20 pt-32 md:min-h-[38rem] md:pb-24">
        <p className="eyebrow text-accent">{c.eyebrow}</p>
        <h1 className="index-heading mt-8 max-w-6xl">
          {c.h1Pre}<span className="text-accent">{c.h1Accent}</span>
        </h1>
        <p className="section-body mt-8 max-w-xl">{c.body}</p>
        <Link href="#meeting-options" className="button-pill mt-10 self-start text-ink">
          {c.chooseTime}
        </Link>
      </section>

      <section id="meeting-options" className="bg-ink text-paper">
        <div className="container-page py-20 md:py-28">
          <p className="eyebrow text-muted-inverse">{c.optionsEyebrow}</p>
          <h2 className="section-heading mt-6 max-w-3xl">
            {c.optionsPre}<span className="text-accent">{c.optionsAccent}</span>
          </h2>
          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {c.meetings.map((meeting, index) => (
              <article key={meeting.src} className="min-w-0 border border-paper/20 bg-paper p-4 text-ink sm:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
                  <p className="eyebrow text-accent">{rtl ? <Num value={String(index + 1).padStart(2, "0")} locale={lang} /> : String(index + 1).padStart(2, "0")}</p>
                  <h3 className="text-end text-2xl font-medium tracking-tight">{localizeDigits(meeting.title, lang)}</h3>
                </div>
                <iframe
                  src={meeting.src}
                  title={c.iframeTitle(c.lowercase ? meeting.title.toLowerCase() : localizeDigits(meeting.title, lang))}
                  loading="lazy"
                  className="mt-5 h-[39rem] w-full border-0"
                />
                <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="sr-only focus:not-sr-only focus:mt-5 focus:inline-block">
                  {c.openLink[0]}{c.lowercase ? meeting.title.toLowerCase() : localizeDigits(meeting.title, lang)}{c.openLink[1]}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-28">
        <p className="eyebrow text-muted">{c.contactEyebrow}</p>
        <h2 className="section-heading mt-6">{c.contactPre}<span className="text-accent">{c.contactAccent}</span></h2>
        <p className="section-body mt-5 max-w-xl">{c.contactBody}</p>
        <Link href={localeHref(lang, "/contact")} className="button-pill mt-8 text-ink">{c.contactCta}</Link>
      </section>
    </div>
  );
}

/** Shared body of /my-bookings and /ar/my-bookings. */
export function MyBookingsView({ lang = "en" }: { lang?: Locale }) {
  const c = myBookingsContent[lang];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(localizedBreadcrumb(lang, [
          { name: c.home, path: "/" },
          { name: c.breadcrumbName, path: "/my-bookings" },
        ]))}
      />

      <section className="container-page flex min-h-[34rem] flex-col justify-end pb-20 pt-32 md:min-h-[40rem] md:pb-28">
        <p className="eyebrow text-accent">{c.eyebrow}</p>
        <h1 className="index-heading mt-8 max-w-6xl">
          {c.h1Pre}<span className="text-accent">{c.h1Accent}</span>
        </h1>
        <p className="section-body mt-8 max-w-xl">
          {c.body}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={localeHref(lang, "/booking")} className="button-pill text-ink">{c.book}</Link>
          <Link href={localeHref(lang, "/contact")} className="button-pill text-ink">{c.contact}</Link>
        </div>
      </section>
    </div>
  );
}

const proposalUrl = "https://www.canva.com/design/DAEuLkl6nlM/watch";

/** Shared body of /visualization-proposal and /ar/visualization-proposal. */
export function VisualizationProposalView({ lang = "en" }: { lang?: Locale }) {
  const c = proposalContent[lang];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(localizedBreadcrumb(lang, [
          { name: c.home, path: "/" },
          { name: c.breadcrumbName, path: "/visualization-proposal" },
        ]))}
      />

      <section className="container-page pb-12 pt-32 md:pb-16 md:pt-44">
        <p className="eyebrow text-accent">{c.eyebrow}</p>
        <h1 className="index-heading mt-8 max-w-6xl">
          {c.h1Pre}<span className="text-accent">{c.h1Accent}</span>
        </h1>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <div className="relative aspect-video w-full overflow-hidden bg-ink/5">
          <iframe
            src={`${proposalUrl}?embed`}
            title={c.iframeTitle}
            loading="lazy"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={proposalUrl} target="_blank" rel="noopener noreferrer" className="button-pill text-ink">{c.open}</a>
          <Link href={localeHref(lang, "/contact")} className="button-pill text-ink">{c.contact}</Link>
        </div>
      </section>
    </div>
  );
}
