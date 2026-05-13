import { Link } from "react-router-dom";

type Token = {
  name: string;
  classes: string;
  size: string;
  leading: string;
  tracking: string;
  weight: string;
  sample: string;
};

const displaySample = "Enterprise users just want to get the work done and move on.";
const bodySample =
  "I design the workflows that get them there. Right now I'm at Trustana, building AI tools for enterprise retailers.";
const labelSample = "Collaborations & Projects";
const decoSample = "Made on a Mac";

const tokens: Token[] = [
  {
    name: "Display (lg)",
    classes: "text-[48px] leading-[1.0] tracking-tight font-medium",
    size: "48 px",
    leading: "1.0 (48 px)",
    tracking: "-0.025em",
    weight: "500",
    sample: displaySample,
  },
  {
    name: "Display (md)",
    classes: "text-[36px] leading-[1.2] tracking-tight font-medium",
    size: "36 px",
    leading: "1.2 (43.2 px)",
    tracking: "-0.025em",
    weight: "500",
    sample: displaySample,
  },
  {
    name: "Display (mobile)",
    classes: "text-[30px] leading-[1.4] tracking-tight font-medium",
    size: "30 px",
    leading: "1.4 (42 px)",
    tracking: "-0.025em",
    weight: "500",
    sample: displaySample,
  },
  {
    name: "Logo (desktop)",
    classes: "text-[31px] tracking-tight font-medium",
    size: "31 px",
    leading: "normal (1.5)",
    tracking: "-0.025em",
    weight: "500",
    sample: "/designbycc/",
  },
  {
    name: "Logo (mobile)",
    classes: "text-[26px] tracking-tight font-medium",
    size: "26 px",
    leading: "normal (1.5)",
    tracking: "-0.025em",
    weight: "500",
    sample: "/designbycc/",
  },
  {
    name: "Body",
    classes: "text-sm leading-relaxed",
    size: "14 px",
    leading: "1.625 (22.75 px)",
    tracking: "normal",
    weight: "400",
    sample: bodySample,
  },
  {
    name: "Label",
    classes: "text-xs leading-snug uppercase tracking-widest text-muted-foreground",
    size: "12 px",
    leading: "1.375 (16.5 px)",
    tracking: "widest (0.1em)",
    weight: "400",
    sample: labelSample,
  },
  {
    name: "Decorative — 10 px",
    classes: "text-[10px] leading-none uppercase tracking-widest text-muted-foreground",
    size: "10 px",
    leading: "1 (10 px)",
    tracking: "widest (0.1em)",
    weight: "400",
    sample: decoSample,
  },
  {
    name: "Decorative — 7 px",
    classes: "text-[7px] leading-none uppercase tracking-widest text-muted-foreground",
    size: "7 px",
    leading: "1 (7 px)",
    tracking: "widest (0.1em)",
    weight: "400",
    sample: "BADGE MICRO",
  },
];

const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[5rem_1fr] gap-3 text-xs">
    <span className="uppercase tracking-widest text-muted-foreground">{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);

const Styleguide = () => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="px-6 md:px-10 lg:px-[26px] py-5 flex justify-between items-center">
      <Link to="/" className="text-[31px] tracking-tight font-medium">
        /designbycc/
      </Link>
      <Link
        to="/"
        className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity"
      >
        ← Back to home
      </Link>
    </header>

    <main className="px-6 md:px-10 lg:px-[26px] pt-24 pb-32">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        <div className="lg:col-start-5 lg:col-span-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Design system
          </p>
          <h1 className="text-[30px] md:text-[36px] lg:text-[48px] leading-[1.4] md:leading-[1.2] lg:leading-[1.0] tracking-tight font-medium">
            Typography
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-[35rem]">
            Every type token used across the portfolio, with classes, specs, and live
            samples. Source of truth for sizes and leading lives in{" "}
            <code className="font-mono text-foreground">docs/asset-guidelines.md</code>.
          </p>
        </div>
      </section>

      <hr className="border-border mb-12" />

      <section className="space-y-16">
        {tokens.map((token) => (
          <article
            key={token.name}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {token.name}
              </p>
              <p className="text-sm font-mono break-all">{token.classes}</p>
              <div className="pt-3 space-y-1.5 border-t border-border">
                <SpecRow label="Size" value={token.size} />
                <SpecRow label="Leading" value={token.leading} />
                <SpecRow label="Tracking" value={token.tracking} />
                <SpecRow label="Weight" value={token.weight} />
              </div>
            </div>

            <div className="lg:col-start-5 lg:col-span-8">
              <p className={token.classes}>{token.sample}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  </div>
);

export default Styleguide;
