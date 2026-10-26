import Reveal from "@/components/ui/Reveal";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

/**
 * Visible FAQ block + matching FAQPage JSON-LD.
 *
 * This pairing is the core GEO (Generative Engine Optimization) tactic on
 * the site: AI answer engines lift question/answer pairs almost verbatim
 * when they're marked up this way, so this content is written to stand
 * alone as a citable answer, not just as a webpage fragment.
 */
export default function FaqSection({
  items,
  lang = "en",
  dict = getDictionary(lang),
}: {
  items: readonly { question: string; answer: string }[];
  lang?: Locale;
  dict?: Dictionary;
}) {
  return (
    <section className="section-py">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(items))}
      />
      <div className="container-page mx-auto max-w-3xl">
        <div className="text-center">
          <Reveal>
            <p className="eyebrow text-muted">{dict.faqSection.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-heading mx-auto mt-6 mb-12">{dict.faqSection.heading}</h2>
          </Reveal>
        </div>
        <div className="border-t border-line">
          {items.map((item, i) => (
            <Reveal key={item.question} delay={Math.min(i * 0.05, 0.3)}>
              <details className="motion-row group border-b border-line py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg tracking-tight">
                  {item.question}
                  <span className="eyebrow text-muted shrink-0 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="section-body mt-4">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
