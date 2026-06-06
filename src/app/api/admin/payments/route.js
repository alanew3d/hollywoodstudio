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
  const provider = searchParams.get("provider") || "";

  const where = {
    ...(status && status !== "all" && { status }),
    ...(provider && provider !== "all" && { provider }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.payment.count({ where }),
  ]);

  const totals = await prisma.payment.aggregate({
    where: { status: "paid" },
    _sum: { amount: true, credits: true },
  });

  return NextResponse.json({
    payments,
    total,
    page,
    pages: Math.ceil(total / limit),
    totals: { revenue: totals._sum.amount || 0, credits: totals._sum.credits || 0 },
  });
}
