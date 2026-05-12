const Hero = () => (
  <section id="about" className="pt-44 pb-16 px-6 md:px-10 lg:px-[26px] md:pt-48 md:pb-24">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-start-5 lg:col-span-8">
        <h1
          className="text-3xl md:text-4xl lg:text-[42px] leading-[1.15] tracking-tight max-w-2xl font-medium"
        >
          Intellectually-stimulating, handcrafted web experiences
        </h1>

        <div className="mt-10 max-w-md space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Quartzo is a studio where design & tech are one.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We're spirited friends making unique websites, online shops, editorial platforms, and functional apps that de-clutter the internet.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Want to build one of those?
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

    <hr className="mt-16 md:mt-24 border-border" />
  </section>
);

export default Hero;
