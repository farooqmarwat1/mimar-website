import { NextResponse } from "next/server";
import { siteConfig, contact, contactPhones, offices, faqs, services } from "@/lib/site-config";
import { getProjects } from "@/lib/cms";
import { legacySeoPages } from "@/lib/legacy-seo";

/**
 * llms.txt - an emerging convention (llmstxt.org) that gives AI assistants
 * and answer engines a concise, structured summary of a site, similar in
 * spirit to robots.txt/sitemap.xml but aimed at LLMs rather than crawlers.
 * Generated dynamically so it stays in sync with CMS content.
 */
export async function GET() {
  const projects = await getProjects();

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
    ...services.map((s) => `- [${s.title}](${siteConfig.url}/services/${s.slug}): ${s.short}`),
    "",
    "## Selected projects",
    ...projects.map((p) => `- [${p.title}](${siteConfig.url}/projects/${p.slug}): ${p.summary}`),
    "",
    "## Insights and guides",
    ...legacySeoPages.map((page) => `- [${page.title}](${siteConfig.url}${page.path}): ${page.description}`),
    "",
    "## Frequently asked questions",
    ...faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}\n`),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
