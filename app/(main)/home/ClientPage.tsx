"use client"

import { useState, useEffect } from "react"
import { Check, Clock, AlertTriangle, Map, MessageSquare, Plane } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/contexts/UserContext"
import { Checkbox } from "@/components/ui/checkbox"

export default function ClientPage() {
  const [progress, setProgress] = useState(0)
  const [daysLeft, setDaysLeft] = useState(15)
  const { userName } = useUser()
  const [destination, setDestination] = useState("일본")

  // 여행 준비 단계
  const [steps, setSteps] = useState([
    { id: 1, name: "짐싸기", icon: Check, completed: false },
    { id: 2, name: "주의사항 체크", icon: AlertTriangle, completed: false },
    { id: 3, name: "공항 정보 확인", icon: Plane, completed: false },
    { id: 4, name: "커뮤니티 확인", icon: MessageSquare, completed: false },
    { id: 5, name: "출국", icon: Map, completed: false },
  ])

  // 진행도 업데이트 함수
  const updateProgress = (updatedSteps: typeof steps) => {
    const totalSteps = updatedSteps.length
    const completedSteps = updatedSteps.reduce((count, step) => {
      // 짐싸기는 체크되어 있을 때 진행도에 포함
      if (step.id === 1) {
        return count + (step.completed ? 1 : 0)
      }
      // 나머지는 체크되어 있을 때 진행도에 포함
      return count + (step.completed ? 1 : 0)
    }, 0)
    const newProgress = Math.round((completedSteps / totalSteps) * 100)
    setProgress(newProgress)
  }

  // 초기 진행도 설정
  useEffect(() => {
    updateProgress(steps)
  }, [])

  // 체크박스 상태 변경 핸들러
  const handleStepToggle = (stepId: number) => {
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        return { ...step, completed: !step.completed }
      }
      return step
    })
    setSteps(updatedSteps)
    updateProgress(updatedSteps)
  }

  return (
    <div className="container mx-auto px-4 pt-2 pb-6 min-h-screen">
      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-bold text-gray-800">안녕하세요, {userName}님!</h1>
        <div className="flex items-center mt-2">
          <Clock className="h-5 w-5 text-[#494949] mr-2" />
          <span className="text-lg font-medium">
            {destination} 여행 <span className="text-gray-800 font-bold">D-{daysLeft}</span>
          </span>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-3">여행 준비 진행도</h2>
          <Progress value={progress} className="h-2 mb-4 bg-gray-200" />
          <p className="text-right text-sm text-gray-500">{progress}% 완료</p>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-3">여행 준비 단계</h2>
      <div className="space-y-3">
        {steps.map((step) => (
          <Card key={step.id} className={step.completed ? "border-gray-200 bg-white" : ""}>
            <CardContent className="p-4 flex items-center">
              <div className={`rounded-full p-2 mr-3 ${step.completed ? "bg-white" : "bg-gray-100"}`}>
                <step.icon className={`h-5 w-5 ${step.completed ? "text-[#494949]" : "text-gray-400"}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${step.completed ? "text-gray-800" : "text-gray-700"}`}>{step.name}</h3>
                <p className="text-sm text-gray-500">{step.completed ? "완료됨" : "진행 중"}</p>
              </div>
              <Checkbox
                checked={step.completed}
                onCheckedChange={() => handleStepToggle(step.id)}
                className="h-5 w-5"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-3">다가오는 일정</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2 mr-3">
                <Plane className="h-5 w-5 text-[#494949]" />
              </div>
              <div>
                <p className="font-medium">인천 → {destination}</p>
                <p className="text-sm text-gray-500">2023년 5월 16일 오전 10:30</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2 mr-3">
                <Plane className="h-5 w-5 text-[#494949] transform rotate-180" />
              </div>
              <div>
                <p className="font-medium">{destination} → 인천</p>
                <p className="text-sm text-gray-500">2023년 5월 23일 오후 3:45</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
