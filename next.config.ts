import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// NODE_ENV is "production" for Vercel preview builds too, so it cannot tell a
// preview apart from the real production deployment. VERCEL_ENV can:
// "production" | "preview" | "development". Guard on VERCEL so a self-hosted
// production build (where VERCEL_ENV is undefined) is never noindexed by mistake.
const isNonProductionDeployment = process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "production";

// Sanity's CDN + Studio API need explicit allowances; keep this list tight
// and update it if new third-party origins (analytics, fonts, etc.) are added.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // lh3.googleusercontent.com is where drive.google.com/thumbnail redirects
  // to - needed for DriveVideo's poster image (src/components/ui/DriveVideo.tsx).
  "img-src 'self' data: blob: https://cdn.sanity.io https://drive.google.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.api.sanity.io https://*.sanity.io",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://drive.google.com https://online.fliphtml5.com https://koalendar.com https://www.canva.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
]
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Old mim.archi HMR tour URLs whose Pano2VR files live in public/tours/hmr/{unit}.
const hmrTourUnits = "one-bedroom|two-bedroom|three-bedroom|four-bedroom|penthouse|townhouse";

// Other Pano2VR tours restored from the old site's wp-content/uploads:
// [old URL, folder under public/tours]. Keep in sync with legacyTourPaths in src/app/sitemap.ts.
const legacyTours = [
  ["/tours/aurumone/2-bed-apartment", "aurumone/2-bed-apartment"],
  ["/tours/aurumone/3-bed-apartment", "aurumone/3-bed-apartment"],
  ["/tours/the360residences/one-bed", "the360residences/one-bed"],
  ["/tours/the360residences/two-bed", "the360residences/two-bed"],
  ["/tours/the360residences/loft", "the360residences/loft"],
  ["/ud-courtyard-type-a", "ud-courtyard/type-a"],
  ["/ud-courtyard-type-b", "ud-courtyard/type-b"],
  ["/ud-courtyard-type-c", "ud-courtyard/type-c"],
  ["/ud-courtyard-type-d", "ud-courtyard/type-d"],
  ["/gardenialivings-onebed", "gardenialivings/onebed"],
  ["/gardenialivings-twobed", "gardenialivings/twobed"],
] as const;
// Tour folders the /tours/* catch-all redirect must leave alone so their files still load.
const servedTourFolders = [`hmr/(?:${hmrTourUnits})`, ...legacyTours.map(([, folder]) => folder)].join("|");

