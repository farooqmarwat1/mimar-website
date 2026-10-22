import type { Metadata } from "next";
import Link from "next/link";
import { canAccess, getSession } from "@/lib/admin/auth";
import { logoutAction } from "@/app/admin/actions";

// Per-user pages: always rendered per request, never prerendered at build.
export const dynamic = "force-dynamic";

// The staff portal must never be indexed or cached. next.config.ts also sends
// X-Robots-Tag + no-store for /admin/*; this is the in-document backstop.
export const metadata: Metadata = {
  title: "Staff portal | Mimar Studios",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-svh bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
          <Link href="/admin" className="text-sm font-medium tracking-tight">
            Mimar <span className="text-accent">Staff portal</span>
          </Link>
          {session && (
            <>
              <nav aria-label="Admin" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {canAccess(session.role, "jobs") && (
                  <Link href="/admin/jobs" className="text-muted transition-colors hover:text-ink">
                    Jobs
                  </Link>
                )}
                {canAccess(session.role, "blog") && (
                  <Link href="/admin/blog" className="text-muted transition-colors hover:text-ink">
                    Blog
                  </Link>
                )}
              </nav>
              <div className="ml-auto flex items-center gap-4 text-xs text-muted">
                <span>
                  {session.email} · {session.role}
                </span>
                <form action={logoutAction}>
                  <button type="submit" className="uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent">
                    Sign out
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10">{children}</div>
    </div>
  );
}
