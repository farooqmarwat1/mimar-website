import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

// The old page only held a BookingPress shortcode and had no meta description.
// Bookings now run through Koalendar (/booking), which emails each guest a link
// to manage their meeting, so this page points there.
export const metadata: Metadata = buildMetadata({
  title: "My Bookings - mimAR",
  description: "Manage your meeting with Mimar Studios: use the link in your booking email, book a new meeting or contact our team.",
  path: "/my-bookings",
});

export default function MyBookingsPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "My Bookings", path: "/my-bookings" },
        ]))}
      />

      <section className="container-page flex min-h-[34rem] flex-col justify-end pb-20 pt-32 md:min-h-[40rem] md:pb-28">
        <p className="eyebrow text-accent">/ Bookings</p>
        <h1 className="index-heading mt-8 max-w-6xl">
          My <span className="text-accent">Bookings.</span>
        </h1>
        <p className="section-body mt-8 max-w-xl">
          To reschedule or cancel a meeting, use the link in your booking confirmation email. Need a new time or help with an existing booking? Book again or contact our team.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/booking" className="button-pill text-ink">Book a meeting</Link>
          <Link href="/contact" className="button-pill text-ink">Contact us</Link>
        </div>
      </section>
    </div>
  );
}
