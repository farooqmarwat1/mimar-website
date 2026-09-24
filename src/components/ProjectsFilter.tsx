import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { type Project } from "@/lib/site-config";

export default function ProjectsFilter({ projects }: { projects: Project[] }) {
  return (
    <div>
      <div className="container-page grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 md:grid-cols-3 md:gap-x-12 md:gap-y-20">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={(i % 3) * 0.06}>
            <Link href={`/projects/${project.slug}`} className="group block">
              <div className="relative aspect-video w-full overflow-hidden bg-ink/5">
                <Image
                  src={project.cover}
                  alt={`${project.title} by Mimar Studios`}
                  fill
                  preload={i < 3}
                  quality={85}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
              </div>
              <div className="mt-4 border-t border-line pt-4">
                <h2 className="text-lg font-medium tracking-[-.025em]">{project.title}</h2>
                <p className="mt-1 text-sm">{project.location}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
