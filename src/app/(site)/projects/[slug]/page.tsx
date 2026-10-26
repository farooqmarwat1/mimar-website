import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailView from "@/components/pages/ProjectDetailView";
import { buildMetadata } from "@/lib/seo";
import { getProjectBySlug, getProjects } from "@/lib/cms";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return buildMetadata({
    title: `${project.title} | Mimar Studios`,
    description: project.summary,
    path: `/projects/${project.slug}`,
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
