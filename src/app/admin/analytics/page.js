"use client";
import { useEffect, useState } from "react";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("90");

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-white/25 text-sm py-20 text-center">Loading analytics…</div>;

  const usersChart = data?.charts?.users || [];
  const revenueChart = data?.charts?.revenue || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-sm text-white/40">Trends and usage charts</p>
        </div>
        <select value={range} onChange={e => setRange(e.target.value)}
          className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Users chart */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-1">Users & Subscriptions</h2>
        <p className="text-xs text-white/30 mb-6">Showing total registered users over time</p>
        <AreaChart data={usersChart} color="#3b82f6" label="New Users" />
        <div className="mt-4 flex gap-6">
          <div>
            <div className="text-lg font-bold text-white">{data?.kpis?.totalUsers ?? 0} total users</div>
            <div className="text-xs text-white/30">{data?.kpis?.activeSubscriptions ?? 0} active subscriptions</div>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-[#161616] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-1">Revenue</h2>
        <p className="text-xs text-white/30 mb-6">Daily revenue from successful payments over the last 90 days</p>
        <AreaChart data={revenueChart} color="#f59e0b" label="Revenue (R$)" valuePrefix="R$" />
        <div className="mt-4">
          <div className="text-lg font-bold text-yellow-400">R$ {Number(data?.kpis?.totalRevenue || 0).toFixed(2)} total</div>
          <div className="text-xs text-white/30">All time revenue</div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: data?.kpis?.totalUsers ?? 0, color: "text-blue-400" },
          { label: "Videos Generated", value: data?.kpis?.videoCreations ?? 0, color: "text-purple-400" },
          { label: "Images Generated", value: data?.kpis?.imageCreations ?? 0, color: "text-green-400" },
          { label: "Active Subscriptions", value: data?.kpis?.activeSubscriptions ?? 0, color: "text-yellow-400" },
        ].map(k => (
          <div key={k.label} className="bg-[#161616] border border-white/10 rounded-xl p-5">
            <div className="text-xs text-white/40 mb-2">{k.label}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple SVG area chart
function AreaChart({ data, color, label, valuePrefix = "" }) {
  if (!data || data.length === 0) return <div className="h-32 flex items-center justify-center text-white/15 text-xs">No data</div>;

  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const W = 640, H = 120, PAD = 10;
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (d.value / max) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area = `${PAD},${H - PAD} ${polyline} ${W - PAD},${H - PAD}`;

  const totalVal = values.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="text-xs text-white/30 mb-2">{label}: {valuePrefix}{totalVal.toFixed(valuePrefix ? 2 : 0)}</div>
      <div className="w-full overflow-hidden rounded">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#grad-${color.replace("#","")})`} />
          <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* X axis labels */}
      <div className="flex justify-between text-[10px] text-white/20 mt-1">
        {[0, Math.floor(data.length/4), Math.floor(data.length/2), Math.floor(data.length*3/4), data.length-1].map(i => (
          <span key={i}>{data[i]?.date?.slice(5) || ""}</span>
        ))}
      </div>
    </div>
  );
}
