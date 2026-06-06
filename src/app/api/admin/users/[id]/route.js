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

// GET /api/admin/users/[id]
export async function GET(req, { params }) {
  if (!await requireAdmin()) return new NextResponse("Forbidden", { status: 403 });
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
      creations: { orderBy: { createdAt: "desc" }, take: 10,
        select: { id: true, prompt: true, model: true, status: true, creditsUsed: true, createdAt: true, imageUrl: true } },
    },
  });

  if (!user) return new NextResponse("Not found", { status: 404 });

  // Usage stats this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthUsage = await prisma.creation.groupBy({
    by: ["mode"],
    where: { userId: id, createdAt: { gte: startOfMonth }, status: "completed" },
    _count: true,
    _sum: { creditsUsed: true },
  });

  return NextResponse.json({ user, monthUsage });
}

// PATCH /api/admin/users/[id] — edit credits, plan, role
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return new NextResponse("Forbidden", { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const allowed = ["credits", "plan", "planExpiresAt", "role", "name"];
  const data = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  // If adding credits manually, add to existing (don't replace)
  if (body.addCredits) {
    const user = await prisma.user.findUnique({ where: { id }, select: { credits: true } });
    data.credits = (user?.credits || 0) + parseInt(body.addCredits);
  }

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(updated);
}
