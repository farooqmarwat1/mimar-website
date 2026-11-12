import type { ProjectStory } from "./project-stories";

/**
 * English project stories (see project-stories.ts for the rules). Every caption, alt text and
 * sentence about a project was written from its renders and its project data only.
 */

const img = (slug: string, n: number) => `/projects/catalog/${slug}/image-${n}.jpg`;

const service = {
  visualization: { path: "/services/3d-visualization", label: "3D visualization services" },
  interior: { path: "/services/architectural-design/interior-design-services", label: "Interior design services" },
  urban: { path: "/services/architectural-design/urban-planning", label: "Urban planning services" },
  architecture: { path: "/services/architectural-design", label: "Architectural design services" },
};

const body = "Share a few details about the project and one of our architects will get back to you within a day.";
// CTA headings stay short so each part fits on one line, like the home page block.
const cta = {
  dubai: { heading1: "Selling off-plan in Dubai?", heading2: "We will plan the renders.", body },
  riyadh: { heading1: "Launching in Riyadh?", heading2: "We will plan the renders.", body },
  usa: { heading1: "Marketing a US project?", heading2: "We will plan the renders.", body },
  pakistan: { heading1: "Launching in Pakistan?", heading2: "We will plan the renders.", body },
  masterplan: { heading1: "Planning a community?", heading2: "Let us design it with you.", body },
  interior: { heading1: "Designing an interior?", heading2: "Let us design it with you.", body },
  publicSpace: { heading1: "Planning a public space?", heading2: "Let us design it with you.", body },
};

