import ContactForm from "@/components/ContactForm";
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

      <section className="container-page flex min-h-[31rem] flex-col justify-end pb-20 pt-32 md:min-h-[36rem] md:pb-24">
        <Reveal>
          <p className="eyebrow mb-8 text-accent">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className={`max-w-4xl text-[clamp(3.75rem,18vw,9.5rem)] font-medium uppercase leading-[.78] tracking-[-.065em]${arClass(lang, "rtl:leading-[1.2]")}`}>
            {c.heading1}
            <br />
            <span className="text-accent">{c.heading2}</span>
          </h1>
        </Reveal>
      </section>

      <section className="container-page grid gap-14 py-16 md:min-h-[44rem] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-24 md:py-24">
        <div>
          <Reveal>
            <p className="max-w-xl text-[clamp(1.7rem,2.6vw,2.7rem)] leading-[1.08] tracking-[-.035em]">
              {c.subhead}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <address className="mt-14 flex max-w-sm flex-col gap-7 not-italic">
              <div>
                <p className="eyebrow mb-2 text-accent">{c.emailLabel}</p>
                <a href={`mailto:${contact.email}`} className="text-sm transition-colors hover:text-accent" dir={rtl ? "ltr" : undefined}>
                  {contact.email}
                </a>
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
                    <br />
                    {office.lines[1]}
                  </a>
                </div>
              ))}
            </address>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div>
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
    </div>
  );
}
