import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Wordmark from "@/components/Wordmark";

type Token = {
  name: string;
  classes: string;
  size: string;
  leading: string;
  tracking: string;
  weight: string;
  sample: ReactNode;
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
    sample: <Wordmark />,
  },
  {
    name: "Logo (mobile)",
    classes: "text-[26px] tracking-tight font-medium",
    size: "26 px",
    leading: "normal (1.5)",
    tracking: "-0.025em",
    weight: "500",
    sample: <Wordmark />,
  },
  {
    name: "Lede",
    classes: "text-[16px] leading-relaxed",
    size: "16 px",
    leading: "1.625 (26 px)",
    tracking: "normal",
    weight: "400",
    sample: bodySample,
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

type Color = {
  name: string;
  hex: string;
  role: string;
};

const colors: Color[] = [
  {
    name: "Cream",
    hex: "#e5ddd2",
    role: "Background. Site body, theme-color meta, OG image canvas.",
  },
  {
    name: "Ink",
    hex: "#1a1a1a",
    role: 'Primary text on cream. Headings, body, and the "/designby" portion of the wordmark.',
  },
  {
    name: "Muted",
    hex: "#6b5d4f",
    role: "Secondary labels, eyebrows, captions.",
  },
  {
    name: "Inactive grey",
    hex: "#999999",
    role: 'Wordmark second half — the "cc" in /designbycc/. In contexts with mix-blend-mode: difference (the site header), the runtime source uses #464646 to produce a matching muted beige after the blend.',
  },
  {
    name: "Terracotta",
    hex: "#b85a4e",
    role: "Accent. Used sparingly — single dots, highlights, rare emphasis.",
  },
];

type SocialAsset = {
  label: string;
  src: string;
  filePath: string;
  dimensions: string;
  fileSize: string;
  appearsOn: string;
  altText: string;
};

const socialAssets: SocialAsset[] = [
  {
    label: "OG — Homepage",
    src: "/og-home.png",
    filePath: "public/og-home.png",
    dimensions: "1200 × 630 px",
    fileSize: "~37 KB PNG",
    appearsOn: "Share preview for / on LinkedIn, Twitter, Slack, Facebook.",
    altText: "/designbycc/ — Portfolio of Choong Ching Teo, Product Designer",
  },
  {
    label: "OG — Resume",
    src: "/og-resume.png",
    filePath: "public/og-resume.png",
    dimensions: "1200 × 630 px",
    fileSize: "~36 KB PNG",
    appearsOn: "Share preview for /resume.",
    altText: "/designbycc/ — Résumé of CC Teo, Product Designer, Singapore",
  },
];

type SeoPattern = {
  label: string;
  description: string;
  example: string;
};

const seoPatterns: SeoPattern[] = [
  {
    label: "Title",
    description:
      '"CC Teo, Product Designer | <Context>". Identity first, role second, context third. Pipe as separator.',
    example: "CC Teo, Product Designer | Enterprise, AI, Zero-to-One",
  },
  {
    label: "Description",
    description:
      "Three sentences: (1) who, (2) what + scale + scope, (3) currently. Used identically across meta description, og:description, and twitter:description.",
    example:
      "CC Teo is a product designer in Singapore. 12 years of enterprise tools, AI products, and zero-to-one building across five startups. Currently at Trustana.",
  },
  {
    label: "og:type",
    description:
      '"website" for the homepage and any general-purpose page. "profile" for /resume or any page primarily about a person.',
    example: 'homepage → "website"   ·   /resume → "profile"',
  },
  {
    label: "Canonical URL",
    description:
      "Always reflects the URL the page is actually served at, after any extension stripping or redirects. Apex redirects to www; .html strips to extensionless.",
    example: "https://www.designby.cc/   ·   https://www.designby.cc/resume",
  },
  {
    label: "JSON-LD",
    description:
      "Person + WebSite schema on homepage; Person (with worksFor, alumniOf, knowsAbout, sameAs) on resume. jobTitle is always 'Product Designer'.",
    example: '"@type": "Person", "jobTitle": "Product Designer"',
  },
  {
    label: "sameAs (Knowledge Graph)",
    description:
      "Cross-link to authoritative third-party profiles so Google ties the brand together.",
    example: "linkedin.com/in/choongching · dribbble.com/choongching · github.com/choongching",
  },
];

const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[5rem_1fr] gap-3 text-xs">
    <span className="uppercase tracking-widest text-muted-foreground">{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);

type SectionHeaderProps = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
};

