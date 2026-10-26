import { NextResponse } from "next/server";
import { siteConfig, contact, contactPhones, offices, faqs, services } from "@/lib/site-config";
import { getProjects } from "@/lib/cms";
import { getBlogEntries } from "@/lib/blog-store";
import { servicePath } from "@/lib/service-details";
import { getOpenJobs } from "@/lib/jobs";
import { localizeServices, localizeProjects, localizedFaqs } from "@/lib/localized-site";
import { localeHref } from "@/i18n/config";

/**
 * llms.txt - an emerging convention (llmstxt.org) that gives AI assistants
 * and answer engines a concise, structured summary of a site, similar in
 * spirit to robots.txt/sitemap.xml but aimed at LLMs rather than crawlers.
 * Generated dynamically so it stays in sync with CMS content.
 */
export async function GET() {
  const [projects, openJobs, entries] = await Promise.all([getProjects(), getOpenJobs(), getBlogEntries()]);
  // Articles written in /admin first (newest first), then the migrated ones in their original order.
  const articles = [...entries].sort((a, b) => Number(a.legacy) - Number(b.legacy) || (a.legacy ? a.order - b.order : b.published.localeCompare(a.published)));

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `Founded ${siteConfig.foundingDate} at ${siteConfig.foundingLocation}.`,
    "Mimar Studios is led by founder Naqi Ejaz and works with architecture, real estate and design teams worldwide.",
    "",
    "## Contact",
    `- Email: ${contact.email}`,
    ...contactPhones.map((phone) => `- Phone (${phone.country}): ${phone.number}`),
    ...offices.map((office) => `- ${office.city} office: ${office.lines.join(", ")}`),
    `- Website: ${siteConfig.url}`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.title}](${siteConfig.url}${servicePath(s.slug)}): ${s.short}`),
    "",
    "## Selected projects",
    ...projects.map((p) => `- [${p.title}](${siteConfig.url}/projects/${p.slug}): ${p.summary}`),
    "",
    "## Insights and guides",
    ...articles.map((page) => `- [${page.title}](${siteConfig.url}${page.path}): ${page.description}`),
    "",
    ...(openJobs.length
      ? [
          "## Open roles",
          ...openJobs.map((job) => `- [${job.title}](${siteConfig.url}/careers/${job.slug}): ${job.summary}`),
          "",
        ]
      : []),
    "## Frequently asked questions",
    ...faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}\n`),
    "",
    "## Arabic version (العربية)",
    `The whole site is also available in Arabic under ${siteConfig.url}/ar (same paths, right-to-left).`,
    `- [الصفحة الرئيسية](${siteConfig.url}${localeHref("ar", "/")}): الصفحة الرئيسية لميمار ستوديوز`,
    ...localizeServices([...services], "ar").map(
      (s) => `- [${s.title}](${siteConfig.url}${localeHref("ar", servicePath(s.slug))}): ${s.short}`,
    ),
    ...localizeProjects(projects, "ar").map(
      (p) => `- [${p.title}](${siteConfig.url}${localeHref("ar", `/projects/${p.slug}`)}): ${p.summary}`,
    ),
    "",
    "## المقالات",
    ...articles.flatMap((page) =>
      page.titleAr ? [`- [${page.titleAr}](${siteConfig.url}${localeHref("ar", page.path)}): ${page.descriptionAr ?? ""}`] : [],
    ),
    "",
    ...localizedFaqs("ar").map((f) => `س: ${f.question}\nج: ${f.answer}\n`),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
