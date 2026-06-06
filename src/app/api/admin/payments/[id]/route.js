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

// PATCH /api/admin/payments/[id] — change status, issue refund
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return new NextResponse("Forbidden", { status: 403 });
  const { id } = await params;
  const { status, refundReason } = await req.json();

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return new NextResponse("Not found", { status: 404 });

  // If marking as refunded, deduct credits from user
  if (status === "refunded" && payment.status === "paid") {
    const user = await prisma.user.findUnique({
      where: { id: payment.userId },
      select: { credits: true },
    });
    const newCredits = Math.max(0, (user?.credits || 0) - payment.credits);
    await prisma.user.update({
      where: { id: payment.userId },
      data: { credits: newCredits },
    });
  }

  // If manually confirming a pending payment
  if (status === "paid" && payment.status === "pending") {
    await prisma.user.update({
      where: { id: payment.userId },
      data: { credits: { increment: payment.credits } },
    });
    // Activate plan if not free
    if (payment.plan !== "free") {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await prisma.user.update({
        where: { id: payment.userId },
        data: { plan: payment.plan, planExpiresAt: expiresAt },
      });
    }
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status,
      ...(status === "refunded" && { metadata: { ...payment.metadata, refundReason, refundedAt: new Date() } }),
      ...(status === "paid" && { paidAt: new Date() }),
    },
  });

  return NextResponse.json(updated);
}