export const enStories: Record<string, ProjectStory> = {
  "aark-residences": {
    seo: {
      title: "Aark Residences Dubai | 3D Rendering Project | Mimar Studios",
      description:
        "3D architectural renders of Aark Residences in Dubai: terraced tower exteriors, balcony detail and a rooftop pool terrace by Mimar Studios.",
    },
    typology: "Residential tower",
    heading: "Aark Residences 3D rendering in Dubai",
    paragraphs: [
      "Aark Residences is a residential development in [Dubai, UAE](/3d-visualization-services-uae), visualized by Mimar Studios as a set of [photorealistic 3D architectural renders](/services/3d-visualization). The set shows the building the way a buyer meets it: the terraced tower from the street at dusk, the balconies and façade up close, and the rooftop pool terrace with the Dubai skyline beyond. Renders like these let a developer market off-plan apartments with images of the finished building long before construction is complete.",
      "Each view answers a different question a buyer asks. The façade views show the proportions of the stepped balconies and the vertical timber fins against the sky. The night view shows how the tower sits in its street and how the lit terraces read from a distance. The terrace view sells the lifestyle: shade, planting, soft seating and the pool edge, with the city as a backdrop. Modern residential rendering works when it feels like a place, not a diagram, and that is how these images were composed.",
    ],
    views: [
      {
        image: img("aark-residences", 1),
        title: "Tower exterior in daylight",
        text: "A low view up the tower: stepped balconies, vertical timber fins and the glass-sided rooftop pool against the sky.",
        alt: "Aark Residences, Dubai: low-angle daylight view of the tower with stepped balconies, timber fins and a glass rooftop pool, 3D architectural visualization",
      },
      {
        image: img("aark-residences", 2),
        title: "Street view at dusk",
        text: "The tower in its street, with lit terraces and the light trails of passing traffic.",
        alt: "Aark Residences, Dubai: the residential tower at dusk with lit terraces and light trails in the street, 3D exterior rendering",
      },
      {
        image: img("aark-residences", 3),
        title: "Façade and balcony detail",
        text: "Glass balustrades, planted terraces and a glimpse of a lit living room through the glazing.",
        alt: "Aark Residences, Dubai: close view of balconies with glass balustrades, planters and a lit living room behind the glazing, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios deliver for Aark Residences?",
        answer:
          "A set of photorealistic 3D architectural renders of the Aark Residences development in Dubai: exterior views in daylight and at dusk, a view of the façade and balcony detail, and a view of the rooftop pool terrace.",
      },
      {
        question: "Why use 3D rendering for a residential development in the UAE?",
        answer:
          "Renders let buyers and investors see the finished building, its terraces and its amenities before construction ends, so a residential development can be marketed early with consistent images for brochures, websites and sales galleries.",
      },
      {
        question: "How do renders like the Aark Residences set help sell off-plan apartments?",
        answer:
          "Off-plan buyers cannot visit the finished building, so the renders show it to them: the daylight and dusk exteriors show the tower and its street, the balcony view shows the quality of the homes, and the rooftop terrace shows the amenities. One consistent set works on property portals, in brochures and in the sales gallery.",
      },
    ],
    service: service.visualization,
    cta: { ...cta.dubai, body: "Share a few details about the development and one of our architects will get back to you within a day." },
  },

  "amer-al-ghurair": {
    seo: {
      title: "Amer Al Ghurair Dubai | 3D Visualization | Mimar Studios",
      description:
        "3D renders of Amer Al Ghurair in Dubai: residential towers around a landscaped pool, an indoor pool, a gym and aerial views over the community.",
    },
    typology: "Residential towers",
    heading: "Amer Al Ghurair architectural renders in Dubai",
    paragraphs: [
      "Amer Al Ghurair is a residential development in [Dubai, UAE](/3d-visualization-services-uae): apartment towers at the edge of a low-rise villa community. Mimar Studios produced the [3D architectural visualization](/services/3d-visualization) set, from the towers around their landscaped pool to the indoor amenities and aerial views that place the project in its neighbourhood.",
      "The amenity views are lit like a bright day inside: daylight through full-height glazing onto the indoor pool and the gym, under timber-slatted ceilings that run through both spaces. The aerials do a different job. They show how the towers frame a park and a lake, how they line the main road, and, at sunset, how the upper balconies look out over the villas to the Dubai skyline.",
    ],
    views: [
      {
        image: img("amer-al-ghurair", 2),
        title: "Indoor pool",
        text: "A long indoor pool under a timber-slatted ceiling, with loungers along full-height windows.",
        alt: "Amer Al Ghurair, Dubai: indoor swimming pool under a timber-slatted ceiling with full-height windows and loungers, 3D interior visualization",
      },
      {
        image: img("amer-al-ghurair", 3),
        title: "Gym",
        text: "Treadmills along the windows, a sprint track down the middle and free weights at the side.",
        alt: "Amer Al Ghurair, Dubai: residents' gym with treadmills by the windows, a sprint track and free weights, 3D interior visualization",
      },
      {
        image: img("amer-al-ghurair", 4),
        title: "Balconies at sunset",
        text: "The upper floors look over the villa community and the main road to the Dubai skyline.",
        alt: "Amer Al Ghurair, Dubai: tower balconies at sunset overlooking villas, a highway and the Dubai skyline, 3D architectural visualization",
      },
      {
        image: img("amer-al-ghurair", 5),
        title: "Aerial of the community",
        text: "The towers stand at the edge of the villas, around a park with a lake and a sports field.",
        alt: "Amer Al Ghurair, Dubai: aerial view of residential towers beside a villa community with a park and a lake, 3D architectural visualization",
      },
      {
        image: img("amer-al-ghurair", 6),
        title: "Towers along the road",
        text: "A row of towers runs beside the villa streets, with the green neighbourhood stretching away.",
        alt: "Amer Al Ghurair, Dubai: row of residential towers beside tree-lined villa streets in daylight, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios visualize for Amer Al Ghurair?",
        answer:
          "Exterior and amenity renders of the Amer Al Ghurair residential towers in Dubai: the towers around their landscaped pool, an indoor pool, a gym, a sunset view from the upper balconies, and aerial views over the neighbouring villa community.",
      },
      {
        question: "Why include amenity renders in a residential tower campaign?",
        answer:
          "Buyers compare towers by what comes with the apartment. Renders of the indoor pool and the gym show the shared facilities at the same quality as the exteriors before they are built, so they can be used in brochures and on sales websites from launch.",
      },
      {
        question: "Why show the Amer Al Ghurair towers from the air?",
        answer:
          "An aerial view answers where the building is. Here the towers stand at the edge of a villa community with a park and a lake, beside a main road, with the Dubai skyline in the distance: context that is hard to show from street level.",
      },
    ],
    service: service.visualization,
    cta: cta.dubai,
  },

  "amerat-park": {
    seo: {
      title: "Amerat Park Muscat | Architectural Design | Mimar Studios",
      description:
        "Architectural design renders of Amerat Park in Muscat, Oman: a palm-lined promenade, a clock-tower plaza at dusk and aerial views of the site.",
    },
    typology: "Retail and leisure destination",
    heading: "Amerat Park architectural design in Muscat",
    paragraphs: [
      "Amerat Park is a public retail and leisure destination in Muscat, Oman, shown through Mimar Studios' [architectural design](/services/architectural-design) renders. The set moves from the whole site to the scale of a visitor: aerial views of the master plan, a palm-lined promenade with shops and cafés along a water channel, and the main plaza in the evening.",
      "The architecture draws on the region. A clock tower with crenellated parapets and arched colonnades, forms that recall the area's historic forts, frames the main plaza, while the shopfronts behind use timber screens and warm light. Around the buildings, the aerial shows parking, a children's play area, sports courts and an open green, so the plan reads as a place for a family day out, not only for shopping.",
    ],
    views: [
      {
        image: img("amerat-park", 1),
        title: "Promenade by day",
        text: "Palms, café terraces and shopfronts along a stepped water channel.",
        alt: "Amerat Park, Muscat: palm-lined promenade with café terraces, shopfronts and a water channel in daylight, architectural design render",
      },
      {
        image: img("amerat-park", 2),
        title: "Clock-tower plaza at dusk",
        text: "A clock tower and arched colonnade frame the lit plaza and its planting.",
        alt: "Amerat Park, Muscat: plaza at dusk framed by a clock tower and arched colonnade with lit shopfronts, architectural design render",
      },
      {
        image: img("amerat-park", 4),
        title: "Aerial of the destination",
        text: "Retail buildings, parking, a children's play area, sports courts and an open green.",
        alt: "Amerat Park, Muscat: aerial view of retail buildings, parking, a children's play area and sports courts, architectural design render",
      },
    ],
    faqs: [
      {
        question: "What does the Amerat Park render set show?",
        answer:
          "Architectural design renders of Amerat Park in Muscat: aerial views of the master plan with roads, parking, play areas and sports courts, a daytime view of the palm-lined promenade and water channel, and an evening view of the clock-tower plaza.",
      },
      {
        question: "How does the design of Amerat Park reflect Oman?",
        answer:
          "The main plaza is framed by a clock tower with crenellated parapets and arched colonnades, forms that recall the region's historic forts, set against contemporary shopfronts with timber screens and warm lighting.",
      },
      {
        question: "Does Mimar Studios work on projects in Oman?",
        answer:
          "Yes. Amerat Park in Muscat is one example. The studio's portfolio also includes projects in the UAE, Saudi Arabia, Pakistan, Nigeria and the USA.",
      },
    ],
    service: service.architecture,
    cta: cta.publicSpace,
  },

  "divine-golf": {
    seo: {
      title: "Divine Golf Dubai | Residential 3D Rendering | Mimar Studios",
      description:
        "3D renders of Divine Golf in Dubai: low-rise apartments beside a golf course, a lakeside view at dusk, a lit night façade and the park by day.",
    },
    typology: "Residential community",
    heading: "Divine Golf 3D renders in Dubai",
    paragraphs: [
      "Divine Golf is a low-rise residential community in [Dubai, UAE](/3d-visualization-services-uae), set beside a golf course. Mimar Studios rendered it as a set of [photorealistic 3D exteriors](/services/3d-visualization) through a full day: the buildings beside the fairway, a park view in late afternoon, a lakeside view at dusk and a close view of the façade at night.",
      "Low-rise buildings sell their setting more than their height, so most views put the landscape first. The golf course, the park and the lake sit in the foreground, with the apartment blocks behind them and the city skyline far off. The night view comes closer, to the lit balconies, the palms and the water features at the entrance, where the homes themselves are the subject.",
    ],
    views: [
      {
        image: img("divine-golf", 2),
        title: "Façade at night",
        text: "Lit balconies, palms and a line of fountains at the entrance, with the city glowing behind.",
        alt: "Divine Golf, Dubai: apartment building at night with lit balconies, palms and fountains at the entrance, 3D architectural visualization",
      },
      {
        image: img("divine-golf", 3),
        title: "Across the lake at dusk",
        text: "The buildings reflected in still water under an evening sky.",
        alt: "Divine Golf, Dubai: low-rise apartment buildings reflected in a lake at dusk, 3D architectural visualization",
      },
      {
        image: img("divine-golf", 4),
        title: "From the park",
        text: "White apartment blocks seen across a planted park and a quiet road in late-afternoon light.",
        alt: "Divine Golf, Dubai: white apartment blocks seen across a landscaped park and road in late-afternoon light, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for Divine Golf?",
        answer:
          "Photorealistic 3D exterior renders of the Divine Golf residential community in Dubai: the low-rise buildings beside the golf course, a view from the park, a view across the lake at dusk and a view of the lit façade at night.",
      },
      {
        question: "Why render Divine Golf at different times of day?",
        answer:
          "Each light shows something different: daylight shows the materials and the green spaces, dusk shows the buildings reflected in the lake, and night shows the lit balconies and the entrance. Together they give a buyer a fuller picture than one image could.",
      },
      {
        question: "Why keep the landscape in the foreground?",
        answer:
          "For a low-rise community beside a golf course, the setting is the selling point. Putting the fairway, the park and the lake in front of the buildings shows buyers the views and open space they are paying for.",
      },
    ],
    service: service.visualization,
    cta: cta.dubai,
  },

  "divine-residencia": {
    seo: {
      title: "Divine Residencia Dubai | 3D Visualization | Mimar Studios",
      description:
        "3D renders of Divine Residencia in Dubai: a low-rise apartment building with a garden, its pool deck from above and close views of the balconies.",
    },
    typology: "Low-rise residential",
    heading: "Divine Residencia architectural renders in Dubai",
    paragraphs: [
      "Divine Residencia is a low-rise apartment building in [Dubai, UAE](/3d-visualization-services-uae) with a garden and a shared pool. The Mimar Studios set of [3D architectural renders](/services/3d-visualization) shows it from the street, from directly above the pool deck, from the poolside and up close at the balconies.",
      "The façade is a grid of deep white frames with recessed balconies, broken by vertical louvres and timber-lined balconies that project out of the grid. The close-up view is there to show that detail. The overhead view of the pool deck, with its loungers, umbrellas and planters, gives buyers the layout of the shared amenity in a single image.",
    ],
    views: [
      {
        image: img("divine-residencia", 2),
        title: "Pool deck from above",
        text: "The pool, loungers, umbrellas and planters laid out on a timber deck.",
        alt: "Divine Residencia, Dubai: top-down view of the pool deck with loungers, umbrellas and planters, 3D architectural visualization",
      },
      {
        image: img("divine-residencia", 3),
        title: "Poolside",
        text: "The framed façade and its balconies behind the pool and seating.",
        alt: "Divine Residencia, Dubai: poolside view of the low-rise building with framed balconies and outdoor seating, 3D architectural visualization",
      },
      {
        image: img("divine-residencia", 4),
        title: "Balcony detail",
        text: "Timber-lined balconies with glass balustrades project from the white frames.",
        alt: "Divine Residencia, Dubai: close view of timber-lined balconies with glass balustrades and vertical louvres, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for Divine Residencia?",
        answer:
          "3D architectural renders of the Divine Residencia building in Dubai: a street view with its garden, a top-down view of the pool deck, a poolside view of the façade and a close view of the balconies.",
      },
      {
        question: "Why include a top-down view of the pool deck?",
        answer:
          "It shows the whole amenity in one image: the shape of the pool, where the loungers, umbrellas and planters sit, and how the deck meets the garden. Buyers read the layout at a glance, which a view from the side cannot do.",
      },
      {
        question: "What does the Divine Residencia balcony close-up show?",
        answer:
          "The façade's main detail: timber-lined balconies with glass balustrades that project out of a grid of white frames, next to vertical louvres. It shows the quality of the materials that a wider view would lose.",
      },
    ],
    service: service.visualization,
    cta: cta.dubai,
  },

  "h-and-s": {
    seo: {
      title: "H&S Dubai | Residential Building 3D Renders | Mimar Studios",
      description:
        "3D renders of the H&S residential building in Dubai: a curved façade at night, a street view at dusk, a daytime view and an aerial to the skyline.",
    },
    typology: "Residential building",
    heading: "H&S residential building renders in Dubai",
    paragraphs: [
      "H&S is a residential building in [Dubai, UAE](/3d-visualization-services-uae) with a long curved façade and a projecting roof canopy. Mimar Studios produced a compact set of [3D exterior renders](/services/3d-visualization) from four viewpoints: the lit façade at night, the street at dusk, the curve in daylight and an aerial view over the district to the Dubai skyline.",
      "The curve is the building's identity, so each view follows it. At street level it bends away from the camera along the pavement; from the air it turns the corner of its block. The roof canopy, a band of slender fins, catches the light in the daytime view and outlines the building against the sky at dusk.",
    ],
    views: [
      {
        image: img("h-and-s", 1),
        title: "Aerial at night",
        text: "The lit building on its corner, with the district and the Dubai skyline beyond.",
        alt: "H&S, Dubai: night aerial of the lit residential building on its corner with the Dubai skyline beyond, 3D architectural visualization",
      },
      {
        image: img("h-and-s", 3),
        title: "Street view at dusk",
        text: "The curved façade and roof canopy above an evening street with traffic and people walking.",
        alt: "H&S, Dubai: curved residential building and roof canopy above a busy street at dusk, 3D architectural visualization",
      },
      {
        image: img("h-and-s", 4),
        title: "The curve in daylight",
        text: "The façade sweeps along the pavement under a band of slender roof fins.",
        alt: "H&S, Dubai: daytime street view of the curved façade under a band of slender roof fins, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for H&S?",
        answer:
          "A compact set of 3D exterior renders of the H&S residential building in Dubai: the curved façade lit at night, a street view at dusk, a daytime view along the curve and a night aerial towards the Dubai skyline.",
      },
      {
        question: "Why does the H&S set include an aerial view at night?",
        answer:
          "It places the building in its district and shows the distance to the Dubai skyline, which a street-level view cannot. At night the lit façade also stands out clearly from the blocks around it.",
      },
      {
        question: "How many views does a compact exterior render set need?",
        answer:
          "For a single building, four well-chosen views can cover it: a hero view, a street view, a view of the façade's main feature and a context view from the air. That is how the H&S set is built.",
      },
    ],
    service: service.visualization,
    cta: cta.dubai,
  },

  "karma-trinity": {
    seo: {
      title: "Karma Trinity Dubai | Residential 3D Renders | Mimar Studios",
      description:
        "A full 3D marketing set for Karma Trinity in Dubai: terraced tower exteriors, the lobby, apartment interiors, a gym, the pool and a play area.",
    },
    typology: "Residential tower",
    heading: "Karma Trinity 3D visualization in Dubai",
    paragraphs: [
      "Karma Trinity is a terraced residential tower in [Dubai, UAE](/3d-visualization-services-uae), and its render set is the largest in Mimar Studios' project portfolio. It covers the architecture, the arrival, the homes and the amenities: [3D exteriors and interiors](/services/3d-visualization) that let a sales team tell the whole story with one consistent set of images.",
      "The tower steps back in terraces, so the exterior views look along its edges: at sunset towards the Burj Khalifa, and at dusk where its two wings meet in a V. Inside, the lobby is marble and timber under a canopy of hanging lights, and the apartments use warm wood, stone and brass with daylight from full-height windows. At podium level, the resort-style pool, the gym that looks onto it and the children's splash pad show daily life in the building.",
    ],
    views: [
      {
        image: img("karma-trinity", 1),
        title: "Lobby",
        text: "Marble walls, timber slats and a canopy of hanging lights above the reception desk.",
        alt: "Karma Trinity, Dubai: lobby with marble walls, timber slats and hanging lights above the reception desk, 3D interior visualization",
      },
      {
        image: img("karma-trinity", 2),
        title: "Living room and kitchen",
        text: "An open-plan apartment in wood, stone and brass, with a window onto greenery.",
        alt: "Karma Trinity, Dubai: open-plan apartment living room and kitchen in wood, stone and brass, 3D interior visualization",
      },
      {
        image: img("karma-trinity", 3),
        title: "Gym",
        text: "Treadmills facing full-height glass over the pool and the city.",
        alt: "Karma Trinity, Dubai: residents' gym with treadmills facing full-height glass over the pool and city, 3D interior visualization",
      },
      {
        image: img("karma-trinity", 4),
        title: "Living room",
        text: "A marble media wall, timber panelling, shelving and a brass chandelier.",
        alt: "Karma Trinity, Dubai: apartment living room with a marble media wall, timber panelling and a brass chandelier, 3D interior visualization",
      },
      {
        image: img("karma-trinity", 6),
        title: "Terraces at sunset",
        text: "Planted terraces step down the tower, with the Burj Khalifa on the skyline.",
        alt: "Karma Trinity, Dubai: planted terraces of the residential tower at sunset with the Burj Khalifa beyond, 3D architectural visualization",
      },
      {
        image: img("karma-trinity", 7),
        title: "The two wings",
        text: "The terraced wings of the tower meet in a V against the evening sky.",
        alt: "Karma Trinity, Dubai: terraced tower wings meeting in a V against the evening sky, 3D architectural visualization",
      },
      {
        image: img("karma-trinity", 8),
        title: "Children's splash pad",
        text: "Water jets, play equipment and planting in the courtyard between the wings.",
        alt: "Karma Trinity, Dubai: children's splash pad and play area in the landscaped courtyard, 3D architectural visualization",
      },
      {
        image: img("karma-trinity", 9),
        title: "Resort-style pool",
        text: "A winding pool with a swim-up bar, jacuzzis and palms at podium level.",
        alt: "Karma Trinity, Dubai: resort-style podium pool with a swim-up bar, jacuzzis and palms, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios produce for Karma Trinity?",
        answer:
          "A complete 3D marketing set for the Karma Trinity residential tower in Dubai: an aerial and terraced exteriors at sunset and dusk, the lobby, two apartment interiors, a gym, a resort-style pool and a children's splash pad.",
      },
      {
        question: "What does a complete residential marketing set include?",
        answer:
          "For Karma Trinity: hero exteriors, a lobby view, apartment interiors, and views of the gym, the pool and the children's play area. Between them they answer how the building looks, how residents arrive, how the homes feel and what they share.",
      },
      {
        question: "Why render the interiors and amenities of Karma Trinity as well as the tower?",
        answer:
          "The tower attracts attention, but buyers decide on the home and the lifestyle. Interior and amenity renders show the finishes, the light in the apartments and the shared facilities before they exist, in the same style as the exteriors.",
      },
    ],
    service: service.visualization,
    cta: cta.dubai,
  },

  "nana-222": {
    seo: {
      title: "NANA 222 Riyadh | Residential Tower Renders | Mimar Studios",
      description:
        "3D renders of NANA 222 in Riyadh: a residential tower with flowing planted balconies, balcony detail, a material board and a 3D floor plan cutaway.",
    },
    typology: "Residential tower",
    heading: "NANA 222 residential tower renders in Riyadh",
    paragraphs: [
      "NANA 222 is a residential tower in Riyadh, [Saudi Arabia](/3d-visualization-services-saudi-arabia), defined by flowing balconies that wrap its upper floors. Mimar Studios visualized it as a concise campaign of [3D architectural renders](/services/3d-visualization): the tower against the sky, a close view of a balcony at sunrise, a material board and a 3D cutaway of a typical floor.",
      "The balconies carry the design: curved glass edges, timber soffits lined with a strip of light, and planting that spills over each level. The material board isolates the pieces, curved timber louvres and the balcony profile, so the design intent can be read on its own. The floor-plan cutaway turns the same floor into something a buyer can walk through: rooms, furniture and the curve of the terraces seen from above.",
    ],
    views: [
      {
        image: img("nana-222", 2),
        title: "Flowing balconies",
        text: "Curved glass, timber soffits and planting wrap the upper floors.",
        alt: "NANA 222, Riyadh: upper floors of the tower with flowing curved balconies, timber soffits and planting, 3D architectural visualization",
      },
      {
        image: img("nana-222", 3),
        title: "Balcony at sunrise",
        text: "A lit timber soffit and glass balustrade above the city at first light.",
        alt: "NANA 222, Riyadh: close view of a curved balcony with a lit timber soffit and glass balustrade at sunrise, 3D architectural visualization",
      },
      {
        image: img("nana-222", 5),
        title: "Material board",
        text: "Curved timber louvres, the balcony profile and the façade finishes side by side.",
        alt: "NANA 222, Riyadh: material board with curved timber louvres, curved balconies and façade finishes, 3D architectural visualization",
      },
      {
        image: img("nana-222", 8),
        title: "3D floor plan",
        text: "A cutaway of a typical floor: apartments, furniture and the curved terraces around the edge.",
        alt: "NANA 222, Riyadh: 3D floor plan cutaway of a typical floor with furnished apartments and curved terraces",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios produce for NANA 222?",
        answer:
          "A concise set of 3D architectural renders of the NANA 222 residential tower in Riyadh: the tower and its curved balconies against the sky, a balcony close-up at sunrise, a material board and a 3D floor plan cutaway of a typical floor.",
      },
      {
        question: "What is a 3D floor plan cutaway?",
        answer:
          "A 3D view of a floor with the roof removed, showing the walls, rooms and furniture from above. For NANA 222 it shows the layout of a typical floor with the curved balconies around its edge, which is easier to read than a flat plan.",
      },
      {
        question: "Why include a material board in a render set?",
        answer:
          "It shows the main materials and features on their own, here the curved timber louvres and the curved balconies, so architects, developers and buyers can see what the façade is made of.",
      },
    ],
    service: service.visualization,
    cta: cta.riyadh,
  },

  "nomi-downtown": {
    seo: {
      title: "Nomi Downtown Miami | Mixed-Use 3D Renders | Mimar Studios",
      description:
        "3D renders of Nomi Downtown in Miami: an aerial of the city-block development, its pool deck from above, the entrance plaza and a street café.",
    },
    typology: "Mixed-use development",
    heading: "Nomi Downtown 3D renders in Miami",
    paragraphs: [
      "Nomi Downtown is a mixed-use development in Miami, [USA](/3d-visualization-usa), covering a city block of residential towers above shops, courtyards and green space. Mimar Studios produced the [3D architectural renders](/services/3d-visualization) from the air, from directly above the pool deck, at the entrance plaza and at street level.",
      "Mixed-use projects have to appeal to residents and to the businesses at their base, so the set does both. The aerial and the pool deck show the residential side: the block, its courtyards and the amenity terrace. The entrance plaza at sunset and the café between the towers show the ground floor as a public place, with outdoor tables, planting and people on the street.",
    ],
    views: [
      {
        image: img("nomi-downtown", 2),
        title: "Pool deck from above",
        text: "The pool, loungers and umbrellas framed by planting beside a palm-lined street.",
        alt: "Nomi Downtown, Miami: top-down view of the pool deck with loungers and umbrellas beside a palm-lined street, 3D architectural visualization",
      },
      {
        image: img("nomi-downtown", 3),
        title: "Entrance plaza at sunset",
        text: "Fountains, planting and a feature wall in front of the curved residential tower.",
        alt: "Nomi Downtown, Miami: entrance plaza at sunset with fountains and planting before a curved residential tower, 3D architectural visualization",
      },
      {
        image: img("nomi-downtown", 4),
        title: "Street café",
        text: "Outdoor tables and umbrellas on a paved street between the towers.",
        alt: "Nomi Downtown, Miami: street café with outdoor tables on a paved street between residential towers, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for Nomi Downtown?",
        answer:
          "3D architectural renders of the Nomi Downtown mixed-use development in Miami: an aerial of the city block with its courtyards, a top-down view of the pool deck, the entrance plaza at sunset and a street café between the towers.",
      },
      {
        question: "How do renders help market a mixed-use development?",
        answer:
          "They show both audiences what they are buying into. Residents see the homes, courtyards and pool deck; shop and restaurant operators see a busy ground floor with plazas, outdoor seating and people on the street.",
      },
      {
        question: "Why show the Nomi Downtown pool deck from directly above?",
        answer:
          "A top-down view shows the full layout of the amenity at once, the pool, seating and planting, and how it sits next to the street, which is hard to read from eye level.",
      },
    ],
    service: service.visualization,
    cta: cta.usa,
  },

  "the-garden-residences": {
    seo: {
      title: "The Garden Residences USA | Interior Renders | Mimar Studios",
      description:
        "Interior design renders of The Garden Residences in the USA: living rooms, an open-plan kitchen and a bedroom in warm, neutral tones.",
    },
    typology: "Residential interiors",
    heading: "The Garden Residences interior renders",
    paragraphs: [
      "The Garden Residences is a residential project in the [United States](/3d-visualization-usa), and this collection shows its apartment interiors. Mimar Studios produced the [interior design](/services/architectural-design/interior-design-services) visualization: two living rooms, an open-plan living and kitchen space, and a bedroom, all in the same calm palette.",
      "The palette is warm and neutral: oak floors, linen curtains, soft upholstered furniture and abstract art in muted tones. Daylight does most of the work, falling across rugs and sofas through sheer curtains. Kept consistent across every room, the scheme reads as one home, which is what a buyer of an apartment wants to picture.",
    ],
    views: [
      {
        image: img("the-garden-residences", 2),
        title: "Bedroom",
        text: "An upholstered bed, timber side tables and linen curtains in soft daylight.",
        alt: "The Garden Residences, USA: bedroom with an upholstered bed, timber side tables and linen curtains, interior design visualization",
      },
      {
        image: img("the-garden-residences", 3),
        title: "Living room",
        text: "A modular sofa, round coffee table and a kitchenette in the corner.",
        alt: "The Garden Residences, USA: living room with a modular sofa, round coffee table and kitchenette, interior design visualization",
      },
      {
        image: img("the-garden-residences", 4),
        title: "Open-plan living and kitchen",
        text: "Sofa, kitchen and breakfast bar in one bright, open room.",
        alt: "The Garden Residences, USA: open-plan living room with a kitchen and breakfast bar, interior design visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios create for The Garden Residences?",
        answer:
          "Interior design renders of The Garden Residences apartments in the USA: two living rooms, an open-plan living and kitchen space, and a bedroom, designed in one consistent palette.",
      },
      {
        question: "What interior style is The Garden Residences?",
        answer:
          "Warm and neutral: oak floors, linen curtains, soft upholstered furniture, round coffee tables and abstract art in muted tones, with daylight as the main light source.",
      },
      {
        question: "Why render several rooms of an apartment in one palette?",
        answer:
          "Buyers picture a home, not a set of rooms. When the living room, kitchen and bedroom share the same materials and light, the renders read as one apartment they could move into.",
      },
    ],
    service: service.interior,
    cta: cta.interior,
  },

  "360-residences": {
    seo: {
      title: "360 Residences Pakistan | 3D Rendering | Mimar Studios",
      description:
        "3D renders of 360 Residences in Pakistan: four residential towers above a retail podium, aerial views among forested hills and a rooftop pool.",
    },
    typology: "Residential towers",
    heading: "360 Residences 3D rendering",
    paragraphs: [
      "360 Residences is a development of four high-rise residential towers above a retail podium in [Pakistan](/3d-visualization-services-pakistan), set against forested hills. Mimar Studios produced the [3D rendering](/services/3d-visualization) set: the towers from the street, aerial views at sunset and at night, and a rooftop pool deck looking out to the hills.",
      "The setting is the project's strongest asset, so the camera keeps turning outward. At street level the towers rise above the shops and the evening traffic; from the air they stand in a sea of trees beside the highway, and at night they glow against the mountains. The rooftop view brings the landscape onto the building itself, with a pool and a timber-roofed pavilion facing the valley.",
    ],
    views: [
      {
        image: img("360-residences", 2),
        title: "Towers at dusk",
        text: "Four towers above the retail podium, with evening traffic on the road in front.",
        alt: "360 Residences, Pakistan: four residential towers above a retail podium at dusk with traffic in front, 3D architectural visualization",
      },
      {
        image: img("360-residences", 3),
        title: "Aerial at sunset",
        text: "The towers rise from forest beside a highway, with the sun setting over the hills.",
        alt: "360 Residences, Pakistan: aerial of the residential towers among forest beside a highway at sunset, 3D architectural visualization",
      },
      {
        image: img("360-residences", 4),
        title: "Night panorama",
        text: "The lit towers against dark mountains and a lit road through the trees.",
        alt: "360 Residences, Pakistan: night panorama of the lit towers against mountains and forest, 3D architectural visualization",
      },
      {
        image: img("360-residences", 5),
        title: "Rooftop pool",
        text: "A pool and timber-roofed pavilion looking out over the hills.",
        alt: "360 Residences, Pakistan: rooftop pool and timber-roofed pavilion overlooking green hills, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for 360 Residences?",
        answer:
          "3D renders of the 360 Residences towers in Pakistan: the four towers above their retail podium at street level, an aerial at sunset, a night panorama against the mountains and a rooftop pool deck overlooking the hills.",
      },
      {
        question: "Why show 360 Residences from the air?",
        answer:
          "The towers stand among forested hills beside a highway. Only an aerial view shows that setting, and the access to the road, in one image.",
      },
      {
        question: "What does the rooftop view add to the 360 Residences set?",
        answer:
          "It shows the shared amenity at the top of the building, a pool and a timber-roofed pavilion, and the view residents would have over the hills, which sells the lifestyle more than the façade alone.",
      },
    ],
    service: service.visualization,
    cta: cta.pakistan,
  },

  "aurum-one": {
    seo: {
      title: "Aurum One Pakistan | Tower and Mall Renders | Mimar Studios",
      description:
        "3D renders of Aurum One in Pakistan: a glass tower rising through low cloud, a multi-level atrium under a skylight and a retail promenade.",
    },
    typology: "Tower and retail mall",
    heading: "Aurum One 3D rendering in Pakistan",
    paragraphs: [
      "Aurum One is a glass-façade tower with a retail mall at its base in [Pakistan](/3d-visualization-services-pakistan). Mimar Studios presented it as a cinematic set of [3D architectural renders](/services/3d-visualization): the tower rising through low cloud, the mall's multi-level atrium and a shopping promenade.",
      "The exterior is about height and light, with the tower lit from one side as it breaks through the cloud. Inside, the atrium is drawn in white curves and glass under a long skylight, with escalators linking the floors, and the promenade adds warmth with timber ceilings, planters and café tables outside the shopfronts. Together the views show both halves of the project: an address and a destination.",
    ],
    views: [
      {
        image: img("aurum-one", 2),
        title: "Atrium",
        text: "White curved balconies and escalators under a long skylight and a glass wall.",
        alt: "Aurum One, Pakistan: multi-level mall atrium with curved balconies and escalators under a skylight, 3D interior visualization",
      },
      {
        image: img("aurum-one", 3),
        title: "Shopping promenade",
        text: "Timber ceilings, planters and café seating in front of the shopfronts.",
        alt: "Aurum One, Pakistan: shopping promenade with timber ceilings, planters and café seating, 3D interior visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for Aurum One?",
        answer:
          "A cinematic set of 3D architectural renders of Aurum One in Pakistan: the glass tower rising through low cloud, the multi-level atrium of its mall and a shopping promenade with café seating.",
      },
      {
        question: "Why render the mall at Aurum One as well as the tower?",
        answer:
          "The project is both a tower and a shopping destination. The atrium and promenade views show tenants and visitors the quality of the retail spaces, while the exterior sells the building as an address.",
      },
      {
        question: "What makes an architectural render cinematic?",
        answer:
          "Dramatic light and weather, a chosen camera angle and a strong sense of scale. In the Aurum One hero view the tower breaks through low cloud with light on one side, which reads more like a film still than a technical drawing.",
      },
    ],
    service: service.visualization,
    cta: cta.pakistan,
  },

  "cafe-interior": {
    seo: {
      title: "Café Interior Design Pakistan | 3D Renders | Mimar Studios",
      description:
        "Interior design and 3D renders of a café in Pakistan: a timber coffee counter, rust-toned seating, pendant lights and a moodboard of finishes.",
    },
    typology: "Café interior",
    heading: "Café interior design and visualization",
    paragraphs: [
      "This café interior in [Pakistan](/3d-visualization-services-pakistan) was designed and visualized by Mimar Studios, from the first moodboard to finished [interior design](/services/architectural-design/interior-design-services) renders. The set shows the coffee counter, the seating area and the board of materials and furniture behind them.",
      "The scheme is warm and simple: fluted timber on the counter and walls, a textured plaster finish, rust-coloured upholstery, a dark ceiling with track lights and paper pendant lamps over the bar. The moodboard shows each choice on its own, from the bar stools to the floor tile, so the owner can approve the materials before any are ordered. The renders then show how they come together in daylight.",
    ],
    views: [
      {
        image: img("cafe-interior", 2),
        title: "Coffee counter",
        text: "An espresso machine, a pastry display and lit shelves, with tables by the window.",
        alt: "Café interior in Pakistan: coffee counter with an espresso machine, pastry display and lit shelves, interior design visualization",
      },
      {
        image: img("cafe-interior", 3),
        title: "Seating area",
        text: "A rust-coloured bench, round tables, bar stools and fluted timber walls.",
        alt: "Café interior in Pakistan: seating with a rust-coloured bench, round tables, bar stools and fluted timber walls, interior design visualization",
      },
      {
        image: img("cafe-interior", 4),
        title: "Moodboard",
        text: "The bar, chairs, stools, bench, pendant lights, wall texture, floor tile and timber accent.",
        alt: "Café interior in Pakistan: moodboard of the bar counter, chairs, stools, pendant lights and finishes, interior design visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios design for this café?",
        answer:
          "The interior design of a café in Pakistan, presented as a moodboard of materials and furniture and as 3D renders of the coffee counter and the seating area.",
      },
      {
        question: "What is an interior moodboard?",
        answer:
          "A single sheet of the main materials and furniture for a space. For this café it shows the bar counter and back wall, chairs, bar stools, the sofa bench, pendant lights, the wall texture, the floor tile and the timber accents.",
      },
      {
        question: "Why render a café before it is built?",
        answer:
          "So the owner can see the finished space, check the layout and approve materials and furniture with confidence, and use the images to promote the opening.",
      },
    ],
    service: service.interior,
    cta: cta.interior,
  },

  "dha-multan-highrise": {
    seo: {
      title: "DHA Multan Highrise | 3D Tower Renders | Mimar Studios",
      description:
        "3D renders of a residential high-rise in DHA Multan, Pakistan: curved balconies at dusk, a planted podium at street level and a balcony close-up.",
    },
    typology: "Residential tower",
    heading: "DHA Multan Highrise architectural renders",
    paragraphs: [
      "The DHA Multan Highrise is a residential tower concept in Multan, [Pakistan](/3d-visualization-services-pakistan), visualized by Mimar Studios to present it to the market. The [3D architectural renders](/services/3d-visualization) show the tower at dusk, its podium at street level and the balconies up close.",
      "Curved balconies with glass balustrades and timber soffits wrap the tower and soften its corners. At the base, a podium of glazed floors with planted terraces gives the building a lively street front and a tall lobby. The close-up shows what the balcony is like to stand on: the glazing, the depth of the slab and the planting at the edge.",
    ],
    views: [
      {
        image: img("dha-multan-highrise", 2),
        title: "Podium at street level",
        text: "Glazed floors with planted terraces above a tree-lined pavement and the lobby.",
        alt: "DHA Multan Highrise, Multan: podium with glazed floors and planted terraces above a tree-lined street, 3D architectural visualization",
      },
      {
        image: img("dha-multan-highrise", 3),
        title: "Balcony close-up",
        text: "A curved balcony with a glass balustrade, timber soffit and planters.",
        alt: "DHA Multan Highrise, Multan: curved balcony with a glass balustrade, timber soffit and planters, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for the DHA Multan Highrise?",
        answer:
          "3D architectural renders of a residential tower concept in DHA Multan: the tower with its curved balconies at dusk, the planted podium at street level and a close view of a balcony.",
      },
      {
        question: "Why render the podium of a tower separately?",
        answer:
          "The podium is what people meet at street level: the lobby, the shopfronts and the planted terraces. A dedicated view shows that the building is pleasant to arrive at, not only impressive from a distance.",
      },
      {
        question: "What does the DHA Multan balcony close-up show?",
        answer:
          "The quality of the homes: a deep curved balcony with a glass balustrade, a timber soffit and planters, seen as a resident would see it.",
      },
    ],
    service: service.visualization,
    cta: cta.pakistan,
  },

  "faisal-hills": {
    seo: {
      title: "Faisal Hills Islamabad | Master Plan Renders | Mimar Studios",
      description:
        "Master plan renders of Faisal Hills, Islamabad: aerial views of the housing community, its central district, the arch gateway and the hills.",
    },
    typology: "Master-planned community",
    heading: "Faisal Hills master plan visualization in Islamabad",
    paragraphs: [
      "Faisal Hills is a large master-planned housing community in Islamabad, [Pakistan](/3d-visualization-services-pakistan), laid out along the foot of the hills. Mimar Studios visualized the plan from the whole site down to its streets: [urban planning](/services/architectural-design/urban-planning) renders of the full community, its central district, the main boulevard and the neighbourhoods.",
      "At full scale, the aerial shows how the plan follows the land, with residential sectors and towers laid out between the hills, a golf course and lakes. The central district gathers high-rise towers in a crescent around civic buildings and a mosque. At street level, a tree-lined boulevard leads to a monumental arch gateway, and the view from a tower shows low-rise streets, sports courts and green hills beyond.",
    ],
    views: [
      {
        image: img("faisal-hills", 1),
        title: "The plan in its landscape",
        text: "Residential sectors and towers laid out between the hills and the main road.",
        alt: "Faisal Hills, Islamabad: wide aerial of the master plan with residential sectors and towers along the hills, architectural design render",
      },
      {
        image: img("faisal-hills", 2),
        title: "Central district",
        text: "High-rise towers in a crescent around civic buildings and a mosque.",
        alt: "Faisal Hills, Islamabad: aerial of the central district with towers in a crescent around civic buildings and a mosque, architectural design render",
      },
      {
        image: img("faisal-hills", 3),
        title: "Gateway boulevard",
        text: "A tree-lined boulevard leading to a monumental arch.",
        alt: "Faisal Hills, Islamabad: tree-lined boulevard leading to a monumental arch gateway, architectural design render",
      },
      {
        image: img("faisal-hills", 4),
        title: "View over the neighbourhoods",
        text: "Low-rise streets, sports courts and towers, with green hills on the horizon.",
        alt: "Faisal Hills, Islamabad: view from a tower over residential streets, sports courts and hills, architectural design render",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios visualize for Faisal Hills?",
        answer:
          "Master plan renders of the Faisal Hills housing community in Islamabad: aerial views of the whole plan with its golf course and lakes, the central district, the gateway boulevard and a view over the neighbourhoods towards the hills.",
      },
      {
        question: "What does a master plan render show?",
        answer:
          "How a whole community fits together: the road network, residential sectors, towers, parks and civic buildings, and how they sit in the landscape. Faisal Hills has aerial master plan views plus street-level views of what the plan feels like on the ground.",
      },
      {
        question: "Why add street-level views to the Faisal Hills master plan?",
        answer:
          "Aerials explain the layout, but people buy the experience of the streets. The boulevard and neighbourhood views show the scale of the roads, the planting and the landmarks a resident would see every day.",
      },
    ],
    service: service.urban,
    cta: cta.masterplan,
  },

  "faisal-town-ii": {
    seo: {
      title: "Faisal Town II Islamabad | Urban Planning | Mimar Studios",
      description:
        "Urban planning renders of Faisal Town II (Phase 2), Islamabad: the plan at night, a business district, a lake district, a golf course and a stadium.",
    },
    typology: "Master-planned community",
    heading: "Faisal Town II master plan renders in Islamabad",
    paragraphs: [
      "Faisal Town II, or Faisal Town Phase 2, is a large urban development in Islamabad, [Pakistan](/3d-visualization-services-pakistan). Mimar Studios' [urban planning](/services/architectural-design/urban-planning) renders cover the whole plan and its key districts: a central business district, a lake district, a golf course and a stadium.",
      "The night aerial shows the full plan at once, with lit ring roads around neighbourhoods that curve towards a central tower. The district views come closer: glass office towers beside the golf course and its lake, a dusk view from a balcony over the lake district, and a floodlit stadium ringed by plazas and parking. Each one gives investors a picture of a part of the city that is still a plan.",
    ],
    views: [
      {
        image: img("faisal-town-ii", 2),
        title: "The plan at night",
        text: "Lit ring roads around neighbourhoods that curve towards a central tower.",
        alt: "Faisal Town II, Islamabad: night aerial of the master plan with lit ring roads and a central tower, architectural design render",
      },
      {
        image: img("faisal-town-ii", 3),
        title: "Lake district at dusk",
        text: "Residential towers along the water, seen from a balcony.",
        alt: "Faisal Town II, Islamabad: residential towers along the lake district seen from a balcony at dusk, architectural design render",
      },
      {
        image: img("faisal-town-ii", 4),
        title: "Golf course and offices",
        text: "Glass office towers rising beside the fairways and the lake.",
        alt: "Faisal Town II, Islamabad: glass office towers beside a golf course and lake, architectural design render",
      },
      {
        image: img("faisal-town-ii", 5),
        title: "Business district",
        text: "Glass towers and low buildings around a landscaped green.",
        alt: "Faisal Town II, Islamabad: business district with glass towers around a landscaped green, architectural design render",
      },
      {
        image: img("faisal-town-ii", 6),
        title: "Stadium at night",
        text: "A floodlit stadium ringed by plazas, gardens and parking.",
        alt: "Faisal Town II, Islamabad: floodlit stadium ringed by plazas and parking at night, architectural design render",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios visualize for Faisal Town II?",
        answer:
          "Urban planning renders of Faisal Town II (Phase 2) in Islamabad: aerials of the master plan by day and at night, the business district, the lake district, the golf course and the stadium.",
      },
      {
        question: "What districts does the Faisal Town II plan include?",
        answer:
          "The renders show a central business district with glass office towers, a lake district with residential towers along the water, a golf course, a stadium, and neighbourhoods linked by ring roads and green corridors.",
      },
      {
        question: "Why visualize a master plan at night?",
        answer:
          "At night the road network and the centres of activity light up, so the structure of the plan is easier to read than in daylight. It also gives the project a striking hero image for presentations.",
      },
    ],
    service: service.urban,
    cta: cta.masterplan,
  },

  hmr: {
    seo: {
      title: "HMR Karachi | Waterfront 3D Renders | Mimar Studios",
      description:
        "3D renders of HMR in Karachi: high-rise towers on the waterfront, a promenade at sunset, the skyline reflected at night and a shoreline aerial.",
    },
    typology: "Waterfront towers",
    heading: "HMR waterfront renders in Karachi",
    paragraphs: [
      "HMR is a waterfront real-estate project of high-rise towers in Karachi, [Pakistan](/3d-visualization-services-pakistan). Mimar Studios produced its marketing imagery as a set of [3D architectural renders](/services/3d-visualization): towers above the clouds, an aerial of the shoreline at night, the promenade at sunset and the skyline reflected in the water.",
      "On the waterfront, the water is half of every picture. The promenade view runs along the railing as the sun sets, with the towers lit from within. At night the skyline doubles in its reflection, and from directly above, the towers follow the curve of the shore with roads and plazas lit between them. Above the clouds, the hero view shows the scale of the towers on their own.",
    ],
    views: [
      {
        image: img("hmr", 2),
        title: "Shoreline from above",
        text: "The towers follow the curve of the shore, with lit roads and plazas between them.",
        alt: "HMR, Karachi: night aerial of high-rise towers following a curved shoreline, 3D architectural visualization",
      },
      {
        image: img("hmr", 3),
        title: "Promenade at sunset",
        text: "A railing along the water, with the lit towers behind.",
        alt: "HMR, Karachi: waterfront promenade at sunset with high-rise towers behind, 3D architectural visualization",
      },
      {
        image: img("hmr", 4),
        title: "Skyline at night",
        text: "The lit towers reflected in still water.",
        alt: "HMR, Karachi: lit waterfront towers reflected in the water at night, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for HMR?",
        answer:
          "Marketing renders of the HMR waterfront towers in Karachi: towers rising above the clouds, a night aerial of the shoreline, the promenade at sunset and the skyline reflected in the water at night.",
      },
      {
        question: "How do renders show a waterfront location?",
        answer:
          "By making the water part of every view: a promenade along the edge, reflections at night and an aerial that shows how the towers follow the shore. For HMR this tells buyers the sea front is the project's main draw.",
      },
      {
        question: "Why render HMR from directly above?",
        answer:
          "A top-down view shows how the towers, roads and plazas are arranged along the curve of the shore, which no view from the ground can show.",
      },
    ],
    service: service.visualization,
    cta: { ...cta.pakistan, heading1: "Launching in Karachi?" },
  },

  "lake-city": {
    seo: {
      title: "Lake City Lahore | Residential 3D Renders | Mimar Studios",
      description:
        "3D renders of Lake City in Lahore: residential towers under a wave-shaped canopy beside a lake, lit at night, and a rooftop terrace view.",
    },
    typology: "Residential towers",
    heading: "Lake City residential renders in Lahore",
    paragraphs: [
      "Lake City is a residential project in Lahore, [Pakistan](/3d-visualization-services-pakistan): a group of towers beside a lake, joined at the top by a wave-shaped canopy. Mimar Studios produced crisp [3D exterior renders](/services/3d-visualization) of it: the buildings lit at night across the water, a daytime view from the lakeside path and a rooftop terrace.",
      "The canopy is the project's signature, a steel lattice that flows across the three towers. The daytime view shows it above the terraced balconies, with low lakeside pavilions and a landscaped path in front. On the roof, the same idea becomes a glass canopy over a timber terrace, where residents look out over the river and the park.",
    ],
    views: [
      {
        image: img("lake-city", 2),
        title: "Towers by the lake",
        text: "Three towers joined by a wave-shaped canopy, with lakeside pavilions in front.",
        alt: "Lake City, Lahore: three residential towers joined by a wave-shaped canopy beside a lake, 3D architectural visualization",
      },
      {
        image: img("lake-city", 3),
        title: "Rooftop terrace",
        text: "A timber terrace under a curved glass canopy, overlooking the river and the park.",
        alt: "Lake City, Lahore: rooftop terrace under a curved glass canopy overlooking a river and park, 3D architectural visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios render for Lake City?",
        answer:
          "3D exterior renders of the Lake City residential towers in Lahore: the buildings lit at night across the lake, a daytime view of the three towers and their canopy, and a rooftop terrace.",
      },
      {
        question: "What is the wave-shaped canopy on Lake City?",
        answer:
          "A steel lattice roof that flows across the tops of the three towers and joins them into one composition. On the rooftop it becomes a glass canopy over the shared terrace.",
      },
      {
        question: "Why show the Lake City rooftop terrace?",
        answer:
          "It is the shared space residents will use, and it shows the view they get: the river, the park and the city beyond, under the same canopy that defines the building.",
      },
    ],
    service: service.visualization,
    cta: { ...cta.pakistan, heading1: "Launching in Lahore?" },
  },

  abuja: {
    seo: {
      title: "Abuja Nigeria | Interior Design & 3D Renders | Mimar Studios",
      description:
        "Interior design and 3D renders of a project in Abuja, Nigeria: a terraced glass building by a lake, an atrium, a bedroom and a living room.",
    },
    typology: "Mixed-use development",
    heading: "Abuja interior design and renders",
    paragraphs: [
      "This project in Abuja, Nigeria, is a long terraced glass building beside a lake, with a palm-filled atrium and private residences inside. Mimar Studios produced the [interior design](/services/architectural-design/interior-design-services) and visualization: aerial and sunset exteriors, the atrium and its reception, a bedroom and a living room.",
      "The exterior views explain the building's shape, terraces stepping down in long curves, with gardens and a pool in front and an arched bridge across the water. Inside, the atrium is a tall hall under a glazed roof, with a reception counter of marble and timber below a cascade of crystal lights. The residences carry the same materials at home scale: marble feature walls, timber slats and full-height windows over the city.",
    ],
    views: [
      {
        image: img("abuja", 1),
        title: "Aerial by the lake",
        text: "A long terraced glass building, with an arched bridge across the water.",
        alt: "Abuja, Nigeria: aerial of a long terraced glass building beside a lake with an arched bridge, 3D architectural visualization",
      },
      {
        image: img("abuja", 2),
        title: "Atrium reception",
        text: "A marble and timber reception under crystal lights, with palms and galleries around.",
        alt: "Abuja, Nigeria: atrium reception of marble and timber under crystal lights with palms, interior design visualization",
      },
      {
        image: img("abuja", 3),
        title: "Building at sunset",
        text: "The terraces catch the evening light above gardens and a pool.",
        alt: "Abuja, Nigeria: terraced glass building at sunset above gardens and a pool, 3D architectural visualization",
      },
      {
        image: img("abuja", 5),
        title: "Bedroom",
        text: "An upholstered bed and lounge chairs before full-height windows over the city.",
        alt: "Abuja, Nigeria: bedroom with an upholstered bed and lounge chairs before full-height windows, interior design visualization",
      },
      {
        image: img("abuja", 6),
        title: "Living room",
        text: "A marble media wall, timber slats and lit shelving.",
        alt: "Abuja, Nigeria: living room with a marble media wall, timber slats and lit shelving, interior design visualization",
      },
    ],
    faqs: [
      {
        question: "What did Mimar Studios create for the Abuja project?",
        answer:
          "Interior design and 3D renders of a project in Abuja, Nigeria: an aerial and a sunset view of the terraced glass building, the atrium reception, a bedroom and a living room.",
      },
      {
        question: "What interior style do the Abuja renders show?",
        answer:
          "Warm luxury: marble feature walls, timber slats and panelling, crystal lighting in the atrium, and soft neutral furniture in the residences, with full-height windows bringing in daylight.",
      },
      {
        question: "Does Mimar Studios work on projects in Nigeria?",
        answer:
          "Yes. The Abuja project is one example. The studio's portfolio also includes projects in the UAE, Saudi Arabia, Oman, Pakistan and the USA.",
      },
    ],
    service: service.interior,
    cta: cta.interior,
  },
};
