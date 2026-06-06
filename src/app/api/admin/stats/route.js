import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "admin") return null;
  return session.user;
}

export async function GET(req) {
  const admin = await requireAdmin(req);
  if (!admin) return new NextResponse("Forbidden", { status: 403 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalCreations,
    videoCreations,
    imageCreations,
    totalRevenue,
    activeSubscriptions,
    recentActivity,
    revenueByDay,
    usersByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.creation.count({ where: { status: "completed" } }),
    prisma.creation.count({ where: { status: "completed", mode: { in: ["text-to-video", "image-to-video", "reference-to-video"] } } }),
    prisma.creation.count({ where: { status: "completed", mode: "image" } }),

    // Total revenue from paid payments
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    }),

    // Active subscriptions (users with active plan)
    prisma.user.count({
      where: {
        plan: { not: "free" },
        planExpiresAt: { gte: now },
      },
    }),

    // Recent activity (last 20 events)
    prisma.payment.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),

    // Revenue per day (last 90 days) for chart
    prisma.payment.groupBy({
      by: ["createdAt"],
      where: { status: "paid", createdAt: { gte: ninetyDaysAgo } },
      _sum: { amount: true },
      orderBy: { createdAt: "asc" },
    }),

    // New users per day (last 90 days)
    prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: ninetyDaysAgo } },
      _count: true,
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build cumulative users chart data
  const usersChartData = buildDailyChart(usersByDay, ninetyDaysAgo, now, "count");
  const revenueChartData = buildDailyChart(revenueByDay, ninetyDaysAgo, now, "sum");

  return NextResponse.json({
    kpis: {
      totalUsers,
      totalCreations,
      videoCreations,
      imageCreations,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
    },
    recentActivity: recentActivity.map(p => ({
      id: p.id,
      user: { name: p.user?.name || "—", email: p.user?.email || "—" },
      action: p.status === "paid" ? `Assinou plano ${p.plan}` : `Pagamento ${p.status}`,
      amount: p.amount,
      provider: p.provider,
      createdAt: p.createdAt,
    })),
    charts: {
      users: usersChartData,
      revenue: revenueChartData,
    },
  });
}

function buildDailyChart(data, from, to, type) {
  const days = [];
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d <= to) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days.map(day => {
    const key = day.toISOString().slice(0, 10);
    const match = data.find(r => r.createdAt?.toISOString?.().slice(0, 10) === key);
    return {
      date: key,
      value: type === "count" ? (match?._count || 0) : (match?._sum?.amount || 0),
    };
  });
}
