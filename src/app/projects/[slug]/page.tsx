import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, creativeWorkJsonLd, jsonLdScript } from "@/lib/seo";
import { getProjectBySlug, getProjects } from "@/lib/cms";
import { projects as fallbackProjects } from "@/lib/site-config";

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

  const projectIndex = allProjects.findIndex((item) => item.slug === project.slug);
  const nextProject = allProjects[(projectIndex + 1) % allProjects.length] ?? fallbackProjects[0];
  const sourceGallery = project.gallery?.length ? project.gallery : [];
  const gallery = sourceGallery.filter(
    (image, index) => image !== project.cover && sourceGallery.indexOf(image) === index,
  );
  const intro = project.summary;
  const narrative = `The project was developed as a focused design study, balancing the character of ${project.location} with a clear material and spatial direction. Every view was composed to communicate the design before delivery.`;

  const specs = [
    ["Client", "Non-disclosed"],
    ["Location", project.location],
    ["Typology", project.category === "Interior Design" ? "Hospitality / Interior" : "Hospitality / Residential"],
    ["Area", "Project specific"],
  ];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          creativeWorkJsonLd(project),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: project.title, path: `/projects/${project.slug}` },
          ]),
        ])}
      />

      <section className="relative flex h-[100svh] min-h-[32rem] items-end overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
        <Image
          src={project.cover}
          alt={`${project.title} by Mimar Studios`}
          fill
          priority
          quality={90}
          sizes="(max-width: 640px) 400vw, (max-width: 900px) 250vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/38" />
        <div className="container-page relative w-full pb-14 pt-32 md:pb-16">
          <Reveal><p className="eyebrow mb-8 text-paper/70">/ {project.location}</p></Reveal>
          <Reveal delay={0.05}><h1 className="max-w-6xl break-words text-[clamp(3rem,13vw,7.75rem)] font-medium uppercase leading-[.83] tracking-[-.065em]">{project.title}</h1></Reveal>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 md:grid-cols-[2fr_1fr] md:gap-16 md:py-32">
        <div>
          <Reveal><p className="max-w-4xl text-[clamp(1.65rem,2.7vw,2.8rem)] leading-[1.12] tracking-[-.035em]">{intro}</p></Reveal>
          <Reveal delay={0.05}><p className="section-body mt-10 max-w-3xl">{narrative}</p></Reveal>
        </div>
        <Reveal delay={0.08}>
          <div><p className="eyebrow mb-6 text-muted">/ Key specs</p>{specs.map(([label, value]) => <div key={label} className="grid grid-cols-[8rem_1fr] border-t border-line py-4"><p className="eyebrow text-muted">{label}</p><p className="text-sm">{value}</p></div>)}</div>
        </Reveal>
      </section>

      {gallery.length > 0 && (
        <section className="container-page py-16 md:py-32">
          <Reveal><p className="eyebrow mb-10 text-muted">/ Gallery</p></Reveal>
          <div className="grid gap-10 md:grid-cols-2 md:gap-8">
            {gallery.map((image, index) => (
              <Reveal key={image} delay={(index % 2) * 0.05} className={index % 3 === 0 ? "md:col-span-2" : ""}>
                <div className={`motion-media relative ${index % 3 === 0 ? "aspect-[1.75]" : "aspect-[1.25]"}`}>
                  <Image
                    src={image}
                    alt={`${project.title} project view ${index + 1}`}
                    fill
                    unoptimized
                    sizes={index % 3 === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                    className="object-contain"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-page grid items-center gap-12 py-16 md:min-h-[34rem] md:grid-cols-2 md:py-32">
        <Reveal className="order-2 md:order-1">
          <div>
            <p className="eyebrow mb-8 text-muted md:mb-14">/ Next project</p>
            <Link href={`/projects/${nextProject.slug}`} className="group block">
              <h2 className="text-[clamp(2.75rem,5vw,5.5rem)] leading-none tracking-[-.055em] transition-colors group-hover:text-accent">{nextProject.title}</h2>
              <p className="mt-5 text-sm text-muted">{nextProject.location}</p>
            </Link>
            <Link href="/projects" className="button-pill mt-10 text-ink md:mt-12">Back to all projects</Link>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="order-1 md:order-2"><Link href={`/projects/${nextProject.slug}`} className="group block"><div className="relative aspect-video overflow-hidden bg-ink/5"><Image src={nextProject.cover} alt={`${nextProject.title} by Mimar Studios`} fill quality={85} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" /></div></Link></Reveal>
      </section>
    </article>
  );
}
