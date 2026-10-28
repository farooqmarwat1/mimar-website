import Link from "next/link";
import ApplicationForm from "@/components/ApplicationForm";
import Reveal from "@/components/ui/Reveal";
import { applyContent } from "@/content/pages/apply";
import { arClass } from "@/lib/page-helpers";
import { getOpenJobs } from "@/lib/jobs";
import { contact } from "@/lib/site-config";
import { isRtl, localeHref, type Locale } from "@/i18n/config";

/** Shared body of /careers/apply and /ar/careers/apply. Job seekers get their own form, apart from the client enquiry form. */
export default async function ApplyView({ lang = "en" }: { lang?: Locale }) {
  const c = applyContent[lang];
  const rtl = isRtl(lang);
  // Role titles are English only (roles are not translated), exactly like the careers page.
  const roles = (await getOpenJobs()).map((job) => job.title);

  return (
    <div>
      <section className="container-page flex min-h-[26rem] flex-col justify-end pb-16 pt-32 md:min-h-[30rem] md:pb-20">
        <Reveal>
          <p className="eyebrow mb-8 text-accent">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className={`max-w-4xl text-[clamp(3rem,13vw,8rem)] font-medium uppercase leading-[.82] tracking-[-.06em]${arClass(lang, "rtl:leading-[1.2]")}`}>
            {c.heading1}
            <br />
            <span className="text-accent">{c.heading2}</span>
          </h1>
        </Reveal>
      </section>

      <section className="container-page grid gap-14 py-16 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-24 md:py-24">
        <div>
          <Reveal>
            <p className="max-w-xl text-[clamp(1.4rem,2.2vw,2.2rem)] leading-[1.12] tracking-[-.03em]">{c.subhead}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-12 flex max-w-sm flex-col gap-7 text-sm">
              <div>
                <p className="eyebrow mb-2 text-accent">{c.emailLabel}</p>
                <a href={`mailto:${contact.hrEmail}`} className="transition-colors hover:text-accent" dir={rtl ? "ltr" : undefined}>
                  {contact.hrEmail}
                </a>
              </div>
              <p className="text-muted">
                {c.projectNote}{" "}
                <Link href={localeHref(lang, "/contact")} className="text-ink underline underline-offset-4 transition-colors hover:text-accent">
                  {c.projectLink}
                </Link>
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ApplicationForm lang={lang} copy={c.form} roles={roles} careersHref={localeHref(lang, "/careers")} />
        </Reveal>
      </section>
    </div>
  );
}
