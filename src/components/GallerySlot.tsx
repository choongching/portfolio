import { lazy, Suspense, useEffect, useState } from "react";

const Lottie = lazy(() => import("lottie-react"));

export type MediaItem =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; poster?: string; webmSrc?: string }
  | { type: "lottie"; src: string };

interface GallerySlotProps {
  media: MediaItem;
  projectName: string;
}

const GallerySlot = ({ media, projectName }: GallerySlotProps) => {
  const base =
    "w-full aspect-[3/2] rounded-lg bg-secondary flex-shrink-0 lg:w-[60vw] lg:min-w-[60vw] lg:h-full overflow-hidden";

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
    return (
      <div className={base}>
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={media.poster}
          className="w-full h-full object-cover"
        >
          {media.webmSrc && <source src={media.webmSrc} type="video/webm" />}
          <source src={media.src} type="video/mp4" />
        </video>
      </div>
    );
  }

  if (media.type === "lottie") {
    return (
      <LottieSlot src={media.src} className={base} />
    );
  }

  return null;
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