// The MIMAR CRM Portal is a separate app on its own Vercel project. It used to
// be wired up by a Cloudflare Worker on the route *mim.archi/portal*, which only
// ran while the mim.archi DNS record was proxied (orange cloud). Pointing the
// record straight at Vercel (DNS only) stopped that Worker and took /portal
// down, so the routing now lives here instead - Vercel to Vercel, no Cloudflare
// hop. Keep these paths reserved: nothing on the main site may use them.
const portalOrigin = "https://mimar-crm-portal.vercel.app";
const portalPathPrefixes = ["portal", "api/v1", "__/auth"] as const;
// Negative lookahead so the main site's security headers skip the portal paths.
// `.*` can match the empty string, so "/" itself still matches this rule.
const nonPortalPaths = `/:path((?!${portalPathPrefixes.join("|")}).*)`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "drive.google.com", pathname: "/thumbnail" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
  },
  async headers() {
    return [
      // Portal paths are excluded: the strict CSP (connect-src 'self',
      // frame-ancestors 'none') and X-Frame-Options: DENY break Firebase login,
      // the 3D tours and partner iframe embeds on the portal app.
      { source: nonPortalPaths, headers: securityHeaders },
      // Keep the Vercel staging URLs out of search while mim.archi serves the old site.
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // The host rule above only covers *.vercel.app. This covers the same
      // deployments by environment instead, so a preview served from any other
      // hostname (a staging custom domain, a branch alias) is still noindexed.
      // Production builds are untouched, so mim.archi stays indexable.
      ...(isNonProductionDeployment
        ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
        : []),
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mim.archi" }],
        destination: "https://mim.archi/:path*",
        permanent: true,
      },
      { source: "/our-portfolio", destination: "/projects", permanent: true },
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      // The old /meta hub and /meta/app/edtech are real pages. Other nested legacy
      // /meta paths still need individual content decisions, so keep their redirect.
      { source: "/meta/:path((?!app/edtech$).+)", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/real-estate-360-tours", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/interior-design-services", destination: "/services/architectural-design/interior-design-services", permanent: true },
      // 3d-views and cinematics are real pages again (src/app/services/3d-visualization/[slug]).
      // The flat /services/cinematics URL now redirects to the nested one below.
      { source: "/services/cinematics", destination: "/services/3d-visualization/cinematics", permanent: true },
      { source: "/services/3d-visualization/property-explorer", destination: "/services/interactive-services/property-explorer", permanent: true },
      { source: "/services/3d-visualization/property-explorer-online", destination: "/services/interactive-services/property-explorer", permanent: true },
      // terrain-mapping, 3d-on-plan and 3d-on-construction-site are real pages again
      // (src/app/services/3d-visualization-hamza/*).
      { source: "/services/3d-visualization-hamza", destination: "/services/3d-visualization", permanent: true },
      { source: "/services/3d-visualization-hamza/:path((?!(?:terrain-mapping|3d-on-plan|3d-on-construction-site)$).+)", destination: "/services/3d-visualization", permanent: true },
      // Interactive sub-services live under /services/interactive-services, as on the old site.
      { source: "/services/vr-360-tours", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/services/web-tours", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/services/dual-screen-navigator", destination: "/services/interactive-services/dual-screen-navigator", permanent: true },
      { source: "/services/interactive-prints", destination: "/services/interactive-services/interactive-prints", permanent: true },
      { source: "/services/property-explorer", destination: "/services/interactive-services/property-explorer", permanent: true },
      { source: "/services/smart-home", destination: "/services/interactive-services/smart-home", permanent: true },
      // architectural-design-services, interior-design-services, urban-planning
      // and smart-topography-survey are real pages again
      // (src/app/services/architectural-design/[slug]), and so is
      // smart-topography-survey's child sample-spatial-data
      // (src/lib/legacy-service-pages.ts). The exact smart-topography-survey
      // URL is unmatched here and falls through to the dynamic route; any
      // other nested path still redirects to the parent.
      { source: "/services/architectural-design/smart-topography-survey/:path((?!sample-spatial-data$).+)", destination: "/services/architectural-design", permanent: true },
      // tv-commercials-and-advertisements is a real page again.
      // The Digital Marketing, Social Media Marketing, Web Development and SEO sub-pages
      // are real pages too (src/lib/branding-marketing-sub-services.ts).
      { source: "/services/marketing/:path((?!(?:tv-commercials-and-advertisements|digital-marketing|social-media-marketing|web-development|seo)$).+)", destination: "/services/marketing", permanent: true },
      // Renamed 2026-08: service slugs/names were realigned to match the
      // pre-migration mim.archi site (see legacy /services/* redirects
      // above) to preserve historical SEO equity. These carry forward the
      // short-lived interim slugs used between the Next.js relaunch and
      // this rename so nothing freshly indexed or linked breaks.
      { source: "/services/3d-rendering", destination: "/services/3d-visualization", permanent: true },
      { source: "/services/animation", destination: "/services/3d-visualization/cinematics", permanent: true },
      { source: "/services/vr-and-360", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/services/web-360", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/services/dual-screen", destination: "/services/interactive-services/dual-screen-navigator", permanent: true },
      { source: "/magnetic-field-of-solenoid", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/galvanic-cell", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      // Restored 360 tours are served from public/tours/* (see rewrites below);
      // their files must not be caught by this redirect. Every other tour still redirects.
      { source: "/tours", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: `/tours/:path((?!(?:${servedTourFolders})(?:/.*)?$).*)`, destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/book-appointment", destination: "/contact", permanent: true },
      { source: "/cancel-appointment", destination: "/contact", permanent: true },
      { source: "/appointment-cancellation-confirmation", destination: "/contact", permanent: true },
      { source: "/category/services", destination: "/services", permanent: true },
      { source: "/category/3d-visualization", destination: "/blog/3d-visualization", permanent: true },
      { source: "/category/technology", destination: "/blog/real-estate-tech", permanent: true },
      { source: "/category/meta/:path*", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/category/blog/real-estate-tech", destination: "/blog/real-estate-tech", permanent: true },
      { source: "/category/blog", destination: "/blog", permanent: true },
      { source: "/blog/top-7-elements-of-interior-design", destination: "/blog/elements-in-interior-design", permanent: true },
      { source: "/blog/best-ways-to-sell-your-real-estate", destination: "/technology/best-ways-to-sell-your-real-estate", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // These must run before the filesystem and before dynamic routes:
      // src/app/[...legacy] sets dynamicParams = false, so an unmatched /portal
      // path would 404 here instead of reaching the portal app.
      beforeFiles: [
        { source: "/portal", destination: `${portalOrigin}/portal` },
        { source: "/portal/:path*", destination: `${portalOrigin}/portal/:path*` },
        // Not covered by the old Cloudflare Worker, which is why portal signup
        // and invite emails were broken on mim.archi.
        { source: "/api/v1/:path*", destination: `${portalOrigin}/api/v1/:path*` },
        { source: "/__/auth/:path*", destination: `${portalOrigin}/__/auth/:path*` },
      ],
      // Returning a bare array behaves exactly like afterFiles, so moving the
      // existing rewrites here keeps their current behaviour unchanged.
      afterFiles: [
        // Pano2VR exports: serve each tour's index.html at the old URL. The page
        // sets <base href> so its relative files resolve without a trailing slash.
        { source: `/tours/hmr/:unit(${hmrTourUnits})`, destination: "/tours/hmr/:unit/index.html" },
        ...legacyTours.map(([source, folder]) => ({ source, destination: `/tours/${folder}/index.html` })),
        // The backlinked company profile keeps both old URLs. The file lives at
        // public/storage/... because Vercel's firewall denies /wp-content/* until
        // that rule is relaxed in the Vercel dashboard.
        {
          source: "/wp-content/uploads/2021/11/mimAR-Studios-Company-Profile.pdf",
          destination: "/storage/2021/11/mimAR-Studios-Company-Profile.pdf",
        },
      ],
    };
  },
};

export default nextConfig;
