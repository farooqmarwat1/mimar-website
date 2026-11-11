import Image from "next/image";
import Link from "@/components/ui/Link";
import Reveal from "@/components/ui/Reveal";
import { creativeWorkJsonLd, faqJsonLd, jsonLdScript } from "@/lib/seo";
import { projects as fallbackProjects, type Project } from "@/lib/site-config";
import { localizeProject } from "@/lib/localized-site";
import { arClass, localizedBreadcrumb } from "@/lib/page-helpers";
import { projectDetailContent, projectsContent } from "@/content/pages/projects";
import { getDictionary } from "@/i18n/dictionaries";
import { localeHref, type Locale } from "@/i18n/config";
import { projectCoverAlt, projectGalleryAlt } from "@/lib/project-alt";
import { getProjectStory, projectStoryLabels } from "@/content/pages/project-stories";
import { regionList } from "@/lib/regions";
import { localizeRegion } from "@/lib/ar/regions.ar";
import { splitInlineLinks } from "@/lib/content-blocks";
import ContactCta from "@/components/sections/ContactCta";

/** Story text with `[words](/path)` turned into internal links in the page language. */
function linkedText(text: string, lang: Locale) {
  return splitInlineLinks(text).map((part, index) =>
    part.href ? (
      <Link key={index} href={localeHref(lang, part.href)} className="text-ink underline underline-offset-4 transition-colors hover:text-accent">
        {part.text}
      </Link>
    ) : (
      part.text
    ),
  );
}

