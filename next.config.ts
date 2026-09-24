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
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://drive.google.com https://online.fliphtml5.com",
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
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/about-us/studio", destination: "/about", permanent: true },
      { source: "/booking", destination: "/contact", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/meta", destination: "/services/vr-360-tours", permanent: true },
      { source: "/meta/:path*", destination: "/services/vr-360-tours", permanent: true },
      { source: "/real-estate-360-tours", destination: "/services/web-tours", permanent: true },
      { source: "/interior-design-services", destination: "/services/architectural-design", permanent: true },
      { source: "/services/3d-visualization/3d-views", destination: "/services/3d-visualization", permanent: true },
      { source: "/services/3d-visualization/cinematics", destination: "/services/cinematics", permanent: true },
      { source: "/services/3d-visualization/property-explorer", destination: "/services/property-explorer", permanent: true },
      { source: "/services/3d-visualization/property-explorer-online", destination: "/services/property-explorer", permanent: true },
      { source: "/services/3d-visualization-hamza/:path*", destination: "/services/3d-visualization", permanent: true },
      { source: "/services/interactive-services", destination: "/services/vr-360-tours", permanent: true },
      { source: "/services/interactive-services/dual-screen-navigator", destination: "/services/dual-screen-navigator", permanent: true },
      { source: "/services/interactive-services/vr-360-tours", destination: "/services/vr-360-tours", permanent: true },
      { source: "/services/interactive-services/web-tours", destination: "/services/web-tours", permanent: true },
      { source: "/services/architectural-design/architectural-design-services", destination: "/services/architectural-design", permanent: true },
      { source: "/services/architectural-design/interior-design-services", destination: "/services/architectural-design", permanent: true },
      { source: "/services/architectural-design/urban-planning", destination: "/services/architectural-design", permanent: true },
      { source: "/services/architectural-design/smart-topography-survey/:path*", destination: "/services/architectural-design", permanent: true },
      { source: "/services/marketing/:path+", destination: "/services/marketing", permanent: true },
      // Renamed 2026-08: service slugs/names were realigned to match the
      // pre-migration mim.archi site (see legacy /services/* redirects
      // above) to preserve historical SEO equity. These carry forward the
      // short-lived interim slugs used between the Next.js relaunch and
      // this rename so nothing freshly indexed or linked breaks.
      { source: "/services/3d-rendering", destination: "/services/3d-visualization", permanent: true },
      { source: "/services/animation", destination: "/services/cinematics", permanent: true },
      { source: "/services/vr-and-360", destination: "/services/vr-360-tours", permanent: true },
      { source: "/services/web-360", destination: "/services/web-tours", permanent: true },
      { source: "/services/dual-screen", destination: "/services/dual-screen-navigator", permanent: true },
      { source: "/magnetic-field-of-solenoid", destination: "/services/vr-360-tours", permanent: true },
      { source: "/galvanic-cell", destination: "/services/vr-360-tours", permanent: true },
      { source: "/tours/:path*", destination: "/services/web-tours", permanent: true },
      { source: "/gardenialivings-twobed", destination: "/services/web-tours", permanent: true },
      { source: "/gardenialivings-onebed", destination: "/services/web-tours", permanent: true },
      { source: "/ud-courtyard-type-:unit", destination: "/services/web-tours", permanent: true },
      { source: "/book-appointment", destination: "/contact", permanent: true },
      { source: "/my-bookings", destination: "/contact", permanent: true },
      { source: "/cancel-appointment", destination: "/contact", permanent: true },
      { source: "/appointment-cancellation-confirmation", destination: "/contact", permanent: true },
      { source: "/visualization-proposal", destination: "/contact", permanent: true },
      { source: "/category/services", destination: "/services", permanent: true },
      { source: "/category/3d-visualization", destination: "/services/3d-visualization", permanent: true },
      { source: "/category/vr-real-estate", destination: "/services/vr-360-tours", permanent: true },
      { source: "/category/metaverse", destination: "/services/vr-360-tours", permanent: true },
      { source: "/category/technology", destination: "/services/property-explorer", permanent: true },
      { source: "/category/meta/:path*", destination: "/services/vr-360-tours", permanent: true },
      { source: "/category/blog/real-estate-tech", destination: "/services/property-explorer", permanent: true },
      { source: "/category/blog", destination: "/services", permanent: true },
      { source: "/blog/architecture", destination: "/services/architectural-design", permanent: true },
    ];
  },
};

export default nextConfig;
