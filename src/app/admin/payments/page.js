"use client";
import { useEffect, useState } from "react";

const STATUS_STYLE = {
  paid: "text-green-400 bg-green-500/10",
  pending: "text-yellow-400 bg-yellow-500/10",
  failed: "text-red-400 bg-red-500/10",
  refunded: "text-white/30 bg-white/5",
};

const PROVIDER_ICON = { stripe: "💳", mercadopago: "🏦", paypal: "🅿️" };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20, status: statusFilter, provider: providerFilter });
    const r = await fetch(`/api/admin/payments?${params}`);
    const d = await r.json();
    setPayments(d.payments || []);
    setTotal(d.total || 0);
    setTotals(d.totals || {});
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, statusFilter, providerFilter]);

  const saveEdit = async () => {
    setSaving(true);
    await fetch(`/api/admin/payments/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus, refundReason }),
    });
    setSaving(false);
    setEditing(null);
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Payment Management</h1>
        <p className="text-sm text-white/40">View and manage all payment transactions on the platform.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5">
          <div className="text-xs text-white/40 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-yellow-400">R$ {Number(totals.revenue || 0).toFixed(2)}</div>
        </div>
        <div className="bg-[#161616] border border-white/10 rounded-xl p-5">
          <div className="text-xs text-white/40 mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-white">{total}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {["all","paid","pending","failed","refunded"].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-yellow-500 text-black" : "bg-white/5 text-white/50 hover:text-white"}`}>
            {s}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {["all","stripe","mercadopago","paypal"].map(p => (
            <button key={p} onClick={() => { setProviderFilter(p); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${providerFilter === p ? "bg-white/15 text-white" : "bg-white/5 text-white/30 hover:text-white/60"}`}>
              {p === "all" ? "All Providers" : `${PROVIDER_ICON[p]} ${p}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["User","Amount","Status","Provider","Plan","Credits","Date","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-white/20 text-xs">Loading…</td></tr>
            ) : payments.map(p => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3">
                  <div className="text-xs font-medium text-white/80">{p.user?.name || "—"}</div>
                  <div className="text-[11px] text-white/35">{p.user?.email}</div>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-yellow-400">R${p.amount}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${STATUS_STYLE[p.status] || "text-white/30"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/50">{PROVIDER_ICON[p.provider]} {p.provider}</td>
                <td className="px-4 py-3 text-xs text-white/50 capitalize">{p.plan}</td>
                <td className="px-4 py-3 text-xs text-white/50">{p.credits}s</td>
                <td className="px-4 py-3 text-[11px] text-white/30">{new Date(p.createdAt).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setEditing(p); setEditStatus(p.status); setRefundReason(""); }}
                    className="text-[11px] px-3 py-1 border border-white/15 rounded hover:border-white/30 text-white/60 hover:text-white transition-colors">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!loading && payments.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-white/20 text-xs">No payments found</td></tr>
            )}
          </tbody>
        </table>
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-white/30">Showing {(page-1)*20+1}–{Math.min(page*20,total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1 text-xs border border-white/10 rounded disabled:opacity-30">← Prev</button>
              <button onClick={() => setPage(p => p+1)} disabled={page*20>=total}
                className="px-3 py-1 text-xs border border-white/10 rounded disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-white/15 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-sm font-semibold mb-4">Edit Payment — R${editing.amount}</h3>
            <p className="text-xs text-white/40 mb-4">{editing.user?.email} · {editing.provider} · {editing.plan}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/40 block mb-1.5">Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                  className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none">
                  {["paid","pending","failed","refunded"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {editStatus === "refunded" && (
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">Reason for refund</label>
                  <input value={refundReason} onChange={e => setRefundReason(e.target.value)}
                    className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
                    placeholder="e.g. Customer requested" />
                </div>
              )}
              {editStatus === "paid" && editing.status === "pending" && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-400">
                  ⚡ This will add {editing.credits}s credits to the user and activate their {editing.plan} plan.
                </div>
              )}
              {editStatus === "refunded" && editing.status === "paid" && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
                  ⚠ This will deduct {editing.credits}s credits from the user. Also issue refund manually on {editing.provider}.
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2 border border-white/15 rounded-lg text-xs text-white/60 hover:text-white">Cancel</button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2 bg-yellow-500 text-black rounded-lg text-xs font-semibold disabled:opacity-40">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
