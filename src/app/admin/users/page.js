"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const PLAN_COLORS = {
  free: "text-white/30 bg-white/5",
  basico: "text-blue-400 bg-blue-500/10",
  premium: "text-yellow-400 bg-yellow-500/10",
  avancado: "text-purple-400 bg-purple-500/10",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20, search, plan: planFilter });
    const r = await fetch(`/api/admin/users?${params}`);
    const d = await r.json();
    setUsers(d.users || []);
    setTotal(d.total || 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, planFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
        <p className="text-sm text-white/40">Manage all registered users — credits, plans and roles.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/25 w-64"
        />
        {["all","free","basico","premium","avancado"].map(p => (
          <button key={p} onClick={() => { setPlanFilter(p); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${planFilter === p ? "bg-yellow-500 text-black" : "bg-white/5 text-white/50 hover:text-white"}`}>
            {p === "all" ? "All Plans" : p}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/30 self-center">{total} users</span>
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["User","Plan","Credits","Role","Joined","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-white/20 text-xs">Loading…</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-white/80 text-xs">{u.name || "—"}</div>
                  <div className="text-[11px] text-white/35">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${PLAN_COLORS[u.plan] || "text-white/30 bg-white/5"}`}>
                    {u.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-yellow-400 font-medium text-xs">{u.credits}s</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] ${u.role === "admin" ? "text-red-400" : "text-white/30"}`}>
                    {u.role || "user"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] text-white/30">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`}
                    className="text-[11px] px-3 py-1 border border-white/15 rounded hover:border-white/30 text-white/60 hover:text-white transition-colors">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-white/20 text-xs">No users found</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-white/30">Showing {(page-1)*20+1}–{Math.min(page*20, total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1 text-xs border border-white/10 rounded disabled:opacity-30 hover:border-white/25">← Prev</button>
              <button onClick={() => setPage(p => p+1)} disabled={page*20>=total}
                className="px-3 py-1 text-xs border border-white/10 rounded disabled:opacity-30 hover:border-white/25">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
