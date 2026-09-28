import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Booking - mimAR",
  description: "Your Booking is just a click away!",
  path: "/booking",
});

const meetingTypes = [
  { title: "Quick Call", src: "https://koalendar.com/e/Mimar-QuickCall?embed=true", link: "https://koalendar.com/e/Mimar-QuickCall" },
  { title: "30 Minutes", src: "https://koalendar.com/e/Mimar-30Mins?embed=true", link: "https://koalendar.com/e/Mimar-30Mins" },
  { title: "1 Hour", src: "https://koalendar.com/e/Mimar-1Hour?embed=true", link: "https://koalendar.com/e/Mimar-1Hour" },
] as const;

export default function BookingPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Booking", path: "/booking" },
        ]))}
      />

      <section className="container-page flex min-h-[30rem] flex-col justify-end pb-20 pt-32 md:min-h-[38rem] md:pb-24">
        <p className="eyebrow text-accent">/ Schedule a meeting</p>
        <h1 className="index-heading mt-8 max-w-6xl">
          Book your <span className="text-accent">meeting.</span>
        </h1>
        <p className="section-body mt-8 max-w-xl">Your Booking is just a click away!</p>
        <Link href="#meeting-options" className="button-pill mt-10 self-start text-ink">
          Choose a time
        </Link>
      </section>

      <section id="meeting-options" className="bg-ink text-paper">
        <div className="container-page py-20 md:py-28">
          <p className="eyebrow text-muted-inverse">/ Booking options</p>
          <h2 className="section-heading mt-6 max-w-3xl">
            Find a time that <span className="text-accent">works for you.</span>
          </h2>
          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {meetingTypes.map((meeting, index) => (
              <article key={meeting.title} className="min-w-0 border border-paper/20 bg-paper p-4 text-ink sm:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
                  <p className="eyebrow text-accent">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="text-right text-2xl font-medium tracking-tight">{meeting.title}</h3>
                </div>
                <iframe
                  src={meeting.src}
                  title={`Book a ${meeting.title.toLowerCase()} with Mimar Studios`}
                  loading="lazy"
                  className="mt-5 h-[39rem] w-full border-0"
                />
                <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="sr-only focus:not-sr-only focus:mt-5 focus:inline-block">
                  Open {meeting.title.toLowerCase()} booking calendar
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-28">
        <p className="eyebrow text-muted">/ Get in touch</p>
        <h2 className="section-heading mt-6">Need another way <span className="text-accent">to connect?</span></h2>
        <p className="section-body mt-5 max-w-xl">Send us the details of your project and our team will get back to you.</p>
        <Link href="/contact" className="button-pill mt-8 text-ink">Contact the studio</Link>
      </section>
    </div>
  );
}
