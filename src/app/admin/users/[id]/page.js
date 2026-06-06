"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const PLAN_LIMITS = {
  free: { video: 10, image: 20 },
  basico: { video: 150, image: 100 },
  premium: { video: 300, image: 200 },
  avancado: { video: 600, image: 400 },
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addCredits, setAddCredits] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [newRole, setNewRole] = useState("");
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const r = await fetch(`/api/admin/users/${id}`);
    if (!r.ok) { router.push("/admin/users"); return; }
    const d = await r.json();
    setData(d);
    setNewPlan(d.user.plan);
    setNewRole(d.user.role || "user");
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    setSaving(true); setMsg(null);
    const body = {};
    if (newPlan !== data.user.plan) body.plan = newPlan;
    if (newRole !== (data.user.role || "user")) body.role = newRole;
    if (addCredits && parseInt(addCredits) > 0) body.addCredits = parseInt(addCredits);
    if (Object.keys(body).length === 0) { setSaving(false); setMsg("Nothing to save"); return; }

    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      setMsg("✓ Saved successfully");
      setAddCredits("");
      load();
    } else setMsg("Error saving");
    setSaving(false);
  };

  if (!data) return <div className="text-white/25 text-sm py-20 text-center">Loading…</div>;

  const u = data.user;
  const limits = PLAN_LIMITS[u.plan] || PLAN_LIMITS.free;
  const videoUsage = data.monthUsage?.find(m => m.mode?.includes("video"))?.._count || 0;
  const imageUsage = data.monthUsage?.find(m => m.mode === "image")?.._count || 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" className="text-xs text-white/30 hover:text-white/60">← Users</Link>
        <span className="text-white/15">/</span>
        <span className="text-xs text-white/50">{u.name || u.email}</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-1">User Details</h1>
      <p className="text-sm text-white/40 mb-8">Comprehensive information for {u.email}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-4">User Information</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/5">
              {[
                ["Name", u.name || "—"],
                ["Email", u.email || "—"],
                ["User ID", <span className="font-mono text-[11px] text-white/40">{u.id}</span>],
                ["Current Plan", <PlanBadge plan={u.plan} />],
                ["Credits", <span className="text-yellow-400 font-medium">{u.credits}s</span>],
                ["Plan Expires", u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString("pt-BR") : "—"],
                ["Account Created", new Date(u.createdAt).toLocaleString("pt-BR")],
                ["Creations", u._count?.creations ?? 0],
                ["Payments", u._count?.payments ?? 0],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="py-2 text-xs text-white/40 w-36">{k}</td>
                  <td className="py-2 text-xs text-white/80">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Usage & Quota */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-1">Usage & Quota</h2>
          <p className="text-xs text-white/30 mb-5">Current usage this month on {u.plan} plan</p>
          <UsageBar label="Video Generation" used={videoUsage} max={limits.video} />
          <UsageBar label="Image Generation" used={imageUsage} max={limits.image} />
          <UsageBar label="Credits Used" used={Math.max(0, limits.video - u.credits)} max={limits.video} color="bg-yellow-500" />
        </div>

        {/* Admin Controls */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-5">Admin Controls</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Plan</label>
              <select value={newPlan} onChange={e => setNewPlan(e.target.value)}
                className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none">
                {["free","basico","premium","avancado"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Add Credits (seconds)</label>
              <input type="number" value={addCredits} onChange={e => setAddCredits(e.target.value)} min={0}
                placeholder="e.g. 150"
                className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none placeholder-white/20" />
            </div>
            {msg && <p className="text-xs text-yellow-400">{msg}</p>}
            <button onClick={save} disabled={saving}
              className="w-full py-2.5 bg-yellow-500 text-black rounded-lg text-sm font-semibold hover:bg-yellow-400 disabled:opacity-40 transition-colors">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-4">Payment History</h2>
          {u.payments?.length > 0 ? (
            <div className="space-y-2">
              {u.payments.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-xs font-medium text-white/70 capitalize">{p.plan} — {p.provider}</div>
                    <div className="text-[11px] text-white/30">{new Date(p.createdAt).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${p.status === "paid" ? "text-green-400" : p.status === "refunded" ? "text-red-400" : "text-yellow-400"}`}>
                      R${p.amount}
                    </div>
                    <div className="text-[10px] text-white/30 capitalize">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-white/25">No payments yet</p>}
        </div>
      </div>
    </div>
  );
}

function PlanBadge({ plan }) {
  const colors = { free: "text-white/30", basico: "text-blue-400", premium: "text-yellow-400", avancado: "text-purple-400" };
  return <span className={`font-semibold capitalize ${colors[plan] || "text-white"}`}>{plan}</span>;
}

function UsageBar({ label, used, max, color = "bg-blue-500" }) {
  const pct = max > 0 ? Math.min(100, Math.round(used / max * 100)) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/50">{label}</span>
        <span className="text-white/30">{used} / {max}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
