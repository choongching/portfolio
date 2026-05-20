import type { Project } from "./ProjectCard";
import ProjectCard from "./ProjectCard";
import testImg from "@/assets/test-gallery.png";

const img = (alt: string) => [
  { type: "image" as const, src: testImg, alt },
  { type: "image" as const, src: testImg, alt },
  { type: "image" as const, src: testImg, alt },
];

const projects: Project[] = [
  {
    name: "Trustana",
    year: "2026",
    services: [],
    link: "https://www.trustana.com",
    media: [
      {
        type: "video",
        src: "/trustana-walkthrough.mp4",
        webmSrc: "/trustana-walkthrough.webm",
        poster: "/trustana-poster.webp",
        ariaLabel:
          "Trustana — silent product walkthrough showing AI-assisted data enrichment flow",
        description:
          "Looping walkthrough of the Trustana enterprise product. Shows a product catalog with attribute enrichment, an AI auto-transform workflow, and the data-enrichment configuration panel powered by Claude Opus 4.5.",
      },
    ],
  },
  // Hidden case studies — restore by uncommenting when each has its own media set ready.
  // { name: "Geer", year: "2025", collaborator: "Yungfrish", services: ["Digital product", "Engineering", "Design system", "Visual id."], link: "https://geer.bike/", media: img("Geer") },
  // { name: "Buildoptima", year: "2024", services: ["Digital product", "Design system", "Visual id."], media: img("Buildoptima") },
  // { name: "Tochak", year: "2024", services: ["Website", "Visual id."], media: img("Tochak") },
  // { name: "Nash", year: "2023", services: ["Engineering"], link: "https://nash.io/", media: img("Nash") },
  // { name: "SmartRegistros", year: "2020", services: ["Digital product", "Design system", "Visual id."], media: img("SmartRegistros") },
  // { name: "Shift", year: "2021", collaborator: "Yungfrish", services: ["Design system", "Visual id."], media: img("Shift") },
  // { name: "Wowtes", year: "2020", services: ["Digital product", "Design system", "Visual id."], link: "https://wowt.es/", media: img("Wowtes") },
];

const Projects = () => (
  <section
    id="work"
    aria-label="Selected work"
    className="px-6 md:px-10 lg:px-[26px]"
  >
    {projects.map((project, i) => (
      <ProjectCard key={project.name} project={project} index={i} />
    ))}
  </section>
);

export default Projects;
