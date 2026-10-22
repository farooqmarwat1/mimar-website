import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { contact } from "@/lib/site-config";
import { getOpenJobs } from "@/lib/jobs";

// Open roles come from Firestore (managed in /admin/jobs). The admin actions
// refresh this page on every change; the hourly revalidate is only a safety net.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Careers | Mimar Studios",
  description:
    "Join Mimar Studios - a multidisciplinary team of architects, visualizers and designers working on projects across 14+ countries.",
  path: "/careers",
  keywords: ["Mimar Studios careers", "architecture jobs Islamabad", "3D visualization jobs"],
});

const values = [
  ["Craft first", "Every render, animation and drawing carries the studio's name. We'd rather do fewer projects well than many projects fast."],
  ["Learn on real work", "Team members from Pakistan, Turkey and Egypt work side by side on live client projects, not internal exercises."],
  ["Ownership", "Small project teams mean your work is visible - from first concept to what the client actually sees."],
];

const modeLabel = { onsite: "On-site", hybrid: "Hybrid", remote: "Remote" } as const;
const typeLabel = { "full-time": "Full-time", "part-time": "Part-time", contract: "Contract", internship: "Internship", temporary: "Temporary" } as const;

export default async function CareersPage() {
  const jobs = await getOpenJobs();

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }]),
        ])}
      />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">/ Careers</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="page-heading max-w-3xl">
            Build the studio <span className="text-accent">alongside us.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-2xl">
            Mimar Studios is a multidisciplinary team of architects, 3D artists, animators and designers based in
            Islamabad, working with clients across 14+ countries. We hire in waves as project load demands rather
            than keeping a running list open - the fastest way to be considered is to reach out directly with your
            portfolio.
          </p>
        </Reveal>
      </div>

      <div className="container-page mt-16 border-t border-line">
        {values.map(([title, body], index) => (
          <Reveal key={title} delay={Math.min(index * 0.05, 0.15)}>
            <div className="motion-row grid gap-4 border-b border-line py-8 md:grid-cols-[14rem_1fr]">
              <p className="eyebrow text-muted">{title}</p>
              <p className="max-w-2xl text-lg leading-relaxed">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {jobs.length > 0 && (
        <section className="container-page mt-16" aria-labelledby="open-roles-heading">
          <Reveal>
            <p className="eyebrow mb-6 text-muted">/ {jobs.length} open {jobs.length === 1 ? "role" : "roles"}</p>
            <h2 id="open-roles-heading" className="section-heading">Open roles</h2>
          </Reveal>
          <ul className="mt-8 border-t border-line">
            {jobs.map((job, index) => (
              <li key={job.id}>
                <Reveal delay={Math.min(index * 0.05, 0.15)}>
                  <Link
                    href={`/careers/${job.slug}`}
                    className="motion-row group grid gap-4 border-b border-line py-8 md:grid-cols-[14rem_1fr_auto] md:items-start"
                  >
                    <p className="eyebrow text-muted">
                      {job.department}
                      <br />
                      {job.location} · {modeLabel[job.workMode]}
                    </p>
                    <div>
                      <h3 className="text-2xl font-medium tracking-[-.03em] group-hover:text-accent">{job.title}</h3>
                      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{job.summary}</p>
                      <p className="eyebrow mt-4 text-muted">{typeLabel[job.employmentType]}</p>
                    </div>
                    <span className="eyebrow text-accent">View role →</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="container-page mt-16">
        <Reveal>
          {jobs.length > 0 ? (
            <p className="section-body max-w-xl">
              Don&apos;t see the right role? Send your portfolio and CV to{" "}
              <a href={`mailto:${contact.email}`} className="text-accent hover:underline">{contact.email}</a> and we&apos;ll keep it on file.
            </p>
          ) : (
            <p className="section-body max-w-xl">
              No open roles are posted here right now. If you&apos;d like to be considered when a position opens, send your
              portfolio and CV to <a href={`mailto:${contact.email}`} className="text-accent hover:underline">{contact.email}</a>.
            </p>
          )}
        </Reveal>
        <Reveal delay={0.05}>
          <Link href="/contact" className="button-pill mt-8 text-ink">Get in touch</Link>
        </Reveal>
      </div>
    </div>
  );
}
