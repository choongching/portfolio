const Hero = () => (
  <section id="about" className="min-h-screen pt-32 pb-16 px-6 md:px-10 lg:px-[26px] md:pt-36 md:pb-24">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-start-5 lg:col-span-8">
        <h1
          className="text-[30px] md:text-[36px] lg:text-[48px] leading-[1.4] md:leading-[1.2] lg:leading-[1.0] tracking-tight max-w-2xl font-medium"
        >
          Enterprise users{" "}
          <br className="hidden lg:block" />
          just want to get the work{" "}
          <br className="hidden lg:block" />
          done and move on.
        </h1>

        <div className="mt-10 max-w-[28rem] space-y-6">
          <p className="text-[16px] leading-relaxed text-muted-foreground">
            I design the workflows that get them there. Right now I'm at Trustana, building AI tools that help enterprise retailers manage product data at scale.
          </p>
          <p className="text-[16px] leading-relaxed text-muted-foreground">
            12 years and five startups later, I'm still mostly the sole product designer, still building from zero to one.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <a
              href="https://linkedin.com/in/choongching"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              LinkedIn →
            </a>
            <a
              href="/resume.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Resume →
            </a>
          </div>
        </div>
      </div>
    </div>

  </section>
);

export default Hero;
