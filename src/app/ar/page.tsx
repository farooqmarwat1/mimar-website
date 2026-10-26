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
import { buildMetadata } from "@/lib/seo";
import { localizeProjects, localizedFaqs, localizedSiteMeta } from "@/lib/localized-site";
import { getDictionary } from "@/i18n/dictionaries";

const meta = localizedSiteMeta("ar");

export const metadata: Metadata = buildMetadata({
  title: meta.title,
  description: meta.description,
  path: "/",
  locale: "ar",
  keywords: meta.keywords,
});

export default async function ArabicHome() {
  const dict = getDictionary("ar");
  const projects = localizeProjects(await getProjects(), "ar");

  return (
    <>
      <RegionalTitle lang="ar" />
      <Hero lang="ar" />
      <StudioIntro lang="ar" dict={dict} />
      <ServicesPreview lang="ar" dict={dict} />
      <PortfolioGrid projects={projects} lang="ar" dict={dict} />
      <TeamStats lang="ar" dict={dict} />
      <FaqSection items={localizedFaqs("ar")} lang="ar" dict={dict} />
      <ContactCta lang="ar" dict={dict} />
    </>
  );
}
