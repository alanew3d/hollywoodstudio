import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LandingPage } from "@/components/landing-page"

export default async function Home() {
  return <LandingPage />
}