const SectionHeader = ({ id, eyebrow, title, intro }: SectionHeaderProps) => (
  <section
    id={id}
    className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 scroll-mt-24"
  >
    <div className="lg:col-start-5 lg:col-span-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
        {eyebrow}
      </p>
      <h2 className="text-[30px] md:text-[36px] lg:text-[48px] leading-[1.4] md:leading-[1.2] lg:leading-[1.0] tracking-tight font-medium">
        {title}
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-[35rem]">
        {intro}
      </p>
    </div>
  </section>
);

const Styleguide = () => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="px-6 md:px-10 lg:px-[26px] py-5 flex justify-between items-center">
      <Link to="/" className="text-[31px] tracking-tight font-medium">
        <Wordmark />
      </Link>
      <Link
        to="/"
        className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity"
      >
        ← Back to home
      </Link>
    </header>

    <main className="px-6 md:px-10 lg:px-[26px] pt-24 pb-32">
      {/* Page intro */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-start-5 lg:col-span-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            /designbycc/
          </p>
          <h1 className="text-[30px] md:text-[36px] lg:text-[48px] leading-[1.4] md:leading-[1.2] lg:leading-[1.0] tracking-tight font-medium">
            Design system
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-[35rem]">
            Type, color, social-share images, and SEO conventions used across the
            portfolio. Source of truth for what's deployed today. Long-form spec
            lives in{" "}
            <code className="font-mono text-foreground">docs/asset-guidelines.md</code>.
          </p>
          <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="#typography" className="underline underline-offset-4 hover:opacity-70">
              Typography
            </a>
            <a href="#color" className="underline underline-offset-4 hover:opacity-70">
              Color
            </a>
            <a href="#social" className="underline underline-offset-4 hover:opacity-70">
              Social-share images
            </a>
            <a href="#seo" className="underline underline-offset-4 hover:opacity-70">
              SEO metadata
            </a>
          </nav>
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Section: Typography */}
      <SectionHeader
        id="typography"
        eyebrow="Section 01"
        title="Typography"
        intro="Every type token used across the portfolio, with classes, specs, and live samples."
      />

      <section className="space-y-16 mb-24">
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

      <hr className="border-border mb-12" />

      {/* Section: Color */}
      <SectionHeader
        id="color"
        eyebrow="Section 02"
        title="Color"
        intro="The cream-on-ink palette. Used across the site UI, OG images, and favicon. Hex values are the source of truth — Tailwind tokens reference these."
      />

      <section className="space-y-12 mb-24">
        {colors.map((color) => (
          <article
            key={color.name}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {color.name}
              </p>
              <p className="text-sm font-mono">{color.hex}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {color.role}
              </p>
            </div>
            <div className="lg:col-start-5 lg:col-span-8">
              <div
                className="h-32 w-full rounded-sm border border-border"
                style={{ backgroundColor: color.hex }}
              />
            </div>
          </article>
        ))}
      </section>

      <hr className="border-border mb-12" />

      {/* Section: Social-share images */}
      <SectionHeader
        id="social"
        eyebrow="Section 03"
        title="Social-share images"
        intro="Open Graph cards used for LinkedIn, Twitter, Slack, and Facebook previews. Same template across both — eyebrow + two-tone /designbycc/ wordmark + single-line subtitle. Rendered via Chrome headless from HTML templates."
      />

      <section className="space-y-12 mb-24">
        {socialAssets.map((asset) => (
          <article
            key={asset.label}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {asset.label}
              </p>
              <p className="text-sm font-mono break-all">{asset.filePath}</p>
              <div className="pt-3 space-y-1.5 border-t border-border">
                <SpecRow label="Dim" value={asset.dimensions} />
                <SpecRow label="Size" value={asset.fileSize} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                {asset.appearsOn}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2 italic">
                Alt: {asset.altText}
              </p>
            </div>
            <div className="lg:col-start-5 lg:col-span-8">
              <img
                src={asset.src}
                alt={asset.altText}
                width={1200}
                height={630}
                className="w-full h-auto border border-border rounded-sm"
              />
            </div>
          </article>
        ))}
      </section>

      <hr className="border-border mb-12" />

      {/* Section: SEO metadata */}
      <SectionHeader
        id="seo"
        eyebrow="Section 04"
        title="SEO metadata"
        intro="Patterns that apply across every page on the site. Source of truth for adding any new page's meta block."
      />

      <section className="space-y-12 mb-12">
        {seoPatterns.map((pattern) => (
          <article
            key={pattern.label}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {pattern.label}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pattern.description}
              </p>
            </div>
            <div className="lg:col-start-5 lg:col-span-8">
              <p className="text-sm font-mono break-words leading-relaxed">
                {pattern.example}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  </div>
);

export default Styleguide;
