import Reveal from "@/components/ui/Reveal";
import { jsonLdScript } from "@/lib/seo";
import { contact, siteConfig } from "@/lib/site-config";
import { localizedBreadcrumb } from "@/lib/page-helpers";
import { termsContent } from "@/content/pages/terms";
import { isRtl, localizeDigitsDeep, type Locale } from "@/i18n/config";

/** Shared body of /terms-of-use and /ar/terms-of-use. Same layout as the privacy policy (PrivacyPolicyView). */
export default function TermsView({ lang = "en" }: { lang?: Locale }) {
  const c = localizeDigitsDeep(termsContent[lang], lang);
  const rtl = isRtl(lang);
  const [introPre, introMid, introPost] = c.intro;

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          localizedBreadcrumb(lang, [{ name: c.home, path: "/" }, { name: c.breadcrumbName, path: "/terms-of-use" }]),
        ])}
      />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="page-heading max-w-3xl">{c.heading}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-2xl">
            {introPre}{rtl ? <bdi dir="ltr">{siteConfig.legalName}</bdi> : siteConfig.legalName}{introMid}{rtl ? <bdi dir="ltr">{siteConfig.url}</bdi> : siteConfig.url}{introPost}
          </p>
        </Reveal>
      </div>

      <div className="container-page mt-16 max-w-3xl">
        {c.sections.map(([heading, body], index) => (
          <Reveal key={heading} delay={Math.min(index * 0.03, 0.15)}>
            <div className="border-t border-line py-8 first:border-t-0">
              <h2 className="text-2xl font-medium tracking-[-.025em]">{heading}</h2>
              <p className="section-body mt-4">{body}</p>
            </div>
          </Reveal>
        ))}

        <Reveal delay={0.2}>
          <div className="border-t border-line py-8">
            <h2 className="text-2xl font-medium tracking-[-.025em]">{c.contactHeading}</h2>
            <p className="section-body mt-4">
              {c.contactBody}{" "}
              <a href={`mailto:${contact.email}`} className="text-accent hover:underline" dir={rtl ? "ltr" : undefined}>
                {contact.email}
              </a>
              .
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
