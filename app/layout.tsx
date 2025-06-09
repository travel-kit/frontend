import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { inter, agbalumo } from "@/lib/fonts" 
import { Toaster } from "sonner"
import { UserProvider } from "@/contexts/UserContext"

export const metadata: Metadata = {
  title: "Travel Kit - 여행 준비 앱",
  description: "여행 준비를 위한 올인원 앱",
  keywords: ["여행", "여행준비", "체크리스트", "공항정보", "여행키트"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#E1F6FF] min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <UserProvider>
          {children}
          </UserProvider>
        </ThemeProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
