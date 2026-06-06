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

// GET /api/admin/users — list all users
export async function GET(req) {
  if (!await requireAdmin()) return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const plan = searchParams.get("plan") || "";

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(plan && plan !== "all" && { plan }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, email: true, image: true,
        credits: true, plan: true, planExpiresAt: true, role: true,
        createdAt: true,
        _count: { select: { creations: true, payments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}
