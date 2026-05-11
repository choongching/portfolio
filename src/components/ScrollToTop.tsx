const ScrollToTop = () => (
  <div className="px-6 md:px-10 lg:px-[26px] py-16">
    <div className="grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-start-5 lg:col-span-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-2xl cursor-pointer text-foreground hover:text-muted-foreground transition-colors"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      </div>
    </div>
  </div>
);

export default ScrollToTop;
