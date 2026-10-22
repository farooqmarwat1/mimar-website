import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import { blocksToHtml } from "@/lib/content-blocks";
import { getOpenJobs, getPublicJobBySlug, isJobLive } from "@/lib/jobs";
import { breadcrumbJsonLd, buildMetadata, jobPostingJsonLd, jsonLdScript } from "@/lib/seo";
import { contact } from "@/lib/site-config";

// Refreshed immediately by the admin actions; hourly is the safety net (also drops expired roles).
export const revalidate = 3600;

export async function generateStaticParams() {
  const jobs = await getOpenJobs();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublicJobBySlug(slug);
  if (!job) return {};

  return buildMetadata({
    title: `${job.title} - ${job.location} | Careers at Mimar Studios`,
    description: job.summary,
    path: `/careers/${job.slug}`,
    // A role that has closed or expired stays reachable for people holding the link,
    // but must drop out of search.
    noIndex: !isJobLive(job),
  });
}

const modeLabel = { onsite: "On-site", hybrid: "Hybrid", remote: "Remote" } as const;
const typeLabel = { "full-time": "Full-time", "part-time": "Part-time", contract: "Contract", internship: "Internship", temporary: "Temporary" } as const;
const periodLabel = { hour: "hour", day: "day", week: "week", month: "month", year: "year" } as const;

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getPublicJobBySlug(slug);
  if (!job) notFound();

  const live = isJobLive(job);
  const applyHref =
    job.applyMethod === "url"
      ? job.applyUrl
      : `mailto:${job.applyEmail || contact.email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`;

  const facts: [string, string][] = [
    ["Department", job.department],
    ["Location", `${job.location}, ${job.country}`],
    ["Work mode", modeLabel[job.workMode]],
    ["Type", typeLabel[job.employmentType]],
    ...(job.experienceLevel ? ([["Experience", job.experienceLevel]] as [string, string][]) : []),
    ...(job.salary
      ? ([
          [
            "Salary",
            `${job.salary.currency} ${[job.salary.min, job.salary.max].filter((n) => n !== undefined).map((n) => n!.toLocaleString("en-US")).join(" – ")} / ${periodLabel[job.salary.period]}`,
          ],
        ] as [string, string][])
      : []),
    ...(job.validThrough && live ? ([["Apply by", job.validThrough]] as [string, string][]) : []),
  ];

  return (
    <div className="pb-24 pt-32 md:pb-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
            { name: job.title, path: `/careers/${job.slug}` },
          ]),
          // JobPosting only while the role is genuinely open (SEO_MIGRATION.md section 7).
          ...(live
            ? [
                jobPostingJsonLd({
                  ...job,
                  descriptionHtml: `<p>${job.summary.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>${blocksToHtml(job.blocks)}`,
                }),
              ]
            : []),
        ])}
      />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow mb-6 text-muted">
            <Link href="/careers" className="hover:text-ink">/ Careers</Link> / {job.department}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="page-heading max-w-4xl">{job.title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-2xl">{job.summary}</p>
        </Reveal>
        {!live && (
          <Reveal delay={0.12}>
            <p role="status" className="mt-8 max-w-2xl border border-line p-5 text-lg leading-relaxed">
              This position is no longer open. See our <Link href="/careers" className="text-accent hover:underline">current openings</Link> or send your portfolio to{" "}
              <a href={`mailto:${contact.email}`} className="text-accent hover:underline">{contact.email}</a>.
            </p>
          </Reveal>
        )}
      </div>

      <div className="container-page mt-16 grid gap-12 border-t border-line pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <aside>
          <dl className="grid gap-5">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="eyebrow text-muted">{label}</dt>
                <dd className="mt-1.5 text-lg">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <div className="max-w-3xl">
          {job.blocks.map((block, index) => {
            if (block.type === "h2") return <h2 key={index} className="mb-6 mt-14 text-3xl font-medium leading-tight tracking-[-.035em] first:mt-0 md:text-4xl">{block.text}</h2>;
            if (block.type === "h3") return <h3 key={index} className="mb-4 mt-10 text-2xl font-medium leading-tight tracking-[-.025em]">{block.text}</h3>;
            if (block.type === "li") return <p key={index} className="section-body ml-5 mt-3 before:-ml-5 before:mr-3 before:text-accent before:content-['•']">{block.text}</p>;
            return <p key={index} className="section-body mt-6">{block.text}</p>;
          })}

          {live && applyHref && (
            <div className="mt-14">
              <a
                href={applyHref}
                className="button-pill text-ink"
                {...(job.applyMethod === "url" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                Apply for this role
              </a>
              {job.applyMethod === "email" && (
                <p className="mt-4 text-sm text-muted">
                  Opens your email app. Attach your CV and portfolio and send to{" "}
                  <a href={applyHref} className="text-accent hover:underline">{job.applyEmail || contact.email}</a>.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
