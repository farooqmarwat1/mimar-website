import Image from "next/image";
import Link from "next/link";
import ContactCta from "@/components/sections/ContactCta";
import { jsonLdScript } from "@/lib/seo";
import { localizedBreadcrumb } from "@/lib/page-helpers";
import { studioContent } from "@/content/pages/studio";
import { getDictionary } from "@/i18n/dictionaries";
import { isRtl, localeHref, localizeDigitsDeep, type Locale } from "@/i18n/config";
import Num from "@/i18n/Num";

/** Shared body of /about-us/studio and /ar/about-us/studio. */
export default function StudioView({ lang = "en" }: { lang?: Locale }) {
  const c = localizeDigitsDeep(studioContent[lang], lang);
  const dict = getDictionary(lang);
  const rtl = isRtl(lang);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(localizedBreadcrumb(lang, [
          { name: c.home, path: "/" },
          { name: c.aboutName, path: "/about-us" },
          { name: c.studioName, path: "/about-us/studio" },
        ]))}
      />

      <header className="container-page flex min-h-[34rem] flex-col justify-between border-b border-line pb-16 pt-32 md:min-h-[42rem] md:pb-20 md:pt-40">
        <p className="eyebrow text-muted">
          <Link href={localeHref(lang, "/about-us")} className="hover:text-accent">{c.eyebrowAbout}</Link>{c.eyebrowStudio}
        </p>
        <div className="w-full">
          <p className="eyebrow text-accent">{c.heroTag}</p>
          <h1 className="index-heading mt-5 text-accent">{c.heroTitle}</h1>
          <div className="mt-12 flex flex-col justify-between gap-8 border-t border-line pt-7 md:flex-row md:items-end">
            <p className="section-body max-w-2xl text-lg md:text-xl">
              {c.heroBody}
            </p>
            <Link href="#ceo-message" className="button-pill shrink-0 text-ink">{c.heroCta}</Link>
          </div>
        </div>
      </header>

      <section id="ceo-message" className="bg-ink text-paper">
        <div className="container-page grid gap-12 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:items-center md:gap-16 md:py-28">
          <div>
            <p className="eyebrow text-muted-inverse">{c.ceoEyebrow}</p>
            <h2 className="section-heading mt-8 max-w-xl">{c.ceoHeading1}<span className="text-accent">{c.ceoHeading2}</span></h2>
            <blockquote className="mt-10 max-w-2xl border-s-2 border-accent ps-6 text-xl leading-snug tracking-[-.02em] md:text-2xl">
              <p>{c.ceoQuote1}</p>
              <p className="mt-6">{c.ceoQuote2}</p>
            </blockquote>
          </div>
          <div>
            <div className="aspect-video overflow-hidden bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/yAIKHczr05o"
                title={c.videoTitle}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="eyebrow mt-4 text-muted-inverse">{c.videoCaption}</p>
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-28">
        <div className="grid gap-6 border-b border-line pb-12 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:gap-16">
          <p className="eyebrow text-muted">{c.peopleEyebrow}</p>
          <div>
            <h2 className="section-heading">{c.peopleHeading1}<span className="text-accent">{c.peopleHeading2}</span></h2>
            <p className="section-body mt-6 max-w-2xl">{c.peopleBody}</p>
          </div>
        </div>
        <div className="border-t border-line">
          {c.disciplines.map((item) => (
            <article key={item.number} className="motion-row grid gap-5 border-b border-line py-8 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-10 md:py-10">
              <p className="eyebrow text-accent">{rtl ? <Num value={item.number} locale={lang} /> : item.number}</p>
              <h3 className="text-2xl font-medium tracking-[-.035em] md:text-3xl">{item.title}</h3>
              <p className="section-body max-w-xl">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <div className="flex flex-col justify-between gap-5 border-t border-line pt-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-muted">{c.cultureEyebrow}</p>
            <h2 className="section-heading mt-6">{c.cultureHeading1}<span className="text-accent">{c.cultureHeading2}</span></h2>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-16">
          <p className="section-body max-w-xl">{c.cultureBody1}</p>
          <p className="section-body max-w-xl">{c.cultureBody2}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {c.photos.map((photo) => (
            <figure key={photo.src}>
              <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
              <figcaption className="eyebrow mt-4 text-muted">{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <ContactCta lang={lang} dict={dict} />
    </div>
  );
}
