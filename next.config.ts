import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Sanity's CDN + Studio API need explicit allowances; keep this list tight
// and update it if new third-party origins (analytics, fonts, etc.) are added.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://drive.google.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.api.sanity.io https://*.sanity.io",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://drive.google.com https://online.fliphtml5.com https://koalendar.com",
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
      { source: "/:path*", headers: securityHeaders },
      // Keep the Vercel staging URLs out of search while mim.archi serves the old site.
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
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
      // The old /meta hub is now a real page. Nested legacy /meta paths still
      // need individual content decisions, so keep their existing redirect.
      { source: "/meta/:path+", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/real-estate-360-tours", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/interior-design-services", destination: "/services/architectural-design/interior-design-services", permanent: true },
      { source: "/services/3d-visualization/3d-views", destination: "/services/3d-visualization", permanent: true },
      { source: "/services/3d-visualization/cinematics", destination: "/services/cinematics", permanent: true },
      { source: "/services/3d-visualization/property-explorer", destination: "/services/interactive-services/property-explorer", permanent: true },
      { source: "/services/3d-visualization/property-explorer-online", destination: "/services/interactive-services/property-explorer", permanent: true },
      // terrain-mapping is a real page again (src/app/services/3d-visualization-hamza/terrain-mapping).
      { source: "/services/3d-visualization-hamza", destination: "/services/3d-visualization", permanent: true },
      { source: "/services/3d-visualization-hamza/:path((?!terrain-mapping$).+)", destination: "/services/3d-visualization", permanent: true },
      // Interactive sub-services live under /services/interactive-services, as on the old site.
      { source: "/services/vr-360-tours", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/services/web-tours", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/services/dual-screen-navigator", destination: "/services/interactive-services/dual-screen-navigator", permanent: true },
      { source: "/services/interactive-prints", destination: "/services/interactive-services/interactive-prints", permanent: true },
      { source: "/services/property-explorer", destination: "/services/interactive-services/property-explorer", permanent: true },
      { source: "/services/smart-home", destination: "/services/interactive-services/smart-home", permanent: true },
      // architectural-design-services, interior-design-services and urban-planning
      // are real pages again (src/app/services/architectural-design/[slug]);
      // smart-topography-survey still redirects; its sample-spatial-data child is a real page.
      { source: "/services/architectural-design/smart-topography-survey", destination: "/services/architectural-design", permanent: true },
      { source: "/services/architectural-design/smart-topography-survey/:path((?!sample-spatial-data$).+)", destination: "/services/architectural-design", permanent: true },
      // tv-commercials-and-advertisements is a real page again.
      { source: "/services/marketing/:path((?!tv-commercials-and-advertisements$).+)", destination: "/services/marketing", permanent: true },
      // Renamed 2026-08: service slugs/names were realigned to match the
      // pre-migration mim.archi site (see legacy /services/* redirects
      // above) to preserve historical SEO equity. These carry forward the
      // short-lived interim slugs used between the Next.js relaunch and
      // this rename so nothing freshly indexed or linked breaks.
      { source: "/services/3d-rendering", destination: "/services/3d-visualization", permanent: true },
      { source: "/services/animation", destination: "/services/cinematics", permanent: true },
      { source: "/services/vr-and-360", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/services/web-360", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/services/dual-screen", destination: "/services/interactive-services/dual-screen-navigator", permanent: true },
      { source: "/magnetic-field-of-solenoid", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      { source: "/galvanic-cell", destination: "/services/interactive-services/vr-360-tours", permanent: true },
      // The six HMR 360 tours are served from public/tours/hmr/{unit} (see rewrites below);
      // their files must not be caught by this redirect. Every other tour still redirects.
      { source: "/tours", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: `/tours/:path((?!hmr/(?:${hmrTourUnits})(?:/.*)?$).*)`, destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/gardenialivings-twobed", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/gardenialivings-onebed", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/ud-courtyard-type-:unit", destination: "/services/interactive-services/web-tours", permanent: true },
      { source: "/book-appointment", destination: "/contact", permanent: true },
      { source: "/my-bookings", destination: "/contact", permanent: true },
      { source: "/cancel-appointment", destination: "/contact", permanent: true },
      { source: "/appointment-cancellation-confirmation", destination: "/contact", permanent: true },
      { source: "/visualization-proposal", destination: "/contact", permanent: true },
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
    return [
      // Pano2VR exports: serve each tour's index.html at the old URL. The page
      // sets <base href> so its relative files resolve without a trailing slash.
      { source: `/tours/hmr/:unit(${hmrTourUnits})`, destination: "/tours/hmr/:unit/index.html" },
      // The backlinked company profile keeps both old URLs. The file lives at
      // public/storage/... because Vercel's firewall denies /wp-content/* until
      // that rule is relaxed in the Vercel dashboard.
      {
        source: "/wp-content/uploads/2021/11/mimAR-Studios-Company-Profile.pdf",
        destination: "/storage/2021/11/mimAR-Studios-Company-Profile.pdf",
      },
    ];
  },
};

export default nextConfig;
