/**
 * Data for the hero "push-in" sequence.
 *
 * Each frame is one stop on the camera's journey from the building's exterior
 * toward its interior. `tagline` crossfades in as its frame becomes dominant.
 *
 * The sequence moves from an aerial view toward the lived-in interior. Keep
 * this spatial order when replacing frames so the crossfade reads as a single
 * camera journey rather than a slideshow.
 */
export type HeroFrame = {
  src: string;
  alt: string;
  tagline: string;
};

export const heroFrames: HeroFrame[] = [
  {
    src: "/hero/journey-01-exterior.webp",
    alt: "Lakeside residential building illuminated at dusk",
    tagline: "Transforming visions into breathtaking realities.",
  },
  {
    src: "/hero/journey-02-lobby.webp",
    alt: "Warm residential lobby looking back toward the lakeside building",
    tagline: "Step inside the vision.",
  },
  {
    src: "/hero/journey-03-bedroom.webp",
    alt: "Private bedroom overlooking the same lakeside development at dusk",
    tagline: "Designed down to the last detail.",
  },
];
