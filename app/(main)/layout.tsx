// app/(main)/layout.tsx

"use client"

import type React from "react"
import Link from "next/link"
import { agbalumo } from "@/lib/fonts" // ✅ 수정된 import
import Navigation from "./navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { setUserName } = useUser()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUserName("")
      toast.success("로그아웃 되었습니다.")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("로그아웃에 실패했습니다.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#E1F6FF] p-4 shadow-sm flex justify-between items-center">
        <Link href="/home" className={`${agbalumo.className} text-2xl text-gray-800`}>
          Travel Kit
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </header>
      <main className="flex-1 pb-16">{children}</main>
      <Navigation />
    </div>
  )
}
