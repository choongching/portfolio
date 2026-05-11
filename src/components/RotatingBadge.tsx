const BADGE_TEXT = "☺ MORE USEFUL WEB ☺ MORE GRACEFUL WWW ";
const CHAR_COUNT = BADGE_TEXT.length;

const RotatingBadge = () => (
  <div className="fixed bottom-6 right-6 lg:right-auto lg:left-[25%] lg:bottom-[10%] z-50 w-28 h-28 md:w-32 md:h-32">
    {/* Spinning outer ring of text */}
    <svg
      className="w-full h-full animate-spin-slow"
      viewBox="0 0 200 200"
    >
      <defs>
        <path
          id="circlePath"
          d="M 100,100 m -75,0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
        />
      </defs>
      <text
        className="fill-foreground"
        style={{ fontSize: "13.5px", letterSpacing: "2.5px" }}
      >
        <textPath href="#circlePath">
          {BADGE_TEXT}
        </textPath>
      </text>
    </svg>

    {/* Center content */}
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <hr className="w-8 border-border mb-1" />
      <span className="text-lg leading-none">☺</span>
      <span
        className="text-[7px] tracking-widest uppercase text-foreground mt-0.5"
      >
        DOPI-SCORE A
      </span>
      <hr className="w-8 border-border mt-1" />
    </div>
  </div>
);

export default RotatingBadge;
