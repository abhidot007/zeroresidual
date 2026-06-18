import { useState, useEffect, useRef } from "react";
import ConvergenceChart from "./ConvergenceChart";
import GryoidViewer from "./GyroidViewer";
import BioHeatChart from "./BioHeatChart";

const FORTRAN_SNIPPET = `! Forward SGS sweep: i = 1 → nCells
do i = 1, nCells
  sum_off = 0.0d0

  do k = 1, 3
    f = cell_faces(k, i)
    if (face_bcflag(f) /= 0) cycle

    ci = face_incell(f)
    cj = face_outcell(f)

    if (ci == i) then
      j   = cj
      Mij = M_off_ci(f)
    else
      j   = ci
      Mij = M_off_cj(f)
    end if

    sum_off = sum_off + Mij * dphi(j)
  end do

  dphi(i) = (R_rhs(i) - sum_off) / M_diag(i)
end do`;

const PYTHON_SNIPPET = `for epoch in range(1, MAX_EPOCHS + 1):
    model.train()
    epoch_loss = 0.0
    for X_batch, Y_batch in train_loader:
        X_batch = X_batch.to(device)
        Y_batch = Y_batch.to(device)
        optimizer.zero_grad()
        pred = model(X_batch)
        loss = criterion(pred, Y_batch)
        loss.backward()
        optimizer.step()
        epoch_loss += loss.item() * len(X_batch)
    model.eval()
    with torch.no_grad():
        val_loss = criterion(
            model(X_va_d), Y_va_d
        ).item()
    scheduler.step(val_loss)`;

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: "#0a0a0a",
      border: "1px solid #2a2a2a",
      borderRadius: "2px",
    }}>
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: "1px solid #2a2a2a" }}
      >
        <span className="mono text-xs" style={{ color: "#5a5a5a" }}>
          {lang}
        </span>
        <button
          onClick={copy}
          className="mono text-xs transition-colors duration-200"
          style={{ color: copied ? "#c8a96e" : "#3a3a3a" }}
          onMouseEnter={(e) => { if (!copied) e.target.style.color = "#6b6b6b"; }}
          onMouseLeave={(e) => { if (!copied) e.target.style.color = "#3a3a3a"; }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre
        className="mono text-xs overflow-x-auto p-4"
        style={{ color: "#a8a8a8", lineHeight: 1.8 }}
      >
        {code}
      </pre>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span
      className="mono text-xs px-2 py-0.5"
      style={{
        background: "#111111",
        border: "1px solid #2a2a2a",
        color: "#5a5a5a",
        borderRadius: "2px",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

function Metric({ val, label }) {
  return (
    <div>
      <div
        className="mono text-2xl font-light"
        style={{
          color: "#c8a96e",
          filter: "drop-shadow(0 0 8px rgba(200,169,110,0.3))",
        }}
      >
        {val}
      </div>
      <div className="mono text-xs mt-1" style={{ color: "#5a5a5a" }}>
        {label}
      </div>
    </div>
  );
}

function ProjectCard({ number, title, tags, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        borderTop: "1px solid #1a1a1a",
        paddingTop: "3rem",
        paddingBottom: "3rem",
      }}
    >
      {/* Header row: number + title + tags on same line */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
        <div className="flex items-baseline gap-4">
          <span className="mono text-xs" style={{ color: "#3a3a3a" }}>
            {number}
          </span>
          <h3 className="text-xl font-light" style={{ color: "#e8e6e1" }}>
            {title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="py-24"
      style={{ paddingLeft: "10%", paddingRight: "5%" }}
    >
      {/* Section header */}
      <div className="mb-16">
        <span className="mono text-xs tracking-widest" style={{ color: "#3a3a3a" }}>
          COMPUTATIONAL RESEARCH & PROJECTS
        </span>
      </div>

      {/* Project 01 — FVM + ML Surrogate */}
      <ProjectCard
        number="01"
        title="AI-Accelerated FVM Solver"
        tags={["Fortran 90", "Python", "PyTorch", "SGS", "Defect Correction"]}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p
              className="text-sm font-light mb-5"
              style={{ color: "#b0b0b0", lineHeight: 2.0 }}
            >
              A 2D unstructured Finite Volume Method solver for scalar convection-diffusion,
              built from scratch in Fortran 90. The implicit solver uses a matrix-free
              Symmetric Gauss-Seidel scheme with Defect Correction — a first-order upwind
              Jacobian on the LHS paired with a full second-order covolume residual on the RHS.
              At convergence, the LHS drops out entirely. Only the physics remains.
            </p>
            <p
              className="text-sm font-light mb-8"
              style={{ color: "#b0b0b0", lineHeight: 2.0 }}
            >
              A 5-layer MLP (66,945 parameters, tanh activations) trained on 500 Latin
              Hypercube samples learns the operator (u, α) → φ(x,y). Its prediction
              warm-starts the solver, reducing iterations by up to 5.54× while converging
              to machine-precision-identical solutions.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <Metric val="5.54×" label="speedup at Pe=0 (pure diffusion)" />
              <Metric val="2.69×" label="speedup at Pe=15.9" />
              <Metric val="1.44×10⁻⁴" label="surrogate test L₂ error" />
              <Metric val="Pe 0→100" label="full validation range" />
            </div>

            <CodeBlock code={FORTRAN_SNIPPET} lang="implicit_solver.f90 · SGS forward sweep" />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="mono text-xs mb-3" style={{ color: "#5a5a5a" }}>
                CONVERGENCE HISTORY · cold vs warm start
              </div>
              <ConvergenceChart />
            </div>
            <div>
              <div className="mono text-xs mb-3" style={{ color: "#5a5a5a" }}>
                TRAINING LOOP · PyTorch
              </div>
              <CodeBlock code={PYTHON_SNIPPET} lang="train.py · epoch loop" />
            </div>
          </div>
        </div>
      </ProjectCard>

      {/* Project 02 — Gyroid */}
      <ProjectCard
        number="02"
        title="Data-Driven Anisotropic TPMS Cold Plate"
        tags={["Python", "OpenFOAM", "Marching Cubes", "DFAM", "SciPy"]}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-sm font-light mb-5" style={{ color: "#b0b0b0", lineHeight: 2.0 }}>
              A data-driven anisotropic design pipeline for functionally graded gyroid
              heat exchangers. CFD velocity and temperature fields drive spatially varying
              conductivity tensors, which grade the TPMS implicit surface parameters
              across a 729,000-voxel Eulerian grid. Surfaces extracted via Marching Cubes.
            </p>
            <p className="text-sm font-light mb-8" style={{ color: "#b0b0b0", lineHeight: 2.0 }}>
              A hybrid interpolation scheme — Delaunay triangulation for scattered-to-grid
              mapping, followed by trilinear upsampling — transfers 239,000 unstructured
              OpenFOAM fluid points to the regular voxel grid in O(1) query time.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <Metric val="10×" label="thermal resistance/mass improvement" />
              <Metric val="45.70→4.56" label="K·g/W reduction" />
              <Metric val="400k+" label="face mesh extracted" />
              <Metric val="729k" label="voxel Eulerian grid" />
            </div>
          </div>

          <div>
            <div className="mono text-xs mb-3" style={{ color: "#5a5a5a" }}>
              INTERACTIVE 3D VIEWER · gyroid TPMS mesh
            </div>
            <GryoidViewer />
          </div>
        </div>
      </ProjectCard>

      {/* Project 03 — Bio-Heat */}
      <ProjectCard
        number="03"
        title="Transient Bio-Heat Transfer Simulation"
        tags={["MATLAB", "Crank-Nicolson", "FDM", "Coupled PDE-ODE"]}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-sm font-light mb-5" style={{ color: "#b0b0b0", lineHeight: 2.0 }}>
              A 1D transient bio-heat model coupling a PDE for skin conduction with an
              ODE for core thermal response. Solved with an unconditionally stable
              Crank-Nicolson finite difference scheme and iterative implicit coupling.
            </p>
            <p className="text-sm font-light mb-8" style={{ color: "#b0b0b0", lineHeight: 2.0 }}>
              A non-physical surface heating artefact was traced to an incorrect internal
              Robin flux boundary condition — correcting it to an exact surface convection
              term restored energy balance. Velocity-dependent forced convection
              (h ∝ v⁰·⁸) validates the physiological rationale for competitive swimming
              pool temperatures of 26–28°C.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <Metric val="2nd order" label="Crank-Nicolson accuracy" />
              <Metric val="26–28°C" label="validated pool temperature range" />
            </div>
          </div>

          <div>
            <div className="mono text-xs mb-3" style={{ color: "#5a5a5a" }}>
              THERMAL DIFFUSION · skin temperature profile
            </div>
            <BioHeatChart />
          </div>
        </div>
      </ProjectCard>

      {/* Project 04 — Euler Engine placeholder */}
      <ProjectCard
        number="04"
        title="2D Parallel Euler Engine"
        tags={["Fortran 90", "MPI", "CUDA", "in progress"]}
      >
        <div
          className="flex flex-col items-center justify-center text-center p-8"
          style={{ border: "1px dashed #2a2a2a", minHeight: "160px" }}
        >
          <div className="mono text-xs mb-3" style={{ color: "#3a3a3a" }}>
            STATUS: IN DEVELOPMENT
          </div>
          <p className="text-sm font-light max-w-lg" style={{ color: "#3a3a3a", lineHeight: 2.0 }}>
            Extending the unstructured FVM framework to the compressible Euler equations
            with MPI domain decomposition and GPU acceleration via CUDA.
            Target: production-scale parallel throughput on unstructured meshes.
          </p>
        </div>
      </ProjectCard>

      {/* Project 05 — Cooling device placeholder */}
      <ProjectCard
        number="05"
        title="Biomimetic Personal Cooling Device"
        tags={["TPMS", "SLA", "Capillary Transport", "Centrifugal Blower", "in progress"]}
      >
        <p className="text-sm font-light mb-6 max-w-2xl" style={{ color: "#b0b0b0", lineHeight: 2.0 }}>
          A low-power personal cooling device using capillary-driven passive water
          transport through a functionally graded gyroid wick. The governing condition:
          ΔP_capillary ≥ ΔP_viscous + ΔP_gravity. A centrifugal blower removes the
          saturated boundary layer and directs cooled air toward a single user.
          Designed for operation during power outages on a 10,000 mAh power bank.
        </p>
        <div
          className="flex items-center justify-center p-8"
          style={{ border: "1px dashed #2a2a2a", minHeight: "200px" }}
        >
          <span className="mono text-xs" style={{ color: "#2a2a2a" }}>
            prototype photos · coming soon
          </span>
        </div>
      </ProjectCard>
    </section>
  );
}