/** Shared body of /projects/[slug] and /ar/projects/[slug]. Receives the English project data. */
export default function ProjectDetailView({
  project: source,
  allProjects,
  lang = "en",
}: {
  project: Project;
  allProjects: Project[];
  lang?: Locale;
}) {
  const c = projectDetailContent[lang];
  const pc = projectsContent[lang];
  const dict = getDictionary(lang);
  const project = localizeProject(source, lang);

  const projectIndex = allProjects.findIndex((item) => item.slug === project.slug);
  const nextProject = localizeProject(allProjects[(projectIndex + 1) % allProjects.length] ?? fallbackProjects[0], lang);
  const sourceGallery = project.gallery?.length ? project.gallery : [];
  const gallery = sourceGallery.filter(
    (image, index) => image !== project.cover && sourceGallery.indexOf(image) === index,
  );
  const intro = project.summary;
  const narrative = c.narrative(project.location);
  // A written story (overview, what the renders show, FAQs) when the project has one; see project-stories.ts.
  const story = getProjectStory(source.slug, lang);
  const storyLabels = projectStoryLabels[lang];
  const sourceRegion = regionList.find((region) => region.projectSlugs.includes(source.slug));
  const region = sourceRegion ? localizeRegion(sourceRegion, lang) : undefined;

  const specs = [
    [dict.common.client, dict.common.nonDisclosed],
    [dict.common.location, project.location],
    [dict.common.typology, story?.typology ?? (source.category === "Interior Design" ? dict.common.hospitalityInterior : dict.common.hospitalityResidential)],
    [dict.common.area, dict.common.projectSpecific],
  ];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          creativeWorkJsonLd(
            { ...project, summary: story?.seo.description ?? project.summary, images: [project.cover, ...gallery] },
            lang,
          ),
          localizedBreadcrumb(lang, [
            { name: pc.home, path: "/" },
            { name: pc.breadcrumbName, path: "/projects" },
            { name: project.title, path: `/projects/${project.slug}` },
          ]),
        ])}
      />

      <section className="relative flex h-[100svh] min-h-[32rem] items-end overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
        <Image
          src={project.cover}
          alt={projectCoverAlt(project, lang)}
          fill
          priority
          quality={90}
          sizes="(max-width: 640px) 400vw, (max-width: 900px) 250vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/38" />
        <div className="container-page relative w-full pb-14 pt-32 md:pb-16">
          <Reveal><p className="eyebrow mb-8 text-paper/70">/ {project.location}</p></Reveal>
          <Reveal delay={0.05}><h1 className={`max-w-6xl break-words text-[clamp(3rem,13vw,7.75rem)] font-medium uppercase leading-[.83] tracking-[-.065em]${arClass(lang, "rtl:leading-[1.2]")}`}>{project.title}</h1></Reveal>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 md:grid-cols-[2fr_1fr] md:gap-16 md:py-32">
        <div>
          <Reveal><p className="max-w-4xl text-[clamp(1.65rem,2.7vw,2.8rem)] leading-[1.12] tracking-[-.035em]">{intro}</p></Reveal>
          {/* The generic paragraph is the same on every project; a project with its own story replaces it. */}
          {!story && <Reveal delay={0.05}><p className="section-body mt-10 max-w-3xl">{narrative}</p></Reveal>}
        </div>
        <Reveal delay={0.08}>
          <div><p className="eyebrow mb-6 text-muted">/ {dict.common.keySpecs}</p>{specs.map(([label, value]) => <div key={label} className="grid grid-cols-[8rem_1fr] border-t border-line py-4"><p className="eyebrow text-muted">{label}</p><p className="text-sm">{value}</p></div>)}</div>
        </Reveal>
      </section>

      {story && (
        <section className="container-page grid gap-12 pb-16 md:grid-cols-[2fr_1fr] md:gap-16 md:pb-32">
          <div>
            <Reveal><h2 className="section-heading max-w-3xl">{story.heading}</h2></Reveal>
            {story.paragraphs.map((text) => (
              <Reveal key={text} delay={0.05}><p className="section-body mt-6 max-w-3xl">{linkedText(text, lang)}</p></Reveal>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        // The story section above already ends with bottom padding, so the gallery does not add its own top padding.
        <section className={`container-page ${story ? "pb-16 md:pb-32" : "py-16 md:py-32"}`}>
          <Reveal>
            {story ? (
              <div className="eyebrow mb-10 text-muted"><span aria-hidden="true">/ </span><h2 className="inline">{storyLabels.showcase(project.title)}</h2></div>
            ) : (
              <p className="eyebrow mb-10 text-muted">/ {dict.common.gallery}</p>
            )}
          </Reveal>
          <div className="grid gap-10 md:grid-cols-2 md:gap-8">
            {gallery.map((image, index) => {
              // A story describes each image: the caption under it and its alt text.
              const view = story?.views.find((item) => item.image === image);
              return (
                <Reveal key={image} delay={(index % 2) * 0.05} className={index % 3 === 0 ? "md:col-span-2" : ""}>
                  <figure>
                    {/* A captioned image gets a 16:9 box (the shape of the renders), so the caption sits right under the picture instead of under empty letterbox space. */}
                    <div className={`motion-media relative ${view ? "aspect-video" : index % 3 === 0 ? "aspect-[1.75]" : "aspect-[1.25]"}`}>
                      <Image
                        src={image}
                        alt={view?.alt ?? projectGalleryAlt(project, lang, index + 1)}
                        fill
                        unoptimized
                        sizes={index % 3 === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                        className="object-contain"
                      />
                    </div>
                    {view && (
                      <figcaption className="mt-4 max-w-xl">
                        <span className="eyebrow block text-muted">{view.title}</span>
                        <span className="mt-2 block text-sm">{view.text}</span>
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {story && (
        <>
          {/* Same FAQ and button markup as the service pages (ServiceDetailView), so the two read the same. */}
          <section className="container-page py-16 md:py-28">
            <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(story.faqs))} />
            <Reveal><div className="eyebrow mb-10 text-muted"><span aria-hidden="true">/ </span><h2 className="inline">{storyLabels.faqs(project.title)}</h2></div></Reveal>
            <div className="ms-auto max-w-4xl border-t border-line">
              {story.faqs.map((item) => (
                <details key={item.question} className="group border-b border-line py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-8 text-lg"><span>{item.question}</span><span className="text-accent transition-transform group-open:rotate-45">+</span></summary>
                  <p className="section-body max-w-2xl pt-5">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="container-page pb-4 md:pb-8">
            <Reveal><p className="eyebrow mb-10 text-muted">{`/ ${storyLabels.related}`}</p></Reveal>
            <Reveal delay={0.05}>
              <div className="flex flex-wrap gap-3">
                <Link href={localeHref(lang, story.service.path)} className="button-pill text-ink">{story.service.label}</Link>
                {region && <Link href={localeHref(lang, region.path)} className="button-pill text-ink">{region.h1}</Link>}
              </div>
            </Reveal>
          </section>
          {/* Same block as the home page's "Get in touch", with this project's line. */}
          <ContactCta lang={lang} dict={dict} content={story.cta} />
        </>
      )}

      {/* Next project as a full-width banner, like "Next service" on the service pages. The whole banner
          links to the next project (stretched link); "Back to all projects" sits above it as its own link. */}
      <section className="group relative min-h-[18rem] overflow-hidden bg-ink text-paper md:min-h-[24rem]">
        <Image src={nextProject.cover} alt="" fill quality={75} sizes="100vw" className="object-cover opacity-35 transition-transform duration-700 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="container-page relative flex min-h-[18rem] flex-col justify-center gap-8 py-14 md:min-h-[24rem] md:flex-row md:items-end md:justify-between md:py-16">
          <div>
            <p className="eyebrow mb-8 text-paper/55">{`/ ${dict.common.nextProject}`}</p>
            <Link href={localeHref(lang, `/projects/${nextProject.slug}`)} className="after:absolute after:inset-0 after:content-['']">
              {/* Not a heading: the next project is another page's topic. */}
              <span className="block text-[clamp(2.5rem,5vw,5rem)] leading-none tracking-[-.05em]">{nextProject.title}</span>
              <span className="mt-4 block text-sm text-paper/70">{nextProject.location}</span>
            </Link>
          </div>
          <Link href={localeHref(lang, "/projects")} className="button-pill relative z-10 text-paper">{dict.common.backToAllProjects}</Link>
        </div>
      </section>
    </article>
  );
}
