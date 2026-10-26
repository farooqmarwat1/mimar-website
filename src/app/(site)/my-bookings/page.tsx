import type { Metadata } from "next";
import { MyBookingsView } from "@/components/pages/BookingViews";
import { buildMetadata } from "@/lib/seo";
import { myBookingsContent } from "@/content/pages/booking";

// The old page only held a BookingPress shortcode and had no meta description.
// Bookings now run through Koalendar (/booking), which emails each guest a link
// to manage their meeting, so this page points there.
export const metadata: Metadata = buildMetadata({
  title: myBookingsContent.en.title,
  description: myBookingsContent.en.description,
  path: "/my-bookings",
});

export default function MyBookingsPage() {
  return <MyBookingsView />;
}
