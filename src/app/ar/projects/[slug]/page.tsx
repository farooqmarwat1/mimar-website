import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailView from "@/components/pages/ProjectDetailView";
import { buildMetadata } from "@/lib/seo";
import { getProjectBySlug, getProjects } from "@/lib/cms";
import { localizeProject } from "@/lib/localized-site";
import { projectDetailContent } from "@/content/pages/projects";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const source = await getProjectBySlug(slug);
  if (!source) return {};
  const project = localizeProject(source, "ar");
  return buildMetadata({
    title: `${project.title}${projectDetailContent.ar.titleSuffix}`,
    description: project.summary,
    path: `/projects/${project.slug}`,
    locale: "ar",
    ogImage: project.cover,
  });
}

export default async function ArabicProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allProjects = await getProjects();
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetailView project={project} allProjects={allProjects} lang="ar" />;
}
