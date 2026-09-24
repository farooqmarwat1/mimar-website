"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ViewportVideo from "@/components/ui/ViewportVideo";
import type { Project } from "@/lib/site-config";

// Homepage-only motion covers. Project detail pages continue to use each
// project's original still cover and gallery imagery.
const homeProjectVideos: Record<string, string> = {
  "aark-residences": "/projects/home-videos/aark-residences.mp4",
  "amerat-park": "/projects/home-videos/amerat-park.mp4",
  "nana-222": "/projects/home-videos/nana-222.mp4",
  "nomi-downtown": "/projects/home-videos/nomi-downtown.mp4",
  "faisal-town-ii": "/projects/home-videos/faisal-town-ii.mp4",
  abuja: "/projects/home-videos/abuja.mp4",
};

// Poster stills extracted directly from frame 0 of each corresponding video
// above (not the general project cover image) so there's no visible jump
// when playback starts.
const homeProjectPosters: Record<string, string> = {
  "aark-residences": "/projects/home-videos/aark-residences-poster.jpg",
  "amerat-park": "/projects/home-videos/amerat-park-poster.jpg",
  "nana-222": "/projects/home-videos/nana-222-poster.jpg",
  "nomi-downtown": "/projects/home-videos/nomi-downtown-poster.jpg",
  "faisal-town-ii": "/projects/home-videos/faisal-town-ii-poster.jpg",
  abuja: "/projects/home-videos/abuja-poster.jpg",
};

function ProjectTile({ project, className }: { project: Project; className?: string }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`motion-media group relative block w-full shrink-0 overflow-hidden rounded-2xl bg-ink/5 ${className ?? ""}`}
    >
      <ViewportVideo
        src={homeProjectVideos[project.slug]}
        poster={homeProjectPosters[project.slug]}
        label={`${project.title} animated architectural visualization by Mimar Studios`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="eyebrow text-paper/70">{project.location}</p>
        <p className="mt-1.5 text-lg tracking-tight text-paper">{project.title}</p>
      </div>
    </Link>
  );
}

// The motion lives HERE, on each column's own div, and nowhere else - this
// is the only element in the section that ever receives a `transform`.
function ParallaxColumn({
  projects,
  y,
  tileClassName,
}: {
  projects: Project[];
  y: MotionValue<number> | number;
  tileClassName: string;
}) {
  return (
    <motion.div style={{ y, willChange: "transform" }} className="flex flex-col gap-3">
      {projects.map((project) => (
        <ProjectTile key={project.slug} project={project} className={tileClassName} />
      ))}
    </motion.div>
  );
}

// Runs before paint on the client (so the mobile column split is applied
// without a visible flash of the desktop layout) while falling back to
// useEffect during SSR, where useLayoutEffect would warn.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Ported from the ParkView reference's CuratedSection.tsx.
 *
 * THE KEY STRUCTURAL DETAIL - `overflow-hidden` belongs on the SECTION
 * (wrapping intro + grid together), not on a wrapper around the grid alone.
 * That was the bug behind the "big empty white area": with the clip box
 * starting exactly at the grid's top edge, a column translating up by -750px
 * was immediately clipped against that edge, so the tiles could never
 * visually rise into the space the intro was vacating - they just got cut
 * off at the top while emptying out the bottom, leaving white in both
 * places. With the clip boundary raised to the section's top (far above the
 * intro, exactly as the reference has it), the columns genuinely travel up
 * into the intro's space and take it over, which is the whole effect.
 *
 * The intro itself stays plain: normal document flow, no transform, no
 * scroll-linked fade or blur. The reference doesn't blur its heading either
 * - its fade is on the logo marquee sitting directly above the grid, and
 * MimAR has no such element, so nothing here gets that treatment.
 *
 * Only ParallaxColumn's motion.div is ever transformed, so the intro never
 * shares a transformed/composited parent with the moving columns.
 */
