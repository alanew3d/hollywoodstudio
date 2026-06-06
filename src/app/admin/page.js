"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const PLAN_LABELS = { free: "Free", basico: "Básico", premium: "Premium", avancado: "Avançado" };
const PROVIDER_BADGE = { stripe: "💳", mercadopago: "🏦", paypal: "🅿️" };

function KPI({ label, value, sub }) {
  return (
    <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
      <div className="text-sm text-white/50 mb-2">{label}</div>
      <div className="text-3xl font-semibold text-white">{value}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

function QuickAction({ href, icon, label }) {
  return (
    <Link href={href} className="bg-[#161616] border border-white/10 rounded-xl p-5 flex flex-col items-center gap-3 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all text-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-white/70">{label}</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white/30 text-sm py-20 text-center">Loading dashboard…</div>;

  const k = data?.kpis || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard Overview</h1>
        <p className="text-sm text-white/40">Monitor your platform's performance and activity.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <KPI label="Total Users" value={k.totalUsers ?? "—"} sub="Registered users" />
        <KPI label="Videos Generated" value={k.videoCreations ?? "—"} sub="Total videos" />
        <KPI label="Images Generated" value={k.imageCreations ?? "—"} sub="Total images" />
        <KPI label="Total Revenue" value={k.totalRevenue != null ? `R$ ${Number(k.totalRevenue).toFixed(2)}` : "—"} sub="Revenue from payments" />
        <KPI label="Active Subscriptions" value={k.activeSubscriptions ?? "—"} sub="Current active plans" />
        <KPI label="Total Creations" value={k.totalCreations ?? "—"} sub="Completed generations" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Recent Activity</h2>
          <p className="text-xs text-white/30 mb-5">Latest user actions across the platform</p>
          <div className="space-y-3">
            {(data?.recentActivity || []).slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white/80 truncate">{item.user.email}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {PROVIDER_BADGE[item.provider] || "💰"} {item.action}
                    {item.amount > 0 && <span className="text-yellow-400 ml-1">R${item.amount}</span>}
                  </div>
                </div>
                <div className="text-[10px] text-white/25 whitespace-nowrap">
                  {timeAgo(new Date(item.createdAt))}
                </div>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <div className="text-xs text-white/25 text-center py-6">No activity yet</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Quick Actions</h2>
          <p className="text-xs text-white/30 mb-5">Common administrative tasks</p>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction href="/admin/analytics" icon="📊" label="Analytics" />
            <QuickAction href="/admin/users" icon="👥" label="Manage Users" />
            <QuickAction href="/admin/payments" icon="💳" label="Manage Payments" />
            <QuickAction href="/admin/subscriptions" icon="🔄" label="Manage Subscriptions" />
            <QuickAction href="/admin/settings" icon="⚙️" label="Settings" />
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(date) {
  const diff = (Date.now() - date) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
