"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoginModal } from "./LoginModal"
import { User, LogOut, Settings, FileText } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserMenuProps {
  user: SupabaseUser | null
}

export function UserMenu({ user }: UserMenuProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setShowLoginModal(true)}
        >
          Sign In
        </Button>
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
        />
      </>
    )
  }

  const userEmail = user.email || "User"
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split("@")[0]
  const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-border hover:border-primary/50 transition-colors"
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                // Fallback to initial if image fails to load
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.classList.remove('hidden');
                }
              }}
            />
          ) : null}
          <div className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white ${userAvatar ? 'hidden' : ''}`}>
            {userName ? (
              <span className="text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/generator")}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Generator</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={loading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}