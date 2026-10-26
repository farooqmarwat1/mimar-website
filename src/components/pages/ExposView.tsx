import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { jsonLdScript } from "@/lib/seo";
import { localizedBreadcrumb } from "@/lib/page-helpers";
import { exposContent } from "@/content/pages/expos-careers-privacy";
import { localeHref, type Locale } from "@/i18n/config";

/** Shared body of /expos and /ar/expos. */
export default function ExposView({ lang = "en" }: { lang?: Locale }) {
  const c = exposContent[lang];

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          localizedBreadcrumb(lang, [{ name: c.home, path: "/" }, { name: c.breadcrumbName, path: "/expos" }]),
        ])}
      />

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
          <p className="section-body mt-8 max-w-2xl">
            {c.body}
          </p>
        </Reveal>
      </div>

      <div className="container-page mt-16 border-t border-line">
        {c.formats.map(([title, body], index) => (
          <Reveal key={title} delay={Math.min(index * 0.05, 0.15)}>
            <div className="motion-row grid gap-4 border-b border-line py-8 md:grid-cols-[14rem_1fr]">
              <p className="eyebrow text-muted">{title}</p>
              <p className="max-w-2xl text-lg leading-relaxed">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="container-page mt-16">
        <Reveal>
          <p className="section-body max-w-xl">
            {c.closing}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <Link href={localeHref(lang, "/contact")} className="button-pill mt-8 text-ink">{c.cta}</Link>
        </Reveal>
      </div>
    </div>
  );
}
