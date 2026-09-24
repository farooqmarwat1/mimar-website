import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { contact } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Contact Mimar Studios - Let’s Talk",
  description:
    "Tell Mimar Studios what you are building. Contact our Islamabad studio for architecture, visualization, VR and interactive projects.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        )}
      />

      <section className="container-page flex min-h-[31rem] flex-col justify-end pb-20 pt-32 md:min-h-[36rem] md:pb-24">
        <Reveal>
          <p className="eyebrow mb-8 text-accent">/ Contact</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="max-w-4xl text-[clamp(3.75rem,18vw,9.5rem)] font-medium uppercase leading-[.78] tracking-[-.065em]">
            Let&apos;s
            <br />
            <span className="text-accent">talk</span>
          </h1>
        </Reveal>
      </section>

      <section className="container-page grid gap-14 py-16 md:min-h-[44rem] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-24 md:py-24">
        <div>
          <Reveal>
            <p className="max-w-xl text-[clamp(1.7rem,2.6vw,2.7rem)] leading-[1.08] tracking-[-.035em]">
              Tell us what you are building. We reply within one working day.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <address className="mt-14 flex max-w-sm flex-col gap-7 not-italic">
              <div>
                <p className="eyebrow mb-2 text-accent">Email</p>
                <a href={`mailto:${contact.email}`} className="text-sm transition-colors hover:text-accent">
                  {contact.email}
                </a>
              </div>
              <div>
                <p className="eyebrow mb-2 text-accent">Phone</p>
                <a
                  href={`tel:${contact.phones.pakistanMobile.replace(/\s/g, "")}`}
                  className="text-sm transition-colors hover:text-accent"
                >
                  {contact.phones.pakistanMobile}
                </a>
              </div>
              <div>
                <p className="eyebrow mb-2 text-accent">Studio</p>
                <a
                  href={contact.address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm leading-relaxed transition-colors hover:text-accent"
                >
                  {contact.address.line1},
                  <br />
                  {contact.address.line2}
                </a>
              </div>
            </address>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div>
            <p className="eyebrow mb-10 text-accent">/ Project enquiry</p>
            <ContactForm />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
