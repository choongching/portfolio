const EmailLink = () => (
  <a
    href="mailto:everyone@quartzo.studio"
    className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors"
  >
    everyone@quartzo.studio
  </a>
);

const Footer = () => (
  <footer id="contact" className="px-6 md:px-10 lg:px-[26px] py-16 md:py-24 mt-12">
    <hr className="border-border mb-12" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4">
        <p className="text-sm">© All Rights Reserved</p>
      </div>

      <div className="lg:col-start-5 lg:col-span-6 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Collaborations & Projects
          </p>
          <EmailLink />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Press
          </p>
          <EmailLink />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Careers
          </p>
          <EmailLink />
        </div>
      </div>

      <div className="lg:col-span-2 flex lg:justify-end items-start">
        <span
          className="inline-block border border-border px-3 py-1.5 text-[10px] tracking-widest uppercase text-muted-foreground"
          style={{ fontFamily: "'Courier New', monospace", imageRendering: "pixelated" }}
        >
          Made on a Mac
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
