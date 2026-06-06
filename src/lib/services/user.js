import { prisma } from "@/lib/prisma";

export const UserService = {
  async getCredits(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, plan: true },
    });
    return user?.credits || 0;
  },

  async addCredits(userId, amount) {
    return await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });
  },

  async deductCredits(userId, amount = 1) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    if (!user || user.credits < amount) {
      throw new Error("Créditos insuficientes");
    }
    return await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
    });
  },

  async activatePlan(userId, planId, credits) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    return await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planId,
        planExpiresAt: expiresAt,
        credits: { increment: credits },
      },
    });
  },
};
