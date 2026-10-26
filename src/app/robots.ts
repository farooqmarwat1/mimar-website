import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// Crawlers obey only the most specific user-agent group that matches them, so a
// bot-specific group does not inherit the "*" disallow list. Repeat it on every
// group (the staff portal must stay out of reach of AI crawlers too).
// /ar (the Arabic site) is deliberately crawlable: nothing under it is blocked.
const blocked = ["/studio", "/admin", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: blocked },
      // Explicitly welcome AI/answer-engine crawlers (GEO) - same access as
      // regular search bots, since llms.txt + JSON-LD is written for them.
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/admin"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin"] },
      { userAgent: "Google-Extended", allow: "/", disallow: ["/admin"] },
      { userAgent: "CCBot", allow: "/", disallow: ["/admin"] },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
