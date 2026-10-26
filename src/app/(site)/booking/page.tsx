import type { Metadata } from "next";
import { BookingView } from "@/components/pages/BookingViews";
import { buildMetadata } from "@/lib/seo";
import { bookingContent } from "@/content/pages/booking";

export const metadata: Metadata = buildMetadata({
  title: bookingContent.en.title,
  description: bookingContent.en.description,
  path: "/booking",
});

export default function BookingPage() {
  return <BookingView />;
}
