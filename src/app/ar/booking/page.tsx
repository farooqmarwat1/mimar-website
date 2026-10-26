import type { Metadata } from "next";
import { BookingView } from "@/components/pages/BookingViews";
import { buildMetadata } from "@/lib/seo";
import { bookingContent } from "@/content/pages/booking";

export const metadata: Metadata = buildMetadata({
  title: bookingContent.ar.title,
  description: bookingContent.ar.description,
  path: "/booking",
  locale: "ar",
});

export default function ArabicBookingPage() {
  return <BookingView lang="ar" />;
}
