import type { Metadata } from "next";
import Hero from "@/components/hero/Hero";
import StudioIntro from "@/components/sections/StudioIntro";
import ServicesPreview from "@/components/sections/ServicesPreview";
import PortfolioGrid from "@/components/sections/PortfolioGrid";
import TeamStats from "@/components/sections/TeamStats";
import FaqSection from "@/components/sections/FaqSection";
import ContactCta from "@/components/sections/ContactCta";
import RegionalTitle from "@/components/RegionalTitle";
import { getProjects } from "@/lib/cms";
import { faqs } from "@/lib/site-config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { localizedSiteMeta } from "@/lib/localized-site";

const meta = localizedSiteMeta("en");

// Same title, description and canonical as the layout fallback; set here so the
// home page gets the en/ar/x-default hreflang set that /ar points back to.
export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: "/",
  keywords: meta.keywords,
});

// Order matches the reference design: Hero, About (studio), Services,
// Projects, Numbers (stats), CTA - then the footer. Keep this sequence when
// editing; don't reorder without checking against the reference again.
export default async function Home() {
  const projects = await getProjects();
  const dict = getDictionary("en");

  return (
    <>
      <RegionalTitle lang="en" />
      <Hero />
      <StudioIntro dict={dict} />
      <ServicesPreview dict={dict} />
      <PortfolioGrid projects={projects} dict={dict} />
      <TeamStats dict={dict} />
      <FaqSection items={faqs} dict={dict} />
      <ContactCta dict={dict} />
    </>
  );
}
