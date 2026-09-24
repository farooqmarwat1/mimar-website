import Hero from "@/components/hero/Hero";
import StudioIntro from "@/components/sections/StudioIntro";
import ServicesPreview from "@/components/sections/ServicesPreview";
import PortfolioGrid from "@/components/sections/PortfolioGrid";
import TeamStats from "@/components/sections/TeamStats";
import FaqSection from "@/components/sections/FaqSection";
import ContactCta from "@/components/sections/ContactCta";
import { getProjects } from "@/lib/cms";
import { faqs } from "@/lib/site-config";

// Order matches the reference design: Hero, About (studio), Services,
// Projects, Numbers (stats), CTA - then the footer. Keep this sequence when
// editing; don't reorder without checking against the reference again.
export default async function Home() {
  const projects = await getProjects();

  return (
    <>
      <Hero />
      <StudioIntro />
      <ServicesPreview />
      <PortfolioGrid projects={projects} />
      <TeamStats />
      <FaqSection items={faqs} />
      <ContactCta />
    </>
  );
}
