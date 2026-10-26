import Image from "next/image";
import Link from "next/link";
import { contact, contactPhones, social, telHref } from "@/lib/site-config";
import { localizedOffices } from "@/lib/localized-site";
import { comma, localeHref, localizeDigits, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

const socialLinks = [
  { label: "Instagram", href: social.instagram, icon: "/icons/icons8-instagram.svg" },
  { label: "LinkedIn", href: social.linkedin, icon: "/icons/icons8-linkedin.svg" },
  { label: "Behance", href: social.behance, icon: "/icons/icons8-behance.svg" },
  { label: "YouTube", href: social.youtube, icon: "/icons/icons8-youtube.svg" },
  { label: "Pinterest", href: social.pinterest, icon: "/icons/icons8-pinterest.svg" },
  { label: "Facebook", href: social.facebook, icon: "/icons/icons8-facebook.svg" },
] as const;

const indexLinks = [
  { key: "projects", href: "/projects" },
  { key: "services", href: "/services" },
  { key: "xr", href: "/meta" },
  { key: "aboutUs", href: "/about-us" },
  { key: "studio", href: "/about-us/studio" },
  { key: "contact", href: "/contact" },
  { key: "booking", href: "/booking" },
  { key: "insights", href: "/blog" },
  { key: "careers", href: "/careers" },
  { key: "expos", href: "/expos" },
] as const;

export default function Footer({ lang = "en", dict = getDictionary(lang) }: { lang?: Locale; dict?: Dictionary }) {
  const columns = [
    {
      heading: dict.footer.officesHeading,
      links: localizedOffices(lang).map((office) => ({
        label: `${office.city}: ${office.lines.join(comma(lang))}`,
        href: office.mapsUrl,
        ltr: false,
      })),
    },
    {
      heading: dict.footer.contactHeading,
      links: [
        { label: contact.email, href: `mailto:${contact.email}`, ltr: true },
        ...contactPhones.map((phone) => ({
          label: `${dict.footer.countries[phone.country] ?? phone.country} ${localizeDigits(phone.number, lang)}`,
          href: telHref(phone.number),
          // Phone numbers keep their left-to-right order inside Arabic text.
          ltr: lang === "ar",
        })),
      ],
    },
    {
      heading: dict.footer.indexHeading,
      links: indexLinks.map((link) => ({ label: dict.nav[link.key], href: localeHref(lang, link.href), ltr: false })),
    },
  ];

  return (
    <footer className="bg-ink text-paper">
      <div className="container-page py-10 md:py-12">
        <Link href={localeHref(lang, "/")} aria-label={dict.header.homeLabel} className="relative mb-8 block h-9 w-32 transition-opacity hover:opacity-75">
          <Image src="/logos/white.png" alt="" fill sizes="144px" className="object-contain object-left rtl:object-right" />
        </Link>
        <div className="grid grid-cols-1 gap-x-8 gap-y-7 border-b border-line-inverse pb-8 min-[460px]:grid-cols-2 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="eyebrow mb-3 text-muted-inverse">{col.heading}</p>
              <ul className="flex flex-col gap-0">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      dir={link.ltr && lang === "ar" ? "ltr" : undefined}
                      className="inline-flex min-h-11 max-w-full items-center break-words text-sm leading-snug transition-colors hover:text-accent md:min-h-8"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="eyebrow mb-3 text-muted-inverse">{dict.footer.followHeading}</p>
            <ul className="flex max-w-44 flex-wrap gap-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-label={link.label}
                    title={link.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-10 items-center justify-center rounded-full border border-paper/25 transition-colors hover:border-accent hover:text-accent"
                  >
                    <span
                      aria-hidden="true"
                      className="size-5 bg-current"
                      style={{
                        maskImage: `url(${link.icon})`,
                        WebkitMaskImage: `url(${link.icon})`,
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                      }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-4">
          <p className="eyebrow text-muted-inverse">
            {dict.footer.rightsReserved} {localizeDigits(new Date().getFullYear(), lang)}
          </p>
          <Link href={localeHref(lang, "/privacy-policy")} className="eyebrow text-muted-inverse transition-colors hover:text-accent">
            {dict.footer.privacyPolicy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
