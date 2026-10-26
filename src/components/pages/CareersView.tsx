import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { jsonLdScript } from "@/lib/seo";
import { contact } from "@/lib/site-config";
import type { Job } from "@/lib/jobs";
import { localizedBreadcrumb } from "@/lib/page-helpers";
import { careersContent } from "@/content/pages/expos-careers-privacy";
import { isRtl, localeHref, localizeDigits, type Locale } from "@/i18n/config";

/**
 * Shared body of /careers and /ar/careers. Open roles come from Firestore and
 * are English only: the Arabic page keeps its own copy and links each role to
 * the English /careers/<slug> page.
 */
export default function CareersView({ jobs, lang = "en" }: { jobs: Job[]; lang?: Locale }) {
  const c = careersContent[lang];
  const rtl = isRtl(lang);

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          localizedBreadcrumb(lang, [{ name: c.home, path: "/" }, { name: c.breadcrumbName, path: "/careers" }]),
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
            {localizeDigits(c.body, lang)}
          </p>
        </Reveal>
      </div>

      <div className="container-page mt-16 border-t border-line">
        {c.values.map(([title, body], index) => (
          <Reveal key={title} delay={Math.min(index * 0.05, 0.15)}>
            <div className="motion-row grid gap-4 border-b border-line py-8 md:grid-cols-[14rem_1fr]">
              <p className="eyebrow text-muted">{title}</p>
              <p className="max-w-2xl text-lg leading-relaxed">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {jobs.length > 0 && (
        <section className="container-page mt-16" aria-labelledby="open-roles-heading">
          <Reveal>
            <p className="eyebrow mb-6 text-muted">
              {rtl ? localizeDigits(c.openRolesLabel(jobs.length), lang) : <>/ {jobs.length} open {jobs.length === 1 ? "role" : "roles"}</>}
            </p>
            <h2 id="open-roles-heading" className="section-heading">{c.openRolesHeading}</h2>
          </Reveal>
          <ul className="mt-8 border-t border-line">
            {jobs.map((job, index) => (
              <li key={job.id}>
                <Reveal delay={Math.min(index * 0.05, 0.15)}>
                  {/* Roles are managed in English only, so Arabic visitors open the English role page. */}
                  <Link
                    href={`/careers/${job.slug}`}
                    className="motion-row group grid gap-4 border-b border-line py-8 md:grid-cols-[14rem_1fr_auto] md:items-start"
                  >
                    <p className="eyebrow text-muted">
                      {job.department}
                      <br />
                      {job.location} · {c.modeLabel[job.workMode]}
                    </p>
                    <div>
                      <h3 className="text-2xl font-medium tracking-[-.03em] group-hover:text-accent" dir={rtl ? "ltr" : undefined}>{job.title}</h3>
                      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted" dir={rtl ? "ltr" : undefined}>{job.summary}</p>
                      <p className="eyebrow mt-4 text-muted">{c.typeLabel[job.employmentType]}</p>
                    </div>
                    <span className="eyebrow text-accent">{c.viewRole}</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="container-page mt-16">
        <Reveal>
          {jobs.length > 0 ? (
            <p className="section-body max-w-xl">
              {c.dontSeePrefix}{" "}
              <a href={`mailto:${contact.email}`} className="text-accent hover:underline" dir={rtl ? "ltr" : undefined}>{contact.email}</a>{c.dontSeeSuffix}
            </p>
          ) : (
            <p className="section-body max-w-xl">
              {c.noRolesPrefix}<a href={`mailto:${contact.email}`} className="text-accent hover:underline" dir={rtl ? "ltr" : undefined}>{contact.email}</a>.
            </p>
          )}
        </Reveal>
        <Reveal delay={0.05}>
          <Link href={localeHref(lang, "/contact")} className="button-pill mt-8 text-ink">{c.cta}</Link>
        </Reveal>
      </div>
    </div>
  );
}
