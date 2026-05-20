import { lazy, Suspense, useEffect, useRef, useState } from "react";

const Lottie = lazy(() => import("lottie-react"));

export type MediaItem =
  | { type: "image"; src: string; alt?: string }
  | {
      type: "video";
      src: string;
      poster?: string;
      webmSrc?: string;
      ariaLabel?: string;
      description?: string;
    }
  | { type: "lottie"; src: string };

interface GallerySlotProps {
  media: MediaItem;
  projectName: string;
}

const GallerySlot = ({ media, projectName }: GallerySlotProps) => {
  const base =
    "w-full aspect-[3/2] rounded-lg bg-secondary flex-shrink-0 lg:w-[60vw] lg:min-w-[60vw] lg:h-full overflow-hidden";

  // Video uses its native 16:9 aspect ratio so 1280×720 content fits without left/right crop.
  // self-start prevents the flex parent from vertically stretching past the aspect ratio.
  const videoBase =
    "w-full aspect-video rounded-[4px] bg-secondary lg:w-full lg:min-w-0 lg:self-start overflow-hidden";

  if (media.type === "image") {
    return (
      <div className={base}>
        <img
          src={media.src}
          alt={media.alt ?? projectName}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (media.type === "video") {
    return <VideoSlot media={media} projectName={projectName} className={videoBase} />;
  }

  if (media.type === "lottie") {
    return (
      <LottieSlot src={media.src} className={base} />
    );
  }

  return null;
};

type VideoMedia = Extract<MediaItem, { type: "video" }>;

const VideoSlot = ({
  media,
  projectName,
  className,
}: {
  media: VideoMedia;
  projectName: string;
  className: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const descriptionId = `${projectName.toLowerCase().replace(/\s+/g, "-")}-video-desc`;
  const label = media.ariaLabel ?? `${projectName} — product walkthrough video`;

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);

    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) video.pause();
    else void video.play().catch(() => {});
  }, [reducedMotion]);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="auto"
        poster={media.poster}
        aria-label={label}
        aria-describedby={media.description ? descriptionId : undefined}
        className="w-full h-full object-contain"
      >
        {media.webmSrc && <source src={media.webmSrc} type="video/webm" />}
        <source src={media.src} type="video/mp4" />
        <p>
          Your browser doesn't support embedded video. View{" "}
          <a href={media.src}>the walkthrough video</a> directly.
        </p>
      </video>
      {media.description && (
        <p id={descriptionId} className="sr-only">
          {media.description}
        </p>
      )}
    </div>
  );
};

const LottieSlot = ({ src, className }: { src: string; className: string }) => {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    fetch(src)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [src]);

  if (!data) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <span className="text-muted-foreground text-xs tracking-widest uppercase">Loading…</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Suspense fallback={null}>
        <Lottie animationData={data} loop className="w-full h-full" />
      </Suspense>
    </div>
  );
};

export default GallerySlot;
