import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// Run full simulation, store every Nth frame
function runBioHeatSimulation() {
  const N = 25;
  const L = 0.006;
  const dx = L / (N - 1);
  const k = 0.37;
  const rho = 1100;
  const cp = 3500;
  const dt = 0.2;
  const Fo = k * dt / (rho * cp * dx * dx);
  const h_core = 100;
  const h_water = 500;
  const T_inf = 25;
  const Q_met = 700;
  const m_body = 88;
  const cp_body = 3500;
  const A_total = 2.0;
  const A_patch = 5e-4;
  const fraction = A_patch / A_total;
  const Q_met_patch = Q_met * fraction;
  const m_patch = m_body * fraction;
  const t_final = 3600;

  let T = new Array(N).fill(36.0);
  let T_core = 36.0;
  let time = 0;
  let stepCount = 0;

  const frames = [];
  const RECORD_EVERY = 150; // record every 30 seconds of sim time (150 * 0.2s)

  // Record initial frame
  frames.push({ time: 0, T: [...T], T_core });

  while (time < t_final) {
    const T_old = [...T];
    const T_core_old = T_core;
    let T_core_guess = T_core_old;
    let T_new = [...T];

    for (let iter = 0; iter < 50; iter++) {
      const a = new Array(N).fill(0);
      const c_diag = new Array(N).fill(0);
      const cc = new Array(N).fill(0);
      const b = new Array(N).fill(0);

      const Bi_core = h_core * dx / k;
      c_diag[0] = 1 + Fo + Fo * Bi_core;
      cc[0] = -Fo;
      b[0] = (1 - Fo - Fo * Bi_core) * T_old[0]
            + Fo * T_old[1]
            + 2 * Fo * Bi_core * T_core_guess;

      for (let i = 1; i < N - 1; i++) {
        a[i] = -Fo / 2;
        c_diag[i] = 1 + Fo;
        cc[i] = -Fo / 2;
        b[i] = (Fo / 2) * T_old[i - 1]
              + (1 - Fo) * T_old[i]
              + (Fo / 2) * T_old[i + 1];
      }

      const Bi_w = h_water * dx / k;
      a[N - 1] = -Fo;
      c_diag[N - 1] = 1 + Fo + Fo * Bi_w;
      b[N - 1] = Fo * T_old[N - 2]
                + (1 - Fo - Fo * Bi_w) * T_old[N - 1]
                + 2 * Fo * Bi_w * T_inf;

      // Thomas algorithm
      const c2 = [...cc];
      const b2 = [...b];
      for (let i = 1; i < N; i++) {
        const m2 = a[i] / c_diag[i - 1];
        c_diag[i] -= m2 * c2[i - 1];
        b2[i] -= m2 * b2[i - 1];
      }
      T_new = new Array(N).fill(0);
      T_new[N - 1] = b2[N - 1] / c_diag[N - 1];
      for (let i = N - 2; i >= 0; i--) {
        T_new[i] = (b2[i] - c2[i] * T_new[i + 1]) / c_diag[i];
      }

      const q_loss = h_water * A_patch * (T_new[N - 1] - T_inf);
      const T_core_new = T_core_old + dt * (Q_met_patch - q_loss) / (m_patch * cp_body);

      if (Math.abs(T_core_new - T_core_guess) < 1e-5) {
        T_core = T_core_new;
        break;
      }
      T_core_guess = T_core_new;
      T_core = T_core_new;
    }

    T = T_new;
    time += dt;
    stepCount++;

    if (stepCount % RECORD_EVERY === 0) {
      frames.push({ time: +time.toFixed(1), T: [...T], T_core: +T_core.toFixed(3) });
    }

    if (T[0] <= 30.0) {
      frames.push({ time: +time.toFixed(1), T: [...T], T_core: +T_core.toFixed(3), stopped: true });
      break;
    }
  }

  return frames;
}

const FRAMES = runBioHeatSimulation();
const DEPTHS = Array.from({ length: 25 }, (_, i) => +(i * 6 / 24).toFixed(2));

function frameToChartData(frame) {
  return DEPTHS.map((depth, i) => ({ depth, temp: +frame.T[i].toFixed(2) }));
}

// Interpolate between two frames for smooth animation
function interpolateFrames(f1, f2, alpha) {
  return {
    time: f1.time + (f2.time - f1.time) * alpha,
    T: f1.T.map((v, i) => v + (f2.T[i] - v) * alpha),
    T_core: f1.T_core + (f2.T_core - f1.T_core) * alpha,
  };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="mono text-xs p-3" style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
      <div style={{ color: "#6b6b6b" }}>depth = {label} mm</div>
      <div style={{ color: "#c8a96e" }}>{payload[0]?.value}°C</div>
    </div>
  );
};

