"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Luggage, MapPin, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"

interface LoginFormProps {
  agbalumoClassName: string
}

export default function LoginForm({ agbalumoClassName }: LoginFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { setUserName } = useUser()

  const verifyToken = async (user: any) => {
    try {
      const token = await user.getIdToken()
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8080'
        : 'https://backend-production-51cd.up.railway.app'
      
      const response = await fetch(`${apiUrl}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('토큰 검증 오류:', error)
      throw error
    }
  }

  const handleGoogleLogin = async () => {
    try {
    setIsLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      console.log("Google login success:", result.user)
      
      // 토큰 검증
      await verifyToken(result.user)
      
      // 사용자 이름 저장
      const displayName = result.user.displayName || '사용자'
      setUserName(displayName)
      
      toast.success("로그인 성공!")
      router.push("/home")
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <h1 className={`${agbalumoClassName} text-2xl text-gray-800`}>Travel Kit</h1>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Image src="/images/airplane-logo.png" alt="Travel Kit Logo" width={120} height={120} priority />
          </div>
          <h1 className={`${agbalumoClassName} text-3xl font-bold text-gray-800`}>Travel Kit</h1>
          <p className="mt-2 text-gray-600">여행 준비의 모든 것, 한 곳에서</p>
        </div>

        <div className="mt-8 space-y-8">
          <Button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            disabled={isLoading}
          >
            <Image
              src="/images/google.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
            {isLoading ? "로그인 중..." : "Google로 계속하기"}
              </Button>

          <div className="mt-16 flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-2">
            <Luggage className="h-5 w-5 text-[#494949]" />
            <span className="text-sm text-gray-600">짐 체크리스트</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-[#494949]" />
            <span className="text-sm text-gray-600">여행지 정보</span>
          </div>
          <div className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-[#494949]" />
            <span className="text-sm text-gray-600">공항 정보</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
