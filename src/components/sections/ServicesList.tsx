import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { Service } from "@/lib/site-config";
import { servicePath } from "@/lib/service-details";
import { localeHref, type Locale } from "@/i18n/config";
import Num from "@/i18n/Num";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export default function ServicesList({
  services,
  lang = "en",
  dict = getDictionary(lang),
}: {
  services: Service[];
  lang?: Locale;
  dict?: Dictionary;
}) {
  const c = dict.servicesList;
  return (
    <section className="section-py">
      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading max-w-4xl">
            {c.heading1} <span className="text-accent">{c.heading2}</span>
          </h2>
        </Reveal>
      </div>

      <ul className="container-page mt-16 border-t border-line">
        {services.map((service, i) => (
          <li key={service.slug} className="border-b border-line">
            <Link
              href={localeHref(lang, servicePath(service.slug))}
              className="motion-row group flex flex-col gap-2 py-8 md:flex-row md:items-center md:gap-10"
            >
              <span className="eyebrow text-muted w-16 shrink-0"><Num value={String(i + 1).padStart(2, "0")} locale={lang} /></span>
              <span className="flex-1 text-2xl md:text-3xl tracking-tight transition-opacity group-hover:opacity-60">
                {service.title}
              </span>
              <span className="section-body max-w-md">{service.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
