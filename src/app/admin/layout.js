"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/settings", label: "Site Settings" },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.push("/login"); return; }
    // Role check happens server-side in each API, but we redirect non-admins here
    if (session.user.role !== "admin") router.push("/");
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white/40 text-sm">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Top nav */}
      <nav className="border-b border-white/10 bg-[#0d0d0d] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 h-12">
          <Link href="/" className="text-xs text-white/40 hover:text-white/70 mr-4 transition-colors">
            ← Go back to app
          </Link>
          <div className="flex items-center gap-1">
            {NAV.map(n => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href))
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
