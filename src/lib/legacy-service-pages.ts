// Standalone service pages restored at their old WordPress URLs. Titles,
// meta descriptions and body copy come from the old pages (SEO_MIGRATION.md
// §0.2); only the layout follows the new design. The old site had no meta
// keywords tag, so keywords are taken from each page's own title and copy.

export type LegacyServiceImage = { src: string; alt: string; aspect?: "video" | "square" | "portrait" };

export type LegacyServicePage = {
  path: string;
  /** Main service this page sits under, for the breadcrumb and back link. */
  parentSlug: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  title: string;
  tagline: string;
  hero: { type: "image" | "video"; src: string; poster?: string };
  intro: string[];
  introList?: string[];
  introImage: LegacyServiceImage;
  sections: {
    heading: string;
    body?: string[];
    lists?: { label?: string; items: string[] }[];
    after?: string[];
    images?: LegacyServiceImage[];
  }[];
  /** Heading is split in two: the second part renders in the accent colour. */
  cta: { heading: [string, string]; body: string };
};

const spatial = "/services/architectural-design/sample-spatial-data";

export const legacyServicePages = {
  tvCommercials: {
    path: "/services/marketing/tv-commercials-and-advertisements",
    parentSlug: "marketing",
    seoTitle: "TV Commercials and Advertisements - mimAR",
    seoDescription: "Let's build your brand identity",
    keywords: ["TV commercials", "real estate advertisements", "real estate showreels", "DVC", "video commercials"],
    title: "TV Commercials and Advertisements",
    tagline: "Let’s build your brand identity",
    hero: { type: "video", src: "/services/animations.mp4", poster: "/services/animations-poster.jpg" },
    intro: [
      "We create TV commercials to promote our clients’ projects. Video editing experts at MIMAR seamlessly combine live footage and images with 3D rendered scenes.",
      "These video commercials use emotions, storytelling, and visuals to leave deep impressions on viewers.",
    ],
    introImage: { src: "/services/tv-commercials/tv-commercial-film-set.webp", alt: "TV commercial film set lit for a real estate advertisement shoot" },
    sections: [
      {
        heading: "Real Estate Project Showreels / DVCs",
        body: ["Our DVC commercials are perfectly suited to your social media promotional videos. Videos such as these are excellent for the purposes of establishing your brand."],
        images: [{ src: "/services/tv-commercials/real-estate-billboard-360-residences.webp", alt: "360 Residences real estate billboard advertisement by Mimar Studios", aspect: "square" }],
      },
    ],
    cta: { heading: ["Let’s build", "your brand identity."], body: "Tell us about your project and we will plan the commercial around it." },
  },
  terrainMapping: {
    path: "/services/3d-visualization-hamza/terrain-mapping",
    parentSlug: "3d-visualization",
    seoTitle: "Terrain Mapping - mimAR",
    seoDescription: "Topographic mapping at its finest!",
    keywords: ["terrain mapping", "topographic mapping", "drone mapping", "3D terrain model", "site topography"],
    title: "Terrain Mapping",
    tagline: "Topographic mapping at its finest!",
    hero: { type: "video", src: "/services/terrain-mapping/terrain-mapping-flyover.webm", poster: "/services/terrain-mapping/terrain-3d-model-quarry.webp" },
    intro: [
      "Mimar uses its innovative technology to deliver state-of-the-art topographic mapping services.",
      "Our drones map out your site’s topography in 3D on-site to ensure accurate colors and textures. The terrain map shows the shape and location of the site, in addition to other useful features.",
      "There are a number of features that can help you understand your property better. You can make better decisions based on these features such as water source, vegetation, roads, and streets, etc.",
    ],
    introImage: { src: "/services/terrain-mapping/terrain-3d-model-quarry.webp", alt: "3D terrain model of a quarry site captured by drone mapping" },
    sections: [
      {
        heading: "Site Findings",
        body: ["The terrain map records the shape of the site and the features that matter for planning, from pits and boulders to vegetation, access roads and vistas."],
        images: [{ src: "/services/terrain-mapping/terrain-map-site-findings.webp", alt: "Annotated terrain map showing pits, boulders, quarry dust, tree clusters and vistas" }],
      },
    ],
    cta: { heading: ["Have more questions?", "Let’s talk."], body: "Our team is ready to assist you with all your questions." },
  },
  sampleSpatialData: {
    path: "/services/architectural-design/smart-topography-survey/sample-spatial-data",
    parentSlug: "architectural-design",
    seoTitle: "Sample Spatial Data - mimAR",
    seoDescription: "Representative Outputs, Equipment & Survey Approach for Aerial LiDAR and 3D Documentation Projects",
    keywords: ["sample spatial data", "aerial LiDAR survey", "LiDAR point cloud", "drone 3D documentation", "smart topography survey"],
    title: "Sample Spatial Data",
    tagline: "Representative Outputs, Equipment & Survey Approach for Aerial LiDAR and 3D Documentation Projects",
    hero: { type: "image", src: `${spatial}/uav-lidar-survey-grid.webp` },
    intro: [
      "This page presents representative examples of spatial data outputs, equipment, and survey methods used in our aerial LiDAR and 3D documentation projects.",
      "It is intended to help clients understand:",
    ],
    introList: [
      "The type of outputs we deliver",
      "The formats in which data is shared",
      "The equipment and platforms typically deployed",
      "The general survey process and limitations associated with aerial data capture",
    ],
    introImage: { src: `${spatial}/uav-lidar-terrain-scan.webp`, alt: "UAV scanning terrain with LiDAR to build a 3D surface model" },
    sections: [
      {
        heading: "3D Model Outputs (Surface & Feature Models)",
        body: ["We produce three-dimensional surface and feature models representing visible terrain and exposed features captured during aerial surveys."],
        lists: [
          { label: "Formats", items: ["OBJ", "GLB", "FBX"] },
          { label: "These formats are compatible with", items: ["GIS platforms", "3D viewers", "Web-based visualization tools", "Reporting and presentation workflows"] },
          { label: "Delivery", items: ["Secure cloud links", "Web-hosted viewers (for review and reference)", "Downloadable files for local use"] },
        ],
        images: [
          { src: `${spatial}/3d-model-archaeological-site.webp`, alt: "3D surface model of an archaeological site from an aerial survey" },
          { src: `${spatial}/3d-model-vegetated-hill.webp`, alt: "3D feature model of a vegetated hill" },
          { src: `${spatial}/3d-surface-model-hillside-town.webp`, alt: "3D surface model of a hillside town" },
        ],
      },
      {
        heading: "LiDAR Point Cloud Outputs",
        body: ["LiDAR point clouds capture three-dimensional spatial measurements of terrain and visible surfaces using aerial laser scanning."],
        lists: [
          { label: "Formats", items: ["LAS / LAZ", "PTX / PTS (where applicable)"] },
          { label: "Typical uses", items: ["Terrain analysis", "Surface interpretation", "Generation of derived products (e.g., hillshades, contours, meshes)", "Archival documentation"] },
        ],
        after: ["Point cloud data is delivered digitally via secure cloud storage."],
        images: [
          { src: `${spatial}/lidar-point-cloud-landslides.webp`, alt: "LiDAR point cloud and elevation model showing landslides" },
          { src: `${spatial}/point-cloud-excavation-views.webp`, alt: "Point cloud views of an excavation site" },
        ],
      },
      {
        heading: "UAV (Drone) Platforms",
        body: ["We conduct surveys using multirotor UAV platforms suitable for low-altitude, high-resolution spatial documentation."],
        lists: [{ label: "Typical UAV categories include", items: ["Custom-built multirotor platforms", "Commercial multirotor UAVs of comparable capability"] }],
        after: ["Equivalent UAV platforms may be deployed depending on site conditions, logistics, and operational requirements."],
        images: [
          { src: `${spatial}/custom-multirotor-uav.webp`, alt: "Custom-built multirotor UAV with a LiDAR payload" },
          { src: `${spatial}/commercial-multirotor-uav.webp`, alt: "Commercial multirotor UAV for aerial surveys" },
        ],
      },
      {
        heading: "LiDAR Sensors",
        body: ["Our surveys utilize compact UAV-mounted LiDAR sensors designed for aerial terrain and surface documentation."],
        lists: [{ label: "Sensor selection may vary based on", items: ["Project scope", "Site accessibility", "Environmental conditions"] }],
        after: ["Final outputs remain consistent with agreed delivery formats regardless of sensor model."],
        images: [{ src: `${spatial}/uav-lidar-sensor.webp`, alt: "Compact UAV-mounted LiDAR sensor" }],
      },
      {
        heading: "Survey Process (High-Level Overview)",
        lists: [{
          label: "Our typical aerial survey workflow includes",
          items: [
            "Review of client-provided site boundaries",
            "Flight planning and on-site assessment",
            "Aerial data capture using visual line-of-sight (VLOS) UAV operations",
            "Data processing and generation of spatial outputs",
            "Digital delivery of agreed datasets",
          ],
        }],
        after: ["Surveys focus on visually clear terrain and exposed features observable from the air."],
        images: [{ src: `${spatial}/lidar-data-acquisition-process.webp`, alt: "Diagram of the LiDAR data acquisition process with UAV, GPS and ground station" }],
      },
      {
        heading: "Derived Visual Outputs (Representative)",
        body: ["In addition to raw data, we may provide derived visual products to support interpretation and reporting, such as:"],
        lists: [{ items: ["LiDAR-derived hillshade images", "Orthographic (top-down) views of survey areas", "Representative screenshots for documentation"] }],
        after: ["These outputs assist in visual analysis and communication of site features."],
        images: [
          { src: `${spatial}/lidar-hillshade-comparison.webp`, alt: "LiDAR-derived hillshade images compared side by side" },
          { src: `${spatial}/lidar-hillshade-terrain.webp`, alt: "LiDAR hillshade of a terrain survey area" },
          { src: `${spatial}/orthographic-hillshade-survey-area.webp`, alt: "Orthographic hillshade view of a survey area with scale bar" },
        ],
      },
      {
        heading: "General Disclaimer & Limitations",
        body: ["Aerial LiDAR and drone-based 3D documentation are subject to inherent technical and environmental limitations."],
        lists: [{
          label: "Factors that may affect results include",
          items: ["Vegetation density (trees, shrubs, ground cover)", "Surface visibility", "Weather and wind conditions", "Terrain complexity", "Stage of excavation or site exposure"],
        }],
        after: [
          "Areas with dense vegetation or surfaces not visible from the air may produce limited or no usable data. Submerged or underwater features are outside the scope of standard aerial LiDAR surveys.",
          "All outputs are provided for documentation, interpretation, and research purposes, and are not intended for certified engineering or construction use unless explicitly stated.",
        ],
      },
      {
        heading: "Use of Sample Data",
        body: ["The examples shown on this page are illustrative only and are intended to demonstrate:"],
        lists: [{ items: ["Output formats", "Typical level of detail", "General visualization style"] }],
        after: ["Actual project deliverables may vary depending on site conditions and agreed scope."],
      },
    ],
    cta: {
      heading: ["Planning a survey?", "Contact us."],
      body: "For project-specific deliverables, equipment selection, or survey planning, please contact us to discuss your requirements.",
    },
  },
} satisfies Record<string, LegacyServicePage>;
