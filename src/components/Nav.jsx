import { useEffect, useState, useRef } from "react";

export default function Nav() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current <= 40) {
        setVisible(true);
      } else if (current < lastScrollY.current) {
        setVisible(true);  // scrolling up
      } else {
        setVisible(false); // scrolling down
      }
      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "projects", href: "#projects" },
    { label: "under the hood", href: "#hood" },
    { label: "architect", href: "#architect" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "transparent",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="max-w-7xl mx-auto flex items-center justify-between"
        style={{ padding: "2rem 3rem" }}
      >
        <a
          href="#"
          className="mono text-sm tracking-widest transition-colors duration-200"
          style={{ color: "#4a4a4a" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a96e")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4a4a")}
        >
          <span style={{ color: "#2a2a2a" }}>#</span> zeroresidual.dev
        </a>

        <div className="flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="mono text-sm tracking-wider transition-colors duration-200"
              style={{ color: "#4a4a4a" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e8e6e1")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4a4a")}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/cv.pdf"
            className="mono text-sm tracking-wider transition-colors duration-200"
            style={{ color: "#4a4a4a" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a96e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4a4a")}
          >
            cv.pdf ↗
          </a>
        </div>
      </div>
    </nav>
  );
}