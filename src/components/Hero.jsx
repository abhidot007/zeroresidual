import { useEffect, useRef } from "react";

function FlowField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = "rgba(8,8,8,0.08)";
      ctx.fillRect(0, 0, W, H);

      const cols = 52;
      const rows = 30;
      const cw = W / cols;
      const ch = H / rows;

      const Pe = 60 + 55 * Math.sin(t * 0.008);
      const u = Pe;
      const alpha = 1.0;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i + 0.5) / cols;
          const y = (j + 0.5) / rows;

          const r1 = (u + Math.sqrt(u * u + 4 * alpha * Math.PI * Math.PI)) / (2 * alpha);
          const r2 = (u - Math.sqrt(u * u + 4 * alpha * Math.PI * Math.PI)) / (2 * alpha);
          const denom = Math.exp(r2) - Math.exp(r1);
          const phi = Math.abs(denom) > 1e-10
            ? Math.sin(Math.PI * y) * (Math.exp(r2 * x) - Math.exp(r1 * x)) / denom
            : Math.sin(Math.PI * y) * x;

          const v = Math.max(0, Math.min(1, phi));

          let r, g, b;
          if (v < 0.5) {
            const s = v * 2;
            r = Math.floor(20 + s * 30);
            g = Math.floor(40 + s * 120);
            b = Math.floor(80 + s * 120);
          } else {
            const s = (v - 0.5) * 2;
            r = Math.floor(50 + s * 200);
            g = Math.floor(160 + s * 60);
            b = Math.floor(200 - s * 150);
          }

          const alpha_cell = 0.7 + v * 0.3;
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha_cell})`;
          ctx.fillRect(i * cw, j * ch, cw - 0.5, ch - 0.5);
        }
      }

      // Scanlines
      ctx.fillStyle = "rgba(8,8,8,0.2)";
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      t++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        borderBottom: "1px solid #1a1a1a",
        justifyContent: "space-between",
      }}
    >
      <FlowField />

      {/* Vignette — lighter on left so flow field integrates */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 25% 50%, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.75) 70%), linear-gradient(to right, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.1) 45%, rgba(8,8,8,0.45) 100%)",
        }}
      />

      {/* Top spacer — pushes content down from nav */}
      <div style={{ height: "7rem" }} />

      {/* Main content block */}
      <div
        className="relative z-10 flex-1 flex flex-col justify-center"
        style={{ padding: "0 0 0 10%" }}
      >
        {/* Status label */}
        <div style={{ marginBottom: "2rem" }}>
          <span
            className="mono text-xs tracking-widest"
            style={{ color: "#3a3a3a" }}
          >
            IIT DHARWAD · B.TECH MECHANICAL · 2023–2027
          </span>
        </div>

        {/* Tagline — dominant element */}
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
            fontWeight: 500,
            color: "#e8e6e1",
            letterSpacing: "-0.025em",
            lineHeight: 1.25,
            marginBottom: "0.5rem",
            filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.9))",
            maxWidth: "600px",
          }}
        >
          Plan the code.
        </h1>
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
            fontWeight: 500,
            color: "#e8e6e1",
            letterSpacing: "-0.025em",
            lineHeight: 1.25,
            marginBottom: "2rem",
            filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.9))",
            maxWidth: "600px",
          }}
        >
          Code the plan.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "1rem",
            fontWeight: 300,
            color: "#8a8a8a",
            lineHeight: 1.85,
            maxWidth: "480px",
            marginBottom: "2.5rem",
            filter: "drop-shadow(0 1px 8px rgba(0,0,0,0.95))",
          }}
        >
          A digital workshop where problems meet their solutions
          through first principles, hardware, and code.
        </p>

        {/* Metrics — floating HUD */}
        <div
          style={{
            borderTop: "1px solid #1e1e1e",
            paddingTop: "1.5rem",
            marginBottom: "2.5rem",
            display: "flex",
            flexDirection: "row",
            gap: "3rem",
          }}
        >
          {[
            { val: "5.54×", label: "convergence speedup" },
            { val: "1.44×10⁻⁴", label: "surrogate L₂ error" },
            { val: "10×", label: "thermal R/mass" },
          ].map((m, i) => (
            <div key={i}>
              <div
                className="mono"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "#c8a96e",
                  filter: "drop-shadow(0 0 10px rgba(200,169,110,0.45))",
                }}
              >
                {m.val}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: "0.7rem",
                  color: "#3a3a3a",
                  marginTop: "0.25rem",
                  letterSpacing: "0.04em",
                }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row — signature + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "1.4rem",
              fontWeight: 300,
              color: "#3a3a3a",
              letterSpacing: "-0.02em",
            }}
          >
            Abhi<span style={{ color: "#c8a96e" }}>.</span>
          </span>

          <a
            href="#projects"
            className="mono"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              color: "#3a3a3a",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e8e6e1")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3a")}
          >
            see the work
            <span style={{
              color: "#c8a96e",
              display: "inline-block",
              animation: "bob 2s ease-in-out infinite",
            }}>↓</span>
          </a>
        </div>
      </div>

      {/* Bottom spacer */}
      <div style={{ height: "3rem" }} />

      {/* Pe indicator */}
      <div
        className="absolute mono"
        style={{
          bottom: "1.5rem",
          right: "2rem",
          fontSize: "0.65rem",
          color: "#3a3a3a",
          letterSpacing: "0.04em",
        }}
      >
        scalar convection-diffusion · Pe ∈ [0, 100]
      </div>

      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
    </section>
  );
}