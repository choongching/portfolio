import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";


const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Header />
    <main>
      <Hero />
      <Projects />
    </main>
    <ScrollToTop />
    <Footer />
    
  </div>
);

export default Index;
