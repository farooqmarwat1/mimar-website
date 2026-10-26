import Reveal from "@/components/ui/Reveal";
import ProjectsFilter from "@/components/ProjectsFilter";
import { itemListJsonLd, jsonLdScript } from "@/lib/seo";
import type { Project } from "@/lib/site-config";
import { localizedProjectsIntro, localizeProjects } from "@/lib/localized-site";
import { localizedBreadcrumb } from "@/lib/page-helpers";
import { projectsContent } from "@/content/pages/projects";
import { localeHref, type Locale } from "@/i18n/config";

/** Shared body of /projects and /ar/projects. */
export default function ProjectsView({ projects: source, lang = "en" }: { projects: Project[]; lang?: Locale }) {
  const c = projectsContent[lang];
  const projects = localizeProjects(source, lang);

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          localizedBreadcrumb(lang, [{ name: c.home, path: "/" }, { name: c.breadcrumbName, path: "/projects" }]),
          itemListJsonLd(c.itemListName, projects.map((project) => ({ name: project.title, path: localeHref(lang, `/projects/${project.slug}`) }))),
        ])}
      />
      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="index-heading">
            <span className="block">{c.heading1}</span>
            <span className="block text-accent">{c.heading2}</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-xl">{localizedProjectsIntro(lang)}</p>
        </Reveal>
      </div>

      <div className="mt-10">
        <ProjectsFilter projects={projects} lang={lang} />
      </div>
    </div>
  );
}
