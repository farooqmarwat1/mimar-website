import type { Metadata } from "next";
import ProjectsView from "@/components/pages/ProjectsView";
import { buildMetadata } from "@/lib/seo";
import { getProjects } from "@/lib/cms";
import { projectsContent } from "@/content/pages/projects";

export const metadata: Metadata = buildMetadata({
  title: projectsContent.en.title,
  description: projectsContent.en.description,
  path: "/projects",
  keywords: projectsContent.en.keywords,
});

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsView projects={projects} />;
}
