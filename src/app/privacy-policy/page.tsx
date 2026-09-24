import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { contact, siteConfig } from "@/lib/site-config";

// GENERIC STARTER - not reviewed by counsel. Drafted to fill a gap flagged
// in the pre-launch SEO migration audit (old /privacy-policy/ had no
// equivalent on the new site). Mimar Studios must have a lawyer review and
// adapt this - especially the data-processor list and any
// jurisdiction-specific rights (e.g. GDPR/CCPA) - before it is treated as
// the real, binding policy.
export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Mimar Studios",
  description: "How Mimar Studios collects, uses and protects information submitted through this website.",
  path: "/privacy-policy",
});

const sections = [
  {
    heading: "Information we collect",
    body: [
      "When you use this website, we may collect information you provide directly - such as your name, email address, phone number and project details submitted through our contact form - and information collected automatically, such as pages visited, browser type and general location, typically via analytics and hosting logs.",
    ],
  },
  {
    heading: "How we use information",
    body: [
      "We use the information we collect to respond to enquiries, provide quotes, deliver services you request, improve this website, and - where you have not opted out - send occasional updates about our work. We do not sell personal information to third parties.",
    ],
  },
  {
    heading: "Cookies & analytics",
    body: [
      "This site may use cookies or similar technologies to remember preferences and understand how visitors use the site. You can disable cookies in your browser settings; some site features may not function correctly if you do.",
    ],
  },
  {
    heading: "Third-party services",
    body: [
      "We use third-party providers to operate this website and our business - for example, hosting, content management, email delivery and analytics providers. These providers process data on our behalf and are expected to protect it, but we do not control their systems directly.",
    ],
  },
  {
    heading: "Data retention",
    body: [
      "We retain personal information for as long as needed to respond to your enquiry, deliver a service, or meet legal and accounting obligations, after which it is deleted or anonymized.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Depending on where you are located, you may have rights to access, correct, or request deletion of your personal information, or to object to certain processing. To exercise any of these rights, contact us using the details below.",
    ],
  },
  {
    heading: "Children's privacy",
    body: [
      "This website is intended for business use and is not directed at children. We do not knowingly collect personal information from children.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "We may update this policy from time to time. Material changes will be reflected by an updated date on this page.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy-policy" }]),
        ])}
      />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">/ Legal</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="page-heading max-w-3xl">Privacy Policy</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-2xl">
            This policy explains how {siteConfig.legalName} (&quot;Mimar Studios&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses and
            protects information submitted through {siteConfig.url}. Last updated 27 August 2026.
          </p>
        </Reveal>
      </div>

      <div className="container-page mt-16 max-w-3xl">
        {sections.map((section, index) => (
          <Reveal key={section.heading} delay={Math.min(index * 0.03, 0.15)}>
            <div className="border-t border-line py-8 first:border-t-0">
              <h2 className="text-2xl font-medium tracking-[-.025em]">{section.heading}</h2>
              {section.body.map((p) => (
                <p key={p} className="section-body mt-4">{p}</p>
              ))}
            </div>
          </Reveal>
        ))}

        <Reveal delay={0.2}>
          <div className="border-t border-line py-8">
            <h2 className="text-2xl font-medium tracking-[-.025em]">Contact us</h2>
            <p className="section-body mt-4">
              For any privacy questions or to exercise your rights, contact us at{" "}
              <a href={`mailto:${contact.email}`} className="text-accent hover:underline">{contact.email}</a> or{" "}
              {contact.address.line1}, {contact.address.line2}.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
