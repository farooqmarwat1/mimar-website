/** First-party library images, never relabelled as a project in the article's target city. */
export const BLOG_COVERS = {
  architecture: { url: "/services/architectural-design/hero.jpg", alt: "Architectural section drawing of a stepped building on a sloping site", width: 3200, height: 880 },
  rendering: { url: "/services/3D_rendering.webp", alt: "Architectural visualization of residential towers and landscaped streets at sunset", width: 2400, height: 1350 },
  interactive: { url: "/services/approved/vr-experiences.webp", alt: "A visitor uses a VR headset beside a screen showing an interactive apartment tour", width: 1672, height: 941 },
  branding: { url: "/services/branding/hero.png", alt: "Coordinated teal brand identity across brochures, stationery and printed materials", width: 1672, height: 941 },
  marketing: { url: "/service-media/marketing-hero.png", alt: "Property marketing website and social media designs displayed across laptops, tablets and phones", width: 1672, height: 941 },
} as const;

export type BlogCover = { url: string; alt: string; width?: number; height?: number };

export function selectBlogCover(input: { title: string; category?: string }): BlogCover {
  const title = input.title.toLowerCase();
  if (/\b(brand|branding|identity|stationery|logo)\b/.test(title)) return { ...BLOG_COVERS.branding };
  if (/\b(marketing|seo|social media|lead generation|campaign)\b/.test(title)) return { ...BLOG_COVERS.marketing };
  if (input.category === "vr-real-estate" || /\b(vr|virtual reality|interactive|360|property explorer)\b/.test(title)) return { ...BLOG_COVERS.interactive };
  if (input.category === "architecture") return { ...BLOG_COVERS.architecture };
  if (input.category === "real-estate-tech") return { ...BLOG_COVERS.marketing };
  return { ...BLOG_COVERS.rendering };
}

export function libraryCover(url: string): BlogCover | undefined {
  return Object.values(BLOG_COVERS).find(cover => cover.url === url);
}
