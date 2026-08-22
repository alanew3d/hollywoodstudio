"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { LoginModal } from "./LoginModal"

export function AuthModalTrigger() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setShowLoginModal(true)
      // Remove the login parameter from URL
      const newUrl = window.location.pathname
      router.replace(newUrl)
    }
  }, [searchParams, router])

  return (
    <LoginModal
      open={showLoginModal}
      onOpenChange={setShowLoginModal}
    />
  )
}