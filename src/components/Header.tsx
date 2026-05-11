import LiveClock from "./LiveClock";

const Header = () => (
  <header
    className="fixed top-0 left-0 right-0 z-50 px-6 py-5 md:px-10 lg:px-[26px] lg:sticky"
    style={{ mixBlendMode: "difference", color: "#d4d4d1" }}
  >
    {/* Mobile layout: stacked rows */}
    <div className="lg:hidden">
      <div className="flex justify-between items-start">
        <a href="#" className="text-xl tracking-tight font-medium">
          /designbycc/
        </a>
      </div>
      <div className="flex justify-between items-start mt-6">
        <nav className="flex flex-col gap-1.5">
          {["Studio", "Manifesto", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity flex items-center gap-3"
            >
              {`${item} →`}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm tracking-wide opacity-70">
            Singapore
          </span>
          <LiveClock />
        </div>
      </div>
    </div>

    {/* Desktop layout: 12-column grid */}
    <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
      <div className="col-span-4">
        <a href="#" className="text-2xl tracking-tight font-medium">
          /designbycc/
        </a>
      </div>
      <nav className="col-start-5 col-span-2 flex flex-col gap-1.5">
        {["Studio", "Manifesto", "Contact"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity flex items-center gap-3"
          >
            {`${item} →`}
          </a>
        ))}
      </nav>
      <div className="col-start-9 col-span-4 flex items-start justify-end gap-8">
        <span className="text-sm tracking-wide opacity-70">
          Singapore
        </span>
        <LiveClock />
      </div>
    </div>
  </header>
);

export default Header;
