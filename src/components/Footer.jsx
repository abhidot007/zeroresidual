export default function Footer() {
  return (
    <footer
      className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between"
      style={{ borderTop: "1px solid #1a1a1a" }}
    >
      <span className="mono text-xs" style={{ color: "#2a2a2a" }}>
        zeroresidual.dev
      </span>
      <div className="flex items-center gap-6">
        {[
          { label: "github", href: "https://github.com/abhidot007" },
          { label: "email", href: "mailto:abhishekdot007@gmail.com" },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="mono text-xs transition-colors duration-200"
            style={{ color: "#2a2a2a" }}
            onMouseEnter={(e) => (e.target.style.color = "#6b6b6b")}
            onMouseLeave={(e) => (e.target.style.color = "#2a2a2a")}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
          >
            {l.label}
          </a>
        ))}
      </div>
      <span className="mono text-xs" style={{ color: "#1a1a1a" }}>
        R(φ) = 0
      </span>
    </footer>
  );
}
