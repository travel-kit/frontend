"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Luggage, Plane, Users, User } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/home", icon: Home, label: "홈" },
    { href: "/travel-kit", icon: Luggage, label: "여행 키트" },
    { href: "/airport-kit", icon: Plane, label: "공항 키트" },
    { href: "/community", icon: Users, label: "커뮤니티" },
    { href: "/my-page", icon: User, label: "마이페이지" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive ? "text-[#4FB0E5]" : "text-gray-500"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