export default function BioHeatChart() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [alpha, setAlpha] = useState(0);
  const [playing, setPlaying] = useState(true);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const progressRef = useRef(0); // continuous progress 0..FRAMES.length-1

  useEffect(() => {
    if (!playing) return;

    const SPEED = 0.08; // frames per 16ms tick — controls pace

    const tick = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      progressRef.current += SPEED * (elapsed / 16);

      if (progressRef.current >= FRAMES.length - 1) {
        progressRef.current = FRAMES.length - 1;
        setFrameIdx(FRAMES.length - 1);
        setAlpha(0);
        setPlaying(false);
        return;
      }

      const fi = Math.floor(progressRef.current);
      const a = progressRef.current - fi;
      setFrameIdx(fi);
      setAlpha(a);

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const restart = () => {
    progressRef.current = 0;
    lastTimeRef.current = null;
    setFrameIdx(0);
    setAlpha(0);
    setPlaying(true);
  };

  // Get interpolated frame
  const currentFrame = frameIdx < FRAMES.length - 1
    ? interpolateFrames(FRAMES[frameIdx], FRAMES[frameIdx + 1], alpha)
    : FRAMES[FRAMES.length - 1];

  const chartData = frameToChartData(currentFrame);
  const timeMins = (currentFrame.time / 60).toFixed(1);
  const stopped = FRAMES[Math.min(frameIdx + 1, FRAMES.length - 1)]?.stopped;

  // Color: amber at start → teal as it cools
  const progress = frameIdx / (FRAMES.length - 1);
  const lineColor = `rgb(${Math.round(200 - progress * 150)}, ${Math.round(169 - progress * 20)}, ${Math.round(110 + progress * 90)})`;

  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "16px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-6 flex-wrap">
          <div>
            <span className="mono text-xs" style={{ color: "#6b6b6b" }}>time: </span>
            <span className="mono text-xs" style={{ color: "#c8a96e" }}>{timeMins} min</span>
          </div>
          <div>
            <span className="mono text-xs" style={{ color: "#6b6b6b" }}>T_core: </span>
            <span className="mono text-xs" style={{ color: "#4a7fa5" }}>{currentFrame.T_core.toFixed(2)}°C</span>
          </div>
          <div>
            <span className="mono text-xs" style={{ color: "#6b6b6b" }}>T_inner: </span>
            <span className="mono text-xs" style={{ color: lineColor }}>{currentFrame.T[0].toFixed(2)}°C</span>
          </div>
          <div>
            <span className="mono text-xs" style={{ color: "#6b6b6b" }}>T_outer: </span>
            <span className="mono text-xs" style={{ color: lineColor }}>{currentFrame.T[24].toFixed(2)}°C</span>
          </div>
        </div>
        <button
          onClick={playing ? () => setPlaying(false) : (frameIdx === FRAMES.length - 1 ? restart : () => setPlaying(true))}
          className="mono text-xs px-3 py-1 transition-colors duration-200"
          style={{ border: "1px solid #1a1a1a", color: "#6b6b6b" }}
          onMouseEnter={(e) => { e.target.style.color = "#c8a96e"; e.target.style.borderColor = "#c8a96e"; }}
          onMouseLeave={(e) => { e.target.style.color = "#6b6b6b"; e.target.style.borderColor = "#1a1a1a"; }}
        >
          {playing ? "pause" : frameIdx === FRAMES.length - 1 ? "replay" : "play"}
        </button>
      </div>

      {/* Stopping condition alert */}
      {!playing && frameIdx === FRAMES.length - 1 && FRAMES[FRAMES.length - 1]?.haltTemp && (
        <div className="mono text-xs mb-3 px-3 py-1" style={{ background: "#1a0a0a", border: "1px solid #2a1a1a", color: "#a06060" }}>
          simulation complete · t = {timeMins} min · T_inner = {currentFrame.T[0].toFixed(2)}°C
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 16, left: 8 }}>
          <XAxis
            dataKey="depth"
            tick={{ fontFamily: "JetBrains Mono", fontSize: 9, fill: "#5a5a5a" }}
            tickLine={false}
            axisLine={{ stroke: "#1a1a1a" }}
            label={{ value: "depth (mm)", position: "insideBottom", offset: -8, fontFamily: "JetBrains Mono", fontSize: 9, fill: "#5a5a5a" }}
          />
          <YAxis
            domain={[24, 37]}
            tick={{ fontFamily: "JetBrains Mono", fontSize: 9, fill: "#5a5a5a" }}
            tickLine={false}
            axisLine={{ stroke: "#1a1a1a" }}
            tickFormatter={(v) => `${v}°`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={30} stroke="#2a1a1a" strokeDasharray="3 3" label={{ value: "30°C stop", position: "right", fontFamily: "JetBrains Mono", fontSize: 8, fill: "#3a2a2a" }} />
          <ReferenceLine y={25} stroke="#1a1a1a" strokeDasharray="2 4" />
          <Line
            type="monotone"
            dataKey="temp"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Progress bar */}
      <div className="mt-3" style={{ background: "#111", height: "2px", borderRadius: "1px" }}>
        <div
          style={{
            height: "2px",
            width: `${(frameIdx / (FRAMES.length - 1)) * 100}%`,
            background: lineColor,
            borderRadius: "1px",
            transition: "width 0.05s linear",
          }}
        />
      </div>

      <div className="mono text-xs mt-2 text-center" style={{ color: "#2a2a2a" }}>
        CN implicit · h_water=500 W/m²K · T_water=25°C · skin depth 0→6mm · core→water
      </div>
    </div>
  );
}