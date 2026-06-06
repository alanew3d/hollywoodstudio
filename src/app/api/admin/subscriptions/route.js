import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "admin" ? session.user : null;
}

export async function GET(req) {
  if (!await requireAdmin()) return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";
  const now = new Date();

  // "subscriptions" = users with a paid plan (not "free")
  const where = {
    plan: { not: "free" },
    ...(status === "active" && { planExpiresAt: { gte: now } }),
    ...(status === "expired" && { planExpiresAt: { lt: now } }),
  };

  const [subs, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { planExpiresAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, email: true, plan: true,
        planExpiresAt: true, credits: true, createdAt: true,
        payments: {
          where: { status: "paid" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, amount: true, provider: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const formatted = subs.map(u => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    plan: u.plan,
    status: u.planExpiresAt && u.planExpiresAt > now ? "active" : "expired",
    periodStart: u.payments[0]?.createdAt || u.createdAt,
    periodEnd: u.planExpiresAt,
    credits: u.credits,
    lastPayment: u.payments[0] || null,
  }));

  return NextResponse.json({ subscriptions: formatted, total, page, pages: Math.ceil(total / limit) });
}