export default function ProjectShowcase({ projects, intro }: { projects: Project[]; intro: string }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start 0.9", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Exact reference values and curve: sides fast, middle slow, held flat for
  // the first 10% of the grid's scroll progress then a straight ramp to the
  // target by the end. Same 768px breakpoint drives both these JS targets
  // and the grid-cols / column-visibility CSS below, so they never disagree.
  const fast = useTransform(scrollYProgress, [0, 0.1, 1], [0, 0, isMobile ? -300 : -750]);
  const slow = useTransform(scrollYProgress, [0, 0.1, 1], [0, 0, isMobile ? -80 : -200]);

  // Intro dissolve - an OVERLAP transition, not a scroll-out animation, so
  // the keyframes are derived from when the cards actually reach the text
  // rather than from the start of scrolling. Measured against the fast
  // columns (they lead the overlap) at desktop proportions:
  //   p 0.10  cards start moving, still ~80px below the description
  //   p 0.20  cards reach the description  -> fade begins
  //   p 0.32  cards reach the heading      -> heavily blurred
  //   p 0.52  cards fully cover the intro  -> opacity 0
  // Shifted later than the previous pass to track the wider gap now sitting
  // under the description - the dissolve stays pinned to the actual overlap
  // rather than to a fixed point in the scroll.
  const introOpacity = useTransform(scrollYProgress, [0.19, 0.32, 0.52], [1, 0.55, 0]);
  const introBlur = useTransform(
    scrollYProgress,
    [0.19, 0.32, 0.52],
    ["blur(0px)", "blur(5px)", "blur(14px)"],
  );

  // 3 columns of 2 on desktop, 2 columns of 3 on mobile. The reference
  // simply CSS-hides its third column below md, but it has 15 images to
  // spare - doing that here would drop 2 of only 6 projects off phones
  // entirely, so the same projects get redistributed instead of hidden.
  // Column count drives the grid-cols class below too, so the DOM and the
  // CSS can never disagree about how many columns exist.
  const columnCount = isMobile ? 2 : 3;
  const columns = Array.from({ length: columnCount }, (_, col) =>
    projects.filter((_, i) => i % columnCount === col),
  );
  const ys = [fast, slow, fast];

  return (
    // pt keeps the site's own section rhythm (matching .section-py) rather
    // than the reference's pt-16/sm:pt-32, so this section stays consistent
    // with every other section on the page.
    //
    // NO bottom padding / negative margin here. The reference's
    // pb-[500px]/-mb-[660px] pair netted the CTA ~160px ABOVE the grid's
    // document bottom - but `translateY` doesn't change document flow, and
    // the middle column only travels -200px *gradually*, so through most of
    // the scroll it hadn't yet cleared that offset and the last card
    // physically collided with the CTA. Ending the section at the grid's
    // natural bottom means the columns (which only ever move UP from there)
    // can never reach the CTA at any scroll position.
    <section className="relative overflow-hidden pt-12 sm:pt-16 md:pt-20">
      {/* z-0: sits UNDER the rising cards, so they take visual priority as
          it dissolves. */}
      <motion.div
        style={reduceMotion ? undefined : { opacity: introOpacity, filter: introBlur }}
        className="container-page relative z-0 mx-auto max-w-3xl text-center"
      >
        <p className="eyebrow text-ink/50">/ Portfolio</p>
        <h2 className="section-heading mx-auto mt-6">
          <span className="block text-ink">Selected Works of</span>
          <span className="block text-accent">Our Architecture Studio</span>
        </h2>
        <p className="section-body mx-auto mt-6 max-w-xl">{intro}</p>
      </motion.div>

      {/* Breathing room under the description. The reference's mt-2/sm:mt-10
          is tighter because its marquee sits in this gap; with nothing there,
          MimAR needs real spacing so the copy isn't crowded by the tiles.
          z-10 keeps the cards above the dissolving intro. */}
      <div ref={gridRef} className="container-page relative z-10 mt-10 sm:mt-16 md:mt-20">
        <div className={`grid gap-3 lg:gap-4 ${columnCount === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {columns.map((columnProjects, col) => (
            <ParallaxColumn
              key={col}
              projects={columnProjects}
              y={reduceMotion ? 0 : ys[col]}
              // Middle column runs taller, matching its slower travel.
              tileClassName={col === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
