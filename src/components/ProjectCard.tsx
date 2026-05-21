import { useRef, useEffect, useState } from "react";
import GallerySlot, { type MediaItem } from "./GallerySlot";

export interface Project {
  name: string;
  year: string;
  collaborator?: string;
  services: string[];
  link?: string;
  media?: MediaItem[];
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const articleRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);

  const isSingleMedia = (project.media?.length ?? 0) <= 1;

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    if (!mql.matches) return;
    if (isSingleMedia) return;

    let id = 0;

    const loop = () => {
      const a = articleRef.current;
      const g = galleryRef.current;

      if (a && g) {
        const scrollRange = g.scrollWidth - g.clientWidth;
        const newSpacerHeight = scrollRange > 0 ? Math.round(scrollRange * 1.3) : 0;
        setSpacerHeight((prev) => (prev !== newSpacerHeight ? newSpacerHeight : prev));

        const r = a.getBoundingClientRect();
        const scrollableHeight = r.height - window.innerHeight;
        const p = Math.max(0, Math.min(1, -r.top / scrollableHeight));
        g.scrollLeft = p * scrollRange;
      }

      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [isSingleMedia]);

  return (
    <article
      ref={articleRef}
      className={
        isSingleMedia
          ? "min-h-0 lg:grid lg:grid-cols-12 gap-x-8 relative py-6 md:py-10 lg:min-h-[180vh]"
          : "min-h-0 lg:grid lg:grid-cols-12 gap-x-8 relative py-6 md:py-10"
      }
    >
      <div className="hidden lg:block lg:col-span-2" />

      <div className="lg:col-span-2 whitespace-pre-line sticky top-4 lg:top-6 self-start z-10 text-foreground lg:pb-16">
        <h2 className="text-sm tracking-tight font-medium inline-flex items-center">
          {project.name}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} website (opens in new tab)`}
              className="ml-1.5 hover:opacity-70 text-sm"
            >
              ↗
            </a>
          )}
        </h2>
        <p className="text-sm mt-1">
          {`(${project.year}${project.collaborator ? `, w/ ${project.collaborator}` : ""})`}
        </p>
        <div className="mt-4 text-sm tracking-wide leading-relaxed">
          {project.services.map((s, i) => (
            <div key={s}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div
        className={
          isSingleMedia
            ? "lg:col-span-8 lg:col-start-5 sticky top-4 lg:top-6 self-start z-10 lg:pb-16"
            : "lg:col-span-8 lg:col-start-5 self-start lg:pb-16"
        }
      >
        <div
          className="pointer-events-none"
          style={{ height: spacerHeight > 0 ? `${spacerHeight}px` : "auto" }}
        >
          <div
            ref={galleryRef}
            className={
              isSingleMedia
                ? "overflow-x-hidden"
                : "lg:sticky lg:top-6 lg:h-[90vh] overflow-x-hidden"
            }
          >
            <div
              className={
                isSingleMedia
                  ? "flex flex-col gap-3 lg:gap-4"
                  : "flex flex-col gap-3 lg:flex-row lg:flex-nowrap lg:gap-4 lg:h-full"
              }
            >
              {project.media && project.media.length > 0
                ? project.media.map((item, i) => (
                    <GallerySlot key={i} media={item} projectName={project.name} />
                  ))
                : [1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="w-full aspect-[3/2] rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 lg:w-[60vw] lg:min-w-[60vw] lg:h-full"
                    >
                      <span className="text-muted-foreground text-xs tracking-widest uppercase">
                        {project.name}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
