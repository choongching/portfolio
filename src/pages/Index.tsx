import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";

// Flip to true to restore the back-to-top arrow above the footer.
const SHOW_SCROLL_TO_TOP = false;

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Header />
    <main>
      <Hero />
      <Projects />
    </main>
    {SHOW_SCROLL_TO_TOP && <ScrollToTop />}
    <Footer />

  </div>
);

export default Index;
