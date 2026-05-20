// The /designbycc/ wordmark with the "cc" portion rendered in the muted
// "Inactive grey" token (documented in /styleguide → Color).
//
// Two visual contexts to handle:
//   • "default" — direct rendering on cream bg (styleguide, OG previews).
//     Uses #999999 — a medium grey, ~15% darker than the prior #b3b3b3.
//   • "blended" — used inside elements with mix-blend-mode: difference (the
//     site header). Difference math inverts colors against the cream bg, so
//     a lighter source value renders DARKER on screen. #464646 produces
//     a muted beige (~#9f978c) — matching the styleguide darkness.

type Variant = "default" | "blended";

const Wordmark = ({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: Variant;
}) => {
  const ccColorClass =
    variant === "blended" ? "text-[#464646]" : "text-[#999999]";
  return (
    <span className={className}>
      /designby<span className={ccColorClass}>cc</span>/
    </span>
  );
};

export default Wordmark;
