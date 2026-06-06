"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const PLAN_COLORS = {
  basico: "text-blue-400",
  premium: "text-yellow-400",
  avancado: "text-purple-400",
};

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20, status: statusFilter });
    const r = await fetch(`/api/admin/subscriptions?${params}`);
    const d = await r.json();
    setSubs(d.subscriptions || []);
    setTotal(d.total || 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Subscription Management</h1>
        <p className="text-sm text-white/40">View and manage all user subscriptions on the platform.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        {["all","active","expired"].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-yellow-500 text-black" : "bg-white/5 text-white/50 hover:text-white"}`}>
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/30 self-center">{total} subscriptions</span>
      </div>

      <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <span className="text-xs text-white/50">All Subscriptions</span>
          <span className="text-xs text-white/25 ml-2">Showing {Math.min(subs.length, total)} of {total}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["User","Plan","Status","Period (Start – End)","Credits","Last Payment","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-white/20 text-xs">Loading…</td></tr>
            ) : subs.map((s, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3">
                  <div className="text-xs font-medium text-white/80">{s.name || "—"}</div>
                  <div className="text-[11px] text-white/35">{s.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold capitalize ${PLAN_COLORS[s.plan] || "text-white/50"}`}>{s.plan}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${s.status === "active" ? "text-green-400 bg-green-500/10" : "text-white/30 bg-white/5"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] text-white/50">
                  {s.periodStart ? new Date(s.periodStart).toLocaleDateString("pt-BR") : "—"}
                  {" – "}
                  {s.periodEnd ? new Date(s.periodEnd).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-yellow-400">{s.credits}s</td>
                <td className="px-4 py-3 text-[11px] text-white/40">
                  {s.lastPayment ? `R$${s.lastPayment.amount} via ${s.lastPayment.provider}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${s.userId}`}
                    className="text-[11px] px-3 py-1 border border-white/15 rounded hover:border-white/30 text-white/60 hover:text-white transition-colors">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && subs.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-white/20 text-xs">No subscriptions found</td></tr>
            )}
          </tbody>
        </table>
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-white/30">{(page-1)*20+1}–{Math.min(page*20,total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1 text-xs border border-white/10 rounded disabled:opacity-30">← Prev</button>
              <button onClick={() => setPage(p => p+1)} disabled={page*20>=total}
                className="px-3 py-1 text-xs border border-white/10 rounded disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
