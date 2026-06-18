import { useState } from "react";

const entries = [
  {
    id: "defect-correction",
    category: "implicit solver",
    title: "Why Defect Correction Works: The M vs R Asymmetry",
    summary: "The implicit solver uses a first-order Jacobian on the LHS and a full second-order residual on the RHS. This isn't a shortcut — it's a deliberate separation of roles.",
    body: `The key insight is that M and R play fundamentally different roles.

M — the left-hand-side operator — is purely a numerical device. Its only job is to map a residual to a state increment in a way that is cheap, sparse, and unconditionally stable. Everything that makes M convenient — the first-order upwind Jacobian, Strang's two-point TSL diffusion conductance, the resulting ≤4 nonzeros per row — is in service of one property: a matrix-free SGS sweep that converges for any Δt. None of this needs to be physically accurate.

Why? Because M never appears in the converged solution. At convergence, Δφ → 0, and M drops out entirely. The only condition that survives is R(φ) = 0.

R — the right-hand-side residual — is the physics. Its accuracy directly determines the accuracy of the converged φ. This is why the second-order covolume residual from the validated explicit solver is carried over unchanged. Any simplification there would degrade the actual answer, not just the path taken to reach it.

The empirical proof: both explicit and implicit solvers converge to L₂ = 7.8448×10⁻⁴ and L∞ = 7.3939×10⁻³ at Pe=100, to four significant figures. Different paths, identical physics.`,
  },
  {
    id: "pe-sweep",
    category: "numerical methods",
    title: "The Pe Sweep Diagnostic: Isolating Superimposed Error Sources",
    summary: "A single Pe=100 run attributed L∞ error to the outlet boundary layer. A Pe sweep revealed the real cause — a Pe-invariant inlet corner effect that a single run cannot distinguish.",
    body: `After the second-order upgrade, L∞ ≈ 7.4×10⁻³ at Pe=100. The natural conclusion was that this came from the outlet boundary layer — steeper gradients near x=1, no slope limiter.

Then the Pe sweep: the same mesh, same code, only flow_solver.inp changed. Pe=1, 50, 100.

The surprising result: L∞ is essentially constant across two orders of magnitude in Pe — 6.9×10⁻³ to 7.4×10⁻³ — while L₂ varies substantially. At Pe=1 the solution is smooth and symmetric, with no outlet boundary layer at all. Yet L∞ barely moved.

The real cause: the error concentrates at (0,0) and (0,1) — where the inlet BC φ=sin(πy) meets the wall BC φ=0. The values agree (sin(πy)|y=0,1=0), but the slopes do not: d/dy sin(πy)|y=0,1 = ±π. Unlimited linear reconstruction extrapolates through this gradient discontinuity — producing a fixed-magnitude error that is a property of the boundary condition, not the flow.

The lesson: a parameter sweep is a diagnostic tool for separating superimposed error sources. A single run at Pe=100 cannot distinguish a Pe-dependent outlet effect from a Pe-invariant corner effect. The sweep does it in three runs.

The fix: a slope limiter (Barth-Jespersen or Venkatakrishnan) is needed not for shock-capturing, but to control reconstruction near corners where two different boundary conditions meet with a slope discontinuity. A clean, falsifiable prediction: adding the limiter should reduce L∞ without significantly changing L₂, equally at all Pe values.`,
  },
  {
    id: "not-a-pinn",
    category: "scientific ML",
    title: "Why This Is Not a PINN — And Why That Matters",
    summary: "The ML surrogate is data-driven, not physics-informed in the PINN sense. The distinction is not semantic.",
    body: `Physics-Informed Neural Networks embed the PDE residual directly in the loss function. For smooth, low-Pe problems this works reasonably well. For convection-dominated flows (high Pe), PINNs struggle: the residual loss becomes ill-conditioned near boundary layers, convergence is slow or fails entirely, and there is no guarantee of conservation.

The surrogate here is different. Physics enters through the training data, not the loss. Every training sample is a converged FVM solution validated against an analytical exact solution — the network learns the correct physics implicitly, because its training data is the correct physics.

This is sometimes called Physics-Informed Machine Learning (PIML) or Scientific Machine Learning (SciML) — distinguished from PINN-style approaches by where the physics enters.

More precisely: the network learns an operator. It maps (u, α) → φ(·,·; u,α) — not just a function from inputs to outputs, but a mapping from parameter space to function space. This is operator learning. The MLP approximates it pointwise by taking (x, y, u, α, Pe) as simultaneous inputs.

The data quality is characterised: L₂ ~ 7–9×10⁻⁴, L∞ ~ 7.2×10⁻³, with the corner error source identified and located. The surrogate inherits this characterisation. When the solver is improved (slope limiter), the training data improves, and the surrogate improves with it.

This distinguishes the pipeline from most ML-for-CFD work, where the solver is treated as a black box and data quality is neither measured nor reported.`,
  },
];

export default function UnderTheHood() {
  const [open, setOpen] = useState(null);

  return (
    <section
      id="hood"
      className="py-24"
      style={{
        borderTop: "1px solid #1a1a1a",
        paddingLeft: "10%",
        paddingRight: "5%",
      }}
    >
      <div className="mb-16">
        <span className="mono text-xs tracking-widest" style={{ color: "#3a3a3a" }}>
          UNDER THE HOOD
        </span>
        <p className="text-sm font-light mt-3 max-w-lg" style={{ color: "#3a3a3a", lineHeight: 1.8 }}>
          Technical teardowns — the why behind the engineering decisions.
        </p>
      </div>

      <div>
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{ borderTop: "1px solid #1a1a1a" }}
          >
            <button
              className="w-full text-left py-7 flex items-start justify-between gap-6 group"
              onClick={() => setOpen(open === entry.id ? null : entry.id)}
            >
              <div className="flex-1">
                {/* Category tag */}
                <div className="mono text-xs mb-3" style={{ color: "#3a3a3a", letterSpacing: "0.08em" }}>
                  {entry.category}
                </div>

                {/* Title — white, glows gold on hover */}
                <h3
                  className="text-base font-light mb-2 transition-colors duration-300"
                  style={{ color: open === entry.id ? "#c8a96e" : "#e8e6e1" }}
                >
                  {entry.title}
                </h3>

                <p
                  className="text-sm font-light"
                  style={{ color: "#5a5a5a", lineHeight: 1.8, maxWidth: "680px" }}
                >
                  {entry.summary}
                </p>
              </div>

              {/* Toggle arrow */}
              <span
                className="mono text-sm flex-shrink-0 mt-1 transition-all duration-300"
                style={{
                  color: open === entry.id ? "#c8a96e" : "#3a3a3a",
                  transform: open === entry.id ? "rotate(90deg)" : "rotate(0deg)",
                  display: "inline-block",
                }}
              >
                →
              </span>
            </button>

            {open === entry.id && (
              <div
                className="pb-8"
                style={{
                  borderLeft: "1px solid #1a1a1a",
                  marginLeft: "0",
                  paddingLeft: "1.5rem",
                }}
              >
                <div
                  className="text-sm font-light whitespace-pre-line"
                  style={{ color: "#9a9a9a", lineHeight: 2.0, maxWidth: "680px" }}
                >
                  {entry.body}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}