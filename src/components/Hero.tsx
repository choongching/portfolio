const Hero = () => (
  <section id="about" className="min-h-screen pt-44 pb-16 px-6 md:px-10 lg:px-[26px] md:pt-48 md:pb-24">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-start-5 lg:col-span-8">
        <h1
          className="text-[30px] md:text-[36px] lg:text-[56px] leading-[1.4] md:leading-[1.2] lg:leading-[1.0] tracking-tight max-w-2xl font-medium"
        >
          Enterprise users just want to get the work done and move on.
        </h1>

        <div className="mt-10 max-w-[35rem] space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            I design the workflows that get them there. Right now I'm at Trustana, building AI tools for enterprise retailers. 12 years, five startups, mostly as the sole product designer building from zero to one. Based in Singapore. I'm CC.
          </p>
          <a
            href="#contact"
            className="inline-block text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Let's talk →
          </a>
        </div>
      </div>
    </div>

  </section>
);

export default Hero;
