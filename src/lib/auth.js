import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials provider para login direto admin (sem Google)
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        // Busca usuário pelo email
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        // Para ambiente dev/staging: admin bypass com ADMIN_SECRET
        if (credentials.password === process.env.ADMIN_SECRET && user.role === "admin") {
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.credits = user.credits;
        session.user.plan = user.plan;
        session.user.planExpiresAt = user.planExpiresAt;
        session.user.role = user.role; // "user" | "admin"
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
