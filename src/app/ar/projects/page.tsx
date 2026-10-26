import type { Metadata } from "next";
import ProjectsView from "@/components/pages/ProjectsView";
import { buildMetadata } from "@/lib/seo";
import { getProjects } from "@/lib/cms";
import { projectsContent } from "@/content/pages/projects";

export const metadata: Metadata = buildMetadata({
  title: projectsContent.ar.title,
  description: projectsContent.ar.description,
  path: "/projects",
  locale: "ar",
  keywords: projectsContent.ar.keywords,
});

export default async function ArabicProjectsPage() {
  const projects = await getProjects();
  return <ProjectsView projects={projects} lang="ar" />;
}
