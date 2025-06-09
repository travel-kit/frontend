"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Plane, Award, Settings, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MyPageClient() {
  const [userName, setUserName] = useState("김여행")
  const [currentDestination, setCurrentDestination] = useState("일본")

  // 방문한 국가 데이터
  const visitedCountries = [
    { id: 1, name: "대한민국", flag: "🇰🇷", date: "2022-12-15" },
    { id: 2, name: "일본", flag: "🇯🇵", date: "2022-08-20" },
    { id: 3, name: "태국", flag: "🇹🇭", date: "2022-04-05" },
    { id: 4, name: "프랑스", flag: "🇫🇷", date: "2021-10-10" },
    { id: 5, name: "미국", flag: "🇺🇸", date: "2021-07-22" },
    { id: 6, name: "영국", flag: "🇬🇧", date: "2020-12-18" },
  ]

  // 지난 여행 데이터
  const pastTrips = [
    {
      id: 1,
      destination: "도쿄, 일본",
      date: "2022-08-15 ~ 2022-08-22",
      image: "/placeholder.svg?height=150&width=300",
      description: "도쿄 타워, 시부야, 아사쿠사 등 도쿄의 주요 명소를 방문했습니다.",
    },
    {
      id: 2,
      destination: "방콕, 태국",
      date: "2022-04-01 ~ 2022-04-08",
      image: "/placeholder.svg?height=150&width=300",
      description: "왕궁, 왓포 사원, 짜뚜짝 시장 등 방콕의 문화와 음식을 즐겼습니다.",
    },
    {
      id: 3,
      destination: "파리, 프랑스",
      date: "2021-10-05 ~ 2021-10-15",
      image: "/placeholder.svg?height=150&width=300",
      description: "에펠탑, 루브르 박물관, 개선문 등 파리의 아름다운 명소들을 방문했습니다.",
    },
  ]

  // 국가 목록 (실제로는 더 많은 국가가 있을 것)
  const countries = [
    "대한민국",
    "일본",
    "중국",
    "태국",
    "베트남",
    "싱가포르",
    "말레이시아",
    "인도네시아",
    "필리핀",
    "미국",
    "캐나다",
    "멕시코",
    "영국",
    "프랑스",
    "독일",
    "이탈리아",
    "스페인",
    "포르투갈",
    "그리스",
    "호주",
    "뉴질랜드",
  ]

  return (
    <div className="container mx-auto px-4 pt-2 pb-6 min-h-screen">
      <Tabs defaultValue="badge" className="mt-4">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="badge" className="tabs-trigger">
            뱃지 보드
          </TabsTrigger>
          <TabsTrigger value="destination" className="tabs-trigger">
            여행 목적지
          </TabsTrigger>
          <TabsTrigger value="memories" className="tabs-trigger">
            지난 여행
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badge">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <Award className="h-5 w-5 mr-2 text-[#494949]" /> 나의 여행 뱃지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-gray-600">
                  지금까지 <span className="font-bold text-gray-800">{visitedCountries.length}개</span>의 국가를
                  방문했어요!
                </p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {visitedCountries.map((country) => (
                  <div key={country.id} className="flex flex-col items-center">
                    <div className="text-4xl mb-2">{country.flag}</div>
                    <p className="text-sm font-medium">{country.name}</p>
                    <p className="text-xs text-gray-500">{country.date.split("-")[0]}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-white p-4 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> 다음 목표 국가
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white">
                    스페인 🇪🇸
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    이탈리아 🇮🇹
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    호주 🇦🇺
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    + 추가하기
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destination">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <Plane className="h-5 w-5 mr-2 text-[#494949]" /> 이번 여행 목적지 설정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destination-country">국가</Label>
                    <Select defaultValue={currentDestination}>
                      <SelectTrigger>
                        <SelectValue placeholder="국가 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination-city">도시</Label>
                    <Input id="destination-city" placeholder="도시 입력" defaultValue="도쿄" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure-date">출발일</Label>
                    <div className="flex">
                      <Input id="departure-date" type="date" defaultValue="2023-05-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-date">귀국일</Label>
                    <div className="flex">
                      <Input id="return-date" type="date" defaultValue="2023-05-23" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trip-purpose">여행 목적</Label>
                  <Select defaultValue="tourism">
                    <SelectTrigger>
                      <SelectValue placeholder="여행 목적 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourism">관광</SelectItem>
                      <SelectItem value="business">비즈니스</SelectItem>
                      <SelectItem value="family">가족 방문</SelectItem>
                      <SelectItem value="study">학업</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trip-notes">메모</Label>
                  <textarea
                    id="trip-notes"
                    className="w-full min-h-[100px] p-3 border rounded-md"
                    placeholder="여행 관련 메모를 입력하세요"
                    defaultValue="도쿄 타워, 디즈니랜드, 아사쿠사 꼭 가보기"
                  ></textarea>
                </div>

                <Button className="w-full bg-gray-800 hover:bg-gray-900">여행 정보 저장</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memories">
          <div className="space-y-6">
            {pastTrips.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-0">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Image
                        src={trip.image || "/placeholder.svg"}
                        alt={trip.destination}
                        width={300}
                        height={150}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4 md:w-2/3">
                      <h3 className="font-medium text-lg">{trip.destination}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {trip.date}
                      </div>
                      <p className="text-gray-600 mb-4">{trip.description}</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Clock className="h-4 w-4 mr-1" /> 타임라인 보기
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" /> 관리
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
