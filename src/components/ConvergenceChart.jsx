import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Faithful to actual blueprint data: Pe=0, cold=12226 iters, warm=2205 iters
// Simulating log residual decay curves
function generateCurve(totalIters, startResidual, endResidual = 1e-8) {
  const data = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const iter = Math.round(totalIters * t);
    // Log-linear decay with slight S-curve
    const logStart = Math.log10(startResidual);
    const logEnd = Math.log10(endResidual);
    const logVal = logStart + (logEnd - logStart) * Math.pow(t, 0.7);
    data.push({ iter, res: Math.pow(10, logVal) });
  }
  return data;
}

const coldData = generateCurve(12226, 0.8);
const warmData = generateCurve(2205, 8e-3); // warm starts much lower

// Merge into single dataset aligned by iteration index
const chartData = coldData.map((d, i) => ({
  idx: i,
  coldIter: d.iter,
  cold: d.res,
  warmIter: warmData[i]?.iter ?? null,
  warm: warmData[i]?.res ?? null,
}));

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="mono text-xs p-3"
      style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
    >
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value?.toExponential(2)}
        </div>
      ))}
    </div>
  );
};

export default function ConvergenceChart() {
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "16px" }}>
      {/* Annotations */}
      <div className="flex gap-6 mb-4">
        <div>
          <span className="mono text-xs" style={{ color: "#6b6b6b" }}>cold start: </span>
          <span className="mono text-xs" style={{ color: "#4a7fa5" }}>12,226 iterations</span>
        </div>
        <div>
          <span className="mono text-xs" style={{ color: "#6b6b6b" }}>warm start: </span>
          <span className="mono text-xs" style={{ color: "#c8a96e" }}>2,205 iterations (5.54×)</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis
            dataKey="coldIter"
            tick={{ fontFamily: "JetBrains Mono", fontSize: 9, fill: "#5a5a5a" }}
            tickLine={false}
            axisLine={{ stroke: "#1a1a1a" }}
            label={{ value: "iteration", position: "insideBottom", offset: -2, fontFamily: "JetBrains Mono", fontSize: 9, fill: "#5a5a5a" }}
          />
          <YAxis
            scale="log"
            domain={[1e-9, 1]}
            tick={{ fontFamily: "JetBrains Mono", fontSize: 9, fill: "#5a5a5a" }}
            tickLine={false}
            axisLine={{ stroke: "#1a1a1a" }}
            tickFormatter={(v) => v.toExponential(0)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="cold"
            stroke="#4a7fa5"
            strokeWidth={1.5}
            dot={false}
            name="cold start"
          />
          <Line
            type="monotone"
            dataKey="warm"
            stroke="#c8a96e"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
            name="warm start"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mono text-xs mt-2 text-center" style={{ color: "#2a2a2a" }}>
        Pe = 0 · pure diffusion · tolerance 10⁻⁸
      </div>
    </div>
  );
}