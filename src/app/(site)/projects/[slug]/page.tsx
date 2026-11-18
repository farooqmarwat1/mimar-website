import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailView from "@/components/pages/ProjectDetailView";
import { buildMetadata } from "@/lib/seo";
import { getProjectBySlug, getProjects } from "@/lib/cms";
import { getProjectStory } from "@/content/pages/project-stories";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const story = getProjectStory(project.slug, "en");
  return buildMetadata({
    title: story?.seo.title ?? `${project.title} | Mimar Studios`,
    description: story?.seo.description ?? project.summary,
    path: `/projects/${project.slug}`,
    keywords: story?.seo.keywords,
    ogImage: project.cover,
  });
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const allProjects = await getProjects();
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetailView project={project} allProjects={allProjects} />;
}
