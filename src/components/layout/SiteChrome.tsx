"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the public header/footer on the staff portal (/admin) without moving
 * every public route into a route group. usePathname() is known during server
 * rendering, so there is no flash of site chrome on admin pages.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
