import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import UnderTheHood from "./components/UnderTheHood";
import Architect from "./components/Architect";
import Footer from "./components/Footer";

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-[#080808] text-[#e8e6e1] min-h-screen font-sans">
      <Nav scrolled={scrolled} />
      <Hero />
      <Projects />
      <UnderTheHood />
      <Architect />
      <Footer />
    </div>
  );
}
