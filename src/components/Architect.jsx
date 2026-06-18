export default function Architect() {
  const interests = [
    {
      label: "Swiss & German Watchmaking",
      desc: "The dial of a Nomos or Lange is a lesson in constraint. Every component earns its place or it doesn't exist. The same discipline applies to numerical schemes.",
    },
    {
      label: "Retro Motorcycles",
      desc: "A 500cc single-cylinder engine from the 1970s has nothing to hide. Every component is visible, purposeful, and serviceable. Engineering without abstraction.",
    },
    {
      label: "Audiophile Acoustics",
      desc: "A well-designed transducer converts one form of energy to another with minimum loss. The same principle governs every flux computation I write.",
    },
  ];

  const terminal = [
    { key: "github", val: "abhidot007", href: "https://github.com/abhidot007" },
    { key: "email", val: "abhishekdot007@gmail.com", href: "mailto:abhishekdot007@gmail.com" },
    { key: "location", val: "bengaluru, india", href: null },
  ];

  return (
    <section
      id="architect"
      className="py-24"
      style={{
        borderTop: "1px solid #1a1a1a",
        paddingLeft: "10%",
        paddingRight: "5%",
      }}
    >
      <div className="mb-16">
        <span className="mono text-xs tracking-widest" style={{ color: "#3a3a3a" }}>
          THE ARCHITECT
        </span>
      </div>

      {/* Strict 2-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5rem",
          alignItems: "start",
        }}
      >
        {/* Left — Bio + Terminal */}
        <div>
          <p className="text-sm font-light mb-5" style={{ color: "#b0b0b0", lineHeight: 2.0 }}>
            I'm Abhishek Donela — a mechanical engineering student at IIT Dharwad
            (2023–2027) working at the intersection of numerical methods, scientific
            machine learning, and physical hardware.
          </p>
          <p className="text-sm font-light mb-5" style={{ color: "#b0b0b0", lineHeight: 2.0 }}>
            My approach is straightforward: understand the physics before writing a
            line of code. Derive the scheme on paper. Validate against an exact solution.
            Document the design decisions — including the ones that were wrong first.
          </p>
          <p className="text-sm font-light mb-12" style={{ color: "#b0b0b0", lineHeight: 2.0 }}>
            I'm currently a CFD Solver Developer Intern at Sandi Engineering Solutions,
            working under two of the three lead developers of HIFUN — a commercial
            parallel 3D CFD solver used in Indian aerospace research. The longer arc:
            classical CFD → scientific ML → digital twins.
          </p>

          {/* Terminal contact readout */}
          <div
            style={{
              borderTop: "1px solid #1a1a1a",
              paddingTop: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {terminal.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-4 mb-3"
              >
                <span className="mono text-xs" style={{ color: "#2a2a2a" }}>{">"}</span>
                <span
                  className="mono text-xs w-16"
                  style={{ color: "#3a3a3a", letterSpacing: "0.04em" }}
                >
                  {item.key}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mono text-xs transition-colors duration-200"
                    style={{ color: "#6b6b6b" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a96e")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {item.val}
                  </a>
                ) : (
                  <span className="mono text-xs" style={{ color: "#6b6b6b" }}>{item.val}</span>
                )}
              </div>
            ))}
          </div>

          {/* CV download */}
          <a
            href="/cv.pdf"
            className="mono text-xs tracking-wider transition-colors duration-200 flex items-center gap-2"
            style={{ color: "#3a3a3a" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a96e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3a")}
          >
            <span style={{ color: "#2a2a2a" }}>{">"}</span>
            download cv.pdf ↗
          </a>
        </div>

        {/* Right — Interests */}
        <div>
          <div
            className="mono text-xs mb-8 tracking-widest"
            style={{ color: "#3a3a3a" }}
          >
            OUTSIDE THE SOLVER LOOP
          </div>

          <div>
            {interests.map((item, i) => (
              <div
                key={i}
                className="py-6"
                style={{ borderTop: "1px solid #1a1a1a" }}
              >
                <div className="flex items-baseline gap-3 mb-2">
                  <span
                    className="mono text-xs"
                    style={{ color: "#2a2a2a" }}
                  >
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  <h4
                    className="text-sm font-light"
                    style={{ color: "#e8e6e1" }}
                  >
                    {item.label}
                  </h4>
                </div>
                <p
                  className="text-xs font-light"
                  style={{ color: "#5a5a5a", lineHeight: 1.9, paddingLeft: "2.5rem" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}