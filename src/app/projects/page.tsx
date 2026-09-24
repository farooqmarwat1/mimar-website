import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import ProjectsFilter from "@/components/ProjectsFilter";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { getProjects } from "@/lib/cms";
import { projectsIntro } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Architecture & 3D Visualization Projects | Mimar Studios",
  description:
    "Explore Mimar Studios' portfolio of residential, hospitality, corporate, and public projects delivered for clients in 14+ countries.",
  path: "/projects",
  keywords: ["architecture projects", "3D visualization portfolio", "architectural rendering portfolio", "interior visualization"],
});

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }]),
          itemListJsonLd("Mimar Studios projects", projects.map((project) => ({ name: project.title, path: `/projects/${project.slug}` }))),
        ])}
      />
      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">/ Index</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="index-heading">
            <span className="block">All</span>
            <span className="block text-accent">Projects</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-xl">{projectsIntro}</p>
        </Reveal>
      </div>

      <div className="mt-10">
        <ProjectsFilter projects={projects} />
      </div>
    </div>
  );
}
