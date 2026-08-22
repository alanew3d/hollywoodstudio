import { createClient } from "@/lib/supabase/server"
import { StudioMain } from "@/components/studio/StudioMain"

export const metadata = { title: "Criar — Hollywood Studio AI" }

export default async function CriarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <StudioMain user={user} />
}
