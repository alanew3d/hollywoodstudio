import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  plans: {
    basico: { name: "Básico", price: 99, credits: 150, active: true, stripeLink: "", mercadoPagoLink: "", paypalLink: "", whatsappLink: "", features: ["Studio básico", "Galeria privada", "150 créditos"] },
    premium: { name: "Premium", price: 199, credits: 300, active: true, stripeLink: "", mercadoPagoLink: "", paypalLink: "", whatsappLink: "", features: ["Studio completo", "Upload de referências", "Final Cut AI básico", "300 créditos"] },
    avancado: { name: "Avançado", price: 349, credits: 600, active: true, stripeLink: "", mercadoPagoLink: "", paypalLink: "", whatsappLink: "", features: ["Modelos premium", "Final Cut AI", "Acesso beta ao editor", "600 créditos"] },
  },
  features: {
    studio: true, gallery: true, directorAgent: true, finalCut: true, modelsCatalog: true,
    imglyEditor: false, academy: false, opportunities: false, marketplace: false, council: false,
  },
  branding: {
    siteName: "Hollywood Studio AI", tagline: "From idea to final cut", defaultLang: "pt", defaultTheme: "dark",
    whatsapp: "", supportEmail: "", heroVideo: "/assets/cinematic-demo.mp4", logoMode: "real",
  },
  payments: {
    stripe: { enabled: false, configured: false },
    mercadoPago: { enabled: false, configured: false },
    paypal: { enabled: true, email: "alansorrah@gmail.com" },
    whatsapp: { enabled: true, label: "Contratação assistida" },
  },
  models: {
    seedance2pro: { name: "Seedance 2.0 Pro", provider: "BytePlus", category: "video", active: true, premium: false, minPlan: "basico", cost: 1.0, maxDuration: 15, badge: "live" },
    seedance2lite: { name: "Seedance 2.0 Lite", provider: "BytePlus", category: "video", active: true, premium: false, minPlan: "basico", cost: 0.7, maxDuration: 15, badge: "fast" },
    seedancei2v: { name: "Seedance I2V", provider: "BytePlus", category: "video", active: true, premium: true, minPlan: "premium", cost: 1.1, maxDuration: 15, badge: "image-to-video" },
    kling3: { name: "Kling 3.0", provider: "Atlas Cloud", category: "video", active: true, premium: true, minPlan: "premium", cost: 1.2, maxDuration: 10, badge: "motion" },
    veo31lite: { name: "Veo 3.1 Lite", provider: "Atlas Cloud", category: "video", active: true, premium: true, minPlan: "premium", cost: 1.5, maxDuration: 8, badge: "google" },
    veo31quality: { name: "Veo 3.1 Quality", provider: "Atlas Cloud", category: "video", active: true, premium: true, minPlan: "avancado", cost: 2.2, maxDuration: 8, badge: "quality" },
    fluxpro: { name: "Flux Pro", provider: "Black Forest / Atlas", category: "image", active: true, premium: false, minPlan: "basico", cost: 8, maxDuration: 0, badge: "image" },
    seedream5: { name: "Seedream 5", provider: "BytePlus", category: "image", active: true, premium: false, minPlan: "basico", cost: 6, maxDuration: 0, badge: "image" },
    imagen4: { name: "Imagen 4", provider: "Google / Atlas", category: "image", active: true, premium: true, minPlan: "premium", cost: 9, maxDuration: 0, badge: "image" },
    nanobanana2: { name: "Nano Banana 2", provider: "Atlas Cloud", category: "image", active: true, premium: false, minPlan: "basico", cost: 5, maxDuration: 0, badge: "characters" },
    elevenlabs: { name: "ElevenLabs", provider: "ElevenLabs", category: "audio", active: true, premium: true, minPlan: "premium", cost: 12, maxDuration: 0, badge: "voice" },
  },
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "admin" ? session.user : null;
}

async function getSetting(key) {
  try {
    const row = await prisma.adminSetting.findUnique({ where: { key } });
    return row?.value ?? DEFAULTS[key];
  } catch (e) {
    return DEFAULTS[key];
  }
}

export async function GET() {
  if (!(await requireAdmin())) return new NextResponse("Forbidden", { status: 403 });
  const keys = Object.keys(DEFAULTS);
  const data = {};
  for (const key of keys) data[key] = await getSetting(key);
  data.envChecklist = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_LINK_BASICO: !!process.env.NEXT_PUBLIC_STRIPE_LINK_BASICO,
    NEXT_PUBLIC_STRIPE_LINK_PREMIUM: !!process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM,
    NEXT_PUBLIC_STRIPE_LINK_AVANCADO: !!process.env.NEXT_PUBLIC_STRIPE_LINK_AVANCADO,
    MERCADOPAGO_ACCESS_TOKEN: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    BYTEPLUS_API_KEY: !!process.env.BYTEPLUS_API_KEY,
    ATLASCLOUD_API_KEY: !!process.env.ATLASCLOUD_API_KEY,
  };
  return NextResponse.json(data);
}

export async function PUT(req) {
  if (!(await requireAdmin())) return new NextResponse("Forbidden", { status: 403 });
  const body = await req.json();
  const allowed = Object.keys(DEFAULTS);
  const saved = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      try {
        const row = await prisma.adminSetting.upsert({
          where: { key },
          create: { key, value: body[key] },
          update: { value: body[key] },
        });
        saved[key] = row.value;
      } catch (e) {
        return NextResponse.json({ error: "AdminSetting table missing. Run npx prisma db push after deploying this version.", detail: e.message }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ ok: true, saved });
}
