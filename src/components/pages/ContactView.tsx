import ContactForm from "@/components/ContactForm";
import WorkStrips from "@/components/sections/WorkStrips";
import Reveal from "@/components/ui/Reveal";
import { jsonLdScript } from "@/lib/seo";
import { contact, contactPhones, services, telHref } from "@/lib/site-config";
import { localizedOffices, localizeServices } from "@/lib/localized-site";
import { localizedBreadcrumb, arClass } from "@/lib/page-helpers";
import { contactContent } from "@/content/pages/contact";
import { getDictionary } from "@/i18n/dictionaries";
import { isRtl, localizeDigits, type Locale } from "@/i18n/config";

/** Shared body of /contact and /ar/contact. */
export default function ContactView({ lang = "en" }: { lang?: Locale }) {
  const c = contactContent[lang];
  const dict = getDictionary(lang);
  const rtl = isRtl(lang);
  const offices = localizedOffices(lang);
  const serviceOptions = localizeServices(services, lang).map((service, index) => ({
    value: services[index].title,
    label: service.title,
  }));

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          localizedBreadcrumb(lang, [
            { name: c.breadcrumbHome, path: "/" },
            { name: c.breadcrumbName, path: "/contact" },
          ]),
        )}
      />

      {/* Same hero recipe as /about-us: full-screen looping video, a black fade from the reading side, text bottom-start. */}
      <section className="relative h-[100svh] min-h-[32rem] overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/projects/home-videos/abuja-poster.jpg"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/projects/home-videos/abuja.mp4" type="video/mp4" />
        </video>
        <div className={`absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent${arClass(lang, "rtl:bg-gradient-to-l")}`} />
        <div className="container-page relative flex h-full items-end pb-14 pt-32 md:pb-16">
          <div className="w-full">
            <Reveal>
              <p className="eyebrow mb-8 text-paper/65">{c.heroEyebrow}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className={`max-w-5xl break-words text-[clamp(3rem,13vw,8rem)] font-medium uppercase leading-[.82] tracking-[-.065em]${arClass(lang, "rtl:leading-[1.2]")}`}>
                {c.heading1}
                {" "}{c.heading2}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-10 max-w-[30rem] text-lg leading-snug text-paper/90 md:text-xl">{c.subhead}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <a href="#form" className="button-pill mt-10 text-paper">{c.heroCta}</a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-14 py-16 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-24 md:py-24">
        <div>
          <Reveal delay={0.08}>
            <address className="flex max-w-sm flex-col gap-7 not-italic">
              <div>
                <p className="eyebrow mb-2 text-accent">{c.emailLabel}</p>
                <a href={`mailto:${contact.email}`} className="text-sm transition-colors hover:text-accent" dir={rtl ? "ltr" : undefined}>
                  {contact.email}
                </a>
              </div>
              <div>
                <p className="eyebrow mb-2 text-accent">{c.careersLabel}</p>
                <a href={`mailto:${contact.hrEmail}`} className="text-sm transition-colors hover:text-accent" dir={rtl ? "ltr" : undefined}>
                  {contact.hrEmail}
                </a>
                <p className="mt-2 text-xs leading-relaxed text-muted">{c.careersNote}</p>
              </div>
              <div>
                <p className="eyebrow mb-2 text-accent">{c.phoneLabel}</p>
                <ul className="flex flex-col gap-1.5">
                  {contactPhones.map((phone) => (
                    <li key={phone.country} className="text-sm">
                      <span className="text-muted">{dict.footer.countries[phone.country] ?? phone.country}</span>{" "}
                      <a href={telHref(phone.number)} className="transition-colors hover:text-accent" dir={rtl ? "ltr" : undefined}>
                        {localizeDigits(phone.number, lang)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              {offices.map((office) => (
                <div key={office.city}>
                  <p className="eyebrow mb-2 text-accent">{c.officePrefix}{office.city}{c.officeSuffix}</p>
                  <a
                    href={office.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm leading-relaxed transition-colors hover:text-accent"
                  >
                    {office.lines[0]}{c.comma}
                    {" "}<br />
                    {office.lines[1]}
                  </a>
                </div>
              ))}
            </address>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div id="form" className="scroll-mt-24">
            <p className="eyebrow mb-10 text-accent">{c.enquiry}</p>
            <ContactForm
              lang={lang}
              dict={dict.contactForm}
              serviceOptions={serviceOptions}
              messages={rtl ? { ...c.formMessages, delivery: c.formMessages.delivery(contact.email) } : undefined}
            />
          </div>
        </Reveal>
      </section>

      <WorkStrips lang={lang} copy={c.work} />
    </div>
  );
}
