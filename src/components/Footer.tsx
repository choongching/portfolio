const Footer = () => (
  <footer id="contact" className="px-6 md:px-10 lg:px-[26px] py-16 md:py-24 mt-12">
    <hr className="border-border mb-12" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div>
          <p className="text-sm">Based in Singapore</p>
          <p className="text-sm">Working globally</p>
        </div>
        <p className="text-sm text-muted-foreground">© All Rights Reserved</p>
      </div>

      <div className="lg:col-start-5 lg:col-span-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Contact
          </p>
          <a
            href="mailto:teo.choong.ching@gmail.com"
            className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            teo.choong.ching@gmail.com
          </a>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Follow
          </p>
          <ul className="space-y-1">
            <li>
              <a
                href="https://linkedin.com/in/choongching"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                LinkedIn ↗
              </a>
            </li>
            <li>
              <a
                href="https://medium.com/@choongchingteo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                Medium ↗
              </a>
            </li>
            <li>
              <a
                href="https://dribbble.com/choongching"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                Dribbble ↗
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Developed by
          </p>
          <p className="text-sm">
            Designed and built by me, with{" "}
            <a
              href="https://claude.com/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Claude Code ↗
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
