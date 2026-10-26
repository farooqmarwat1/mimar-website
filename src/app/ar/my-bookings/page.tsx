import type { Metadata } from "next";
import { MyBookingsView } from "@/components/pages/BookingViews";
import { buildMetadata } from "@/lib/seo";
import { myBookingsContent } from "@/content/pages/booking";

export const metadata: Metadata = buildMetadata({
  title: myBookingsContent.ar.title,
  description: myBookingsContent.ar.description,
  path: "/my-bookings",
  locale: "ar",
});

export default function ArabicMyBookingsPage() {
  return <MyBookingsView lang="ar" />;
}
