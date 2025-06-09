"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { fetchPassengerForecast, getCongestionLevel, formatTimeRange } from "@/app/api/passengerForecast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plane, Car, Clock, Search, Calendar, Clock3 } from "lucide-react"
import { fetchParkingStatus } from "@/app/api/parkingStatus"
import type { ParkingItem } from "@/app/api/parkingStatus"
import { facilities, facilityCategories } from "@/data/facilities"

interface CongestionData {
  level: string;
  value: number;
}

interface AreaData {
  [key: string]: CongestionData;
}

interface CongestionDataMap {
  "입국장": AreaData;
  "출국장": AreaData;
}

// 컴포넌트 정의
export default function AirportKitClientPage() {
  const [selectedTerminal, setSelectedTerminal] = useState("제1터미널")
  const [selectedDate, setSelectedDate] = useState("오늘")
  const [selectedTime, setSelectedTime] = useState("")
  const [airlineSearch, setAirlineSearch] = useState("")
  const [parkingData, setParkingData] = useState<ParkingItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState("출국장")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [facilitySearch, setFacilitySearch] = useState("")
  const [passengerData, setPassengerData] = useState<any>(null)

  // 편의시설 필터링
  const getFilteredFacilities = () => {
    return facilities.filter((facility) => {
      const terminalMatch = facility.terminal === selectedTerminal
      const categoryMatch = selectedCategory === "전체" || facility.category === selectedCategory
      const searchMatch = facility.name.toLowerCase().includes(facilitySearch.toLowerCase())
      return terminalMatch && categoryMatch && searchMatch
    })
  }

  // 항공사 카운터 정보
  const airlineCounters = [
    // 제1 여객터미널
    { id: 1, name: "아시아나항공", code: "OZ", location: "3층 A, B, C 카운터", terminal: "제1터미널" },
    { id: 2, name: "제주항공", code: "7C", location: "3층 L 카운터", terminal: "제1터미널" },
    { id: 3, name: "진에어", code: "LJ", location: "3층 F 카운터", terminal: "제1터미널" },
    { id: 4, name: "티웨이항공", code: "TW", location: "3층 H 카운터", terminal: "제1터미널" },
    { id: 5, name: "이스타항공", code: "ZE", location: "3층 F 카운터", terminal: "제1터미널" },
    { id: 6, name: "에어서울", code: "RS", location: "3층 D 카운터", terminal: "제1터미널" },
    { id: 7, name: "중국남방항공", code: "CZ", location: "3층 J 카운터", terminal: "제1터미널" },
    { id: 8, name: "중국동방항공", code: "MU", location: "3층 H 카운터", terminal: "제1터미널" },
    { id: 9, name: "캐세이퍼시픽", code: "CX", location: "3층 M 카운터", terminal: "제1터미널" },
    { id: 10, name: "기타", code: "-", location: "3층 H, J, K, M 카운터", terminal: "제1터미널" },

    // 제2 여객터미널
    { id: 11, name: "대한항공", code: "KE", location: "3층 A, B, D, E 카운터", terminal: "제2터미널" },
    { id: 12, name: "델타항공", code: "DL", location: "3층 B, C 카운터", terminal: "제2터미널" },
    { id: 13, name: "에어프랑스", code: "AF", location: "3층 C 카운터", terminal: "제2터미널" },
    { id: 14, name: "KLM 네덜란드항공", code: "KL", location: "3층 C 카운터", terminal: "제2터미널" },
    { id: 15, name: "중화항공", code: "CI", location: "3층 G 카운터", terminal: "제2터미널" },
    { id: 16, name: "샤먼항공", code: "MF", location: "3층 G 카운터", terminal: "제2터미널" },
    { id: 17, name: "가루다인도네시아항공", code: "GA", location: "3층 G 카운터", terminal: "제2터미널" },
  ]

  // 주차장 정보 가져오기
  useEffect(() => {
    const loadParkingData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchParkingStatus()
        setParkingData(data)
      } catch (err) {
        setError("주차장 정보를 불러오는데 실패했습니다.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadParkingData()
  }, [])

  // 혼잡도 색상 결정 함수
  const getCongestionColor = (level: string) => {
    switch (level) {
      case "혼잡":
        return "text-red-600 bg-red-100"
      case "보통":
        return "text-amber-600 bg-amber-100"
      case "여유":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  // 현재 시간에 가장 가까운 데이터 포인트를 찾는 함수
  const getCurrentData = (data: any[]) => {
    const now = new Date()
    const hours = now.getHours()

    // 가장 가까운 시간대 찾기
    let closest = data[0]
    let closestDiff = Math.abs(Number.parseInt(data[0].time.split(":")[0]) - hours)

    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(Number.parseInt(data[i].time.split(":")[0]) - hours)
      if (diff < closestDiff) {
        closest = data[i]
        closestDiff = diff
      }
    }

    return closest
  }

  // 터미널에 따른 데이터 필터링
  const getFilteredParkingData = () => {
    if (parkingData.length === 0) return []

    return parkingData.filter((item) => {
      if (selectedTerminal === "제1터미널") {
        return item.floor.includes("T1") || item.floor.includes("제1")
      } else {
        return item.floor.includes("T2") || item.floor.includes("제2")
      }
    })
  }

  // 주차 가능 비율 계산 (100%를 넘지 않도록 제한)
  const calculateParkingPercentage = (current: number, total: number) => {
    const percentage = (current / total) * 100
    return Math.min(percentage, 100)
  }

  // 주차장 점유율에 따른 색상 결정
  const getParkingStatusColor = (current: number, total: number) => {
    const occupancyRate = (current / total) * 100
    if (occupancyRate < 70) {
      return "bg-green-500" // 여유
    } else if (occupancyRate < 90) {
      return "bg-yellow-500" // 보통
    } else {
      return "bg-red-500" // 혼잡
    }
  }

  // 주차장 상태 텍스트 반환
  const getParkingStatusText = (current: number, total: number) => {
    const remaining = total - current
    if (remaining <= 0) {
      return "만차"
    }
    return `${remaining}대 여유`
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return null
      }
      return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return null
    }
  }

  // 날짜 포맷팅 함수
  const formatDateString = (daysToAdd: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysToAdd)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '/').replace('.', '')
  }

  // 날짜 옵션 생성
  const dateOptions = [
    { value: "오늘", label: `오늘 (${formatDateString(0)})` },
    { value: "내일", label: `내일 (${formatDateString(1)})` },
    { value: "모레", label: `모레 (${formatDateString(2)})` },
  ]

  // 승객 예고 정보 가져오기
  useEffect(() => {
    const loadPassengerData = async () => {
      setIsLoading(true)
      try {
        const selectdate = selectedDate === "오늘" ? 1 : selectedDate === "내일" ? 2 : 3;
        const data = await fetchPassengerForecast(selectdate)
        setPassengerData(data)
      } catch (error) {
        console.error("Error loading passenger data:", error)
        setError("승객 정보를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPassengerData()
  }, [selectedDate])

  // 시간대별 데이터 가공
  const getHourlyData = () => {
    if (!passengerData?.body?.items?.item) return [];

    return passengerData.body.items.item
      .filter((item: any) => item.atime !== "합계")
      .map((item: any) => ({
        time: formatTimeRange(item.atime),
        "T1 입국": Math.abs(item.t1sumset1),
        "T1 출국": Math.abs(item.t1sumset2),
        "T2 입국": Math.abs(item.t2sumset1),
        "T2 출국": Math.abs(item.t2sumset2),
      }));
  }

  // 시간대 옵션
  const timeOptions = useMemo(() => 
    passengerData?.body?.items?.item
      ?.filter((item: any) => item.atime !== "합계")
      ?.map((item: any) => formatTimeRange(item.atime)) || []
  , [passengerData])

  // 현재 시간에 해당하는 시간대 찾기
  const getCurrentTimeSlot = useCallback(() => {
    const now = new Date()
    const kstHour = now.getHours()
    
    // timeOptions 중에서 현재 시간이 포함된 시간대 찾기
    const currentSlot = timeOptions.find((timeSlot: string) => {
      const startHour = parseInt(timeSlot.split(":")[0])
      return startHour === kstHour
    })
    
    // 현재 시간대가 없으면 첫 번째 시간대 반환
    return currentSlot || timeOptions[0]
  }, [timeOptions])

  // 컴포넌트가 마운트되거나 passengerData가 변경될 때 현재 시간대로 설정
  useEffect(() => {
    if (!selectedTime && passengerData?.body?.items?.item) {
      setSelectedTime(getCurrentTimeSlot())
    }
  }, [passengerData, getCurrentTimeSlot, selectedTime])

  // 혼잡도 데이터 가공
  const getCongestionData = (): CongestionDataMap | null => {
    if (!passengerData?.body?.items?.item) return null;

    const currentData = passengerData.body.items.item.find((item: any) => {
      return formatTimeRange(item.atime) === selectedTime;
    });

    if (!currentData) return null;

    return {
      "입국장": {
        "T1 입국장 동편(A,B)": { level: getCongestionLevel(Math.abs(currentData.t1sum1)), value: Math.abs(currentData.t1sum1) },
        "T1 입국장 서편(E,F)": { level: getCongestionLevel(Math.abs(currentData.t1sum2)), value: Math.abs(currentData.t1sum2) },
        "T1 입국심사(C)": { level: getCongestionLevel(Math.abs(currentData.t1sum3)), value: Math.abs(currentData.t1sum3) },
        "T1 입국심사(D)": { level: getCongestionLevel(Math.abs(currentData.t1sum4)), value: Math.abs(currentData.t1sum4) },
        "T1 입국장 합계": { level: getCongestionLevel(Math.abs(currentData.t1sumset1)), value: Math.abs(currentData.t1sumset1) },
        "T2 입국장 1": { level: getCongestionLevel(Math.abs(currentData.t2sum1)), value: Math.abs(currentData.t2sum1) },
        "T2 입국장 2": { level: getCongestionLevel(Math.abs(currentData.t2sum2)), value: Math.abs(currentData.t2sum2) },
        "T2 입국장 합계": { level: getCongestionLevel(Math.abs(currentData.t2sumset1)), value: Math.abs(currentData.t2sumset1) },
      },
      "출국장": {
        "T1 출국장1,2": { level: getCongestionLevel(Math.abs(currentData.t1sum5)), value: Math.abs(currentData.t1sum5) },
        "T1 출국장3": { level: getCongestionLevel(Math.abs(currentData.t1sum6)), value: Math.abs(currentData.t1sum6) },
        "T1 출국장4": { level: getCongestionLevel(Math.abs(currentData.t1sum7)), value: Math.abs(currentData.t1sum7) },
        "T1 출국장5,6": { level: getCongestionLevel(Math.abs(currentData.t1sum8)), value: Math.abs(currentData.t1sum8) },
        "T1 출국장 합계": { level: getCongestionLevel(Math.abs(currentData.t1sumset2)), value: Math.abs(currentData.t1sumset2) },
        "T2 출국장 1": { level: getCongestionLevel(Math.abs(currentData.t2sum3)), value: Math.abs(currentData.t2sum3) },
        "T2 출국장 2": { level: getCongestionLevel(Math.abs(currentData.t2sum4)), value: Math.abs(currentData.t2sum4) },
        "T2 출국장 합계": { level: getCongestionLevel(Math.abs(currentData.t2sumset2)), value: Math.abs(currentData.t2sumset2) },
      },
    };
  };

  // 추천 구역 판단 함수
  const isRecommendedArea = (location: string, data: CongestionData, area: string, congestionData: CongestionDataMap | null) => {
    if (!congestionData) return false;

    if (area === "입국장") {
      // T1 입국장 비교
      if (location === "T1 입국장 동편(A,B)") {
        const westValue = congestionData[area]["T1 입국장 서편(E,F)"].value;
        return data.value <= westValue;
      }
      if (location === "T1 입국장 서편(E,F)") {
        const eastValue = congestionData[area]["T1 입국장 동편(A,B)"].value;
        return data.value <= eastValue;
  }

      // T1 입국심사 비교
      if (location === "T1 입국심사(C)") {
        const dValue = congestionData[area]["T1 입국심사(D)"].value;
        return data.value <= dValue;
      }
      if (location === "T1 입국심사(D)") {
        const cValue = congestionData[area]["T1 입국심사(C)"].value;
        return data.value <= cValue;
      }

      // T2 입국장 비교
      if (location === "T2 입국장 1") {
        const terminal2Value = congestionData[area]["T2 입국장 2"].value;
        return data.value <= terminal2Value;
      }
      if (location === "T2 입국장 2") {
        const terminal1Value = congestionData[area]["T2 입국장 1"].value;
        return data.value <= terminal1Value;
      }
    } else if (area === "출국장") {
      // T1 출국장 비교 - 모든 출국장 중 최소값 찾기
      if (location.startsWith("T1 출국장") && !location.includes("합계")) {
        const t1Areas = [
          "T1 출국장1,2",
          "T1 출국장3",
          "T1 출국장4",
          "T1 출국장5,6"
        ];
        const minValue = Math.min(...t1Areas.map(area => congestionData["출국장"][area].value));
        return data.value === minValue;
      }

      // T2 출국장 비교
      if (location === "T2 출국장 1") {
        const terminal2Value = congestionData[area]["T2 출국장 2"].value;
        return data.value <= terminal2Value;
      }
      if (location === "T2 출국장 2") {
        const terminal1Value = congestionData[area]["T2 출국장 1"].value;
        return data.value <= terminal1Value;
      }
    }

    return false;
  };

  return (
    <div className="container mx-auto px-4 pt-2 pb-6 min-h-screen">
      <Tabs defaultValue="congestion" className="mt-4">
        <TabsList className="flex w-full mb-6 gap-2 justify-between">
          <TabsTrigger value="congestion" className="tabs-trigger flex-1">
            출입국장 혼잡도
          </TabsTrigger>
          <TabsTrigger value="facilities" className="tabs-trigger flex-1">
            편의시설
          </TabsTrigger>
          <TabsTrigger value="airlines" className="tabs-trigger flex-1">
            항공사 위치
          </TabsTrigger>
          <TabsTrigger value="parking" className="tabs-trigger flex-1">
            주차장 현황
          </TabsTrigger>
        </TabsList>

        <TabsContent value="congestion">
          <div className="container mx-auto p-4 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[180px] bg-white border-gray-200">
                    <SelectValue placeholder="날짜 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 italic">
                  본 데이터는 실측 데이터가 아닌 인천 공항의 예측 데이터로 실시간 공항 혼잡 상황과 차이가 있을 수 있습니다.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : (
              <>
            <Card>
                  <CardHeader>
                    <CardTitle>시간대별 승객 현황</CardTitle>
              </CardHeader>
              <CardContent>
                    <Tabs defaultValue="입국" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100/50">
                        <TabsTrigger 
                          value="입국" 
                          className="data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                          입국
                        </TabsTrigger>
                        <TabsTrigger 
                          value="출국"
                          className="data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                          출국
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="입국">
                        <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getHourlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                              <Tooltip />
                      <Legend />
                              <Line type="monotone" dataKey="T1 입국" stroke="#8884d8" />
                              <Line type="monotone" dataKey="T2 입국" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                      </TabsContent>
                      <TabsContent value="출국">
                        <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getHourlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                              <Tooltip />
                      <Legend />
                              <Line type="monotone" dataKey="T1 출국" stroke="#eab308" />
                              <Line type="monotone" dataKey="T2 출국" stroke="#dc2626" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                      </TabsContent>
                    </Tabs>
              </CardContent>
            </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>구역별 혼잡도</CardTitle>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="시간대 선택" />
                </SelectTrigger>
                <SelectContent>
                        {timeOptions.map((time: string) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="입국장" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100/50">
                        <TabsTrigger 
                          value="입국장" 
                          className="data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                          입국장
                        </TabsTrigger>
                        <TabsTrigger 
                          value="출국장"
                          className="data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                          출국장
                        </TabsTrigger>
                      </TabsList>
                      {["입국장", "출국장"].map((area) => (
                        <TabsContent key={area} value={area}>
                          <div className="space-y-6">
                            <div>
                              <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-lg font-semibold">제1 터미널</h3>
                                {getCongestionData() && (
                                  <span className="text-sm text-gray-600">
                                    {area} 합계: {Math.floor(getCongestionData()?.[area as keyof CongestionDataMap]?.[`T1 ${area} 합계`]?.value || 0)}명
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getCongestionData() &&
                                  Object.entries(getCongestionData()?.[area as keyof CongestionDataMap] || {})
                                    .filter(([location]) => 
                                      (location.includes("T1") || (location.includes("1") && !location.includes("T2"))) && 
                                      !location.includes("합계")
                                    )
                                    .map(([location, data]) => (
                                      <Card 
                                        key={location} 
                                        className={isRecommendedArea(location, data, area, getCongestionData()) ? 
                                          "border-2 border-sky-500" : ""}
                                      >
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-center">
                                            <h3 className="font-medium">{location}</h3>
                                            <Badge className={getCongestionColor(data.level)}>
                                              {data.level} ({Math.floor(data.value)}명)
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                              </div>
                            </div>

                      <div>
                              <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-lg font-semibold">제2 터미널</h3>
                                {getCongestionData() && (
                                  <span className="text-sm text-gray-600">
                                    {area} 합계: {Math.floor(getCongestionData()?.[area as keyof CongestionDataMap]?.[`T2 ${area} 합계`]?.value || 0)}명
                                  </span>
                                )}
                      </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getCongestionData() &&
                                  Object.entries(getCongestionData()?.[area as keyof CongestionDataMap] || {})
                                    .filter(([location]) => 
                                      (location.includes("T2") || (location.includes("2") && !location.includes("1"))) && 
                                      !location.includes("합계")
                                    )
                                    .map(([location, data]) => (
                                      <Card 
                                        key={location} 
                                        className={isRecommendedArea(location, data, area, getCongestionData()) ? 
                                          "border-2 border-sky-500" : ""}
                                      >
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-center">
                                            <h3 className="font-medium">{location}</h3>
                                            <Badge className={getCongestionColor(data.level)}>
                                              {data.level} ({Math.floor(data.value)}명)
                      </Badge>
                    </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="facilities">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="터미널 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="제1터미널">제1터미널</SelectItem>
                <SelectItem value="제2터미널">제2터미널</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {facilityCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="편의시설명을 입력해주세요."
                className="pl-10"
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredFacilities().map((facility) => (
              <Card key={facility.id}>
                <CardContent className="p-4 flex items-start">
                  <div className="bg-white rounded-full p-2 mr-3">
                    <facility.icon className="h-5 w-5 text-[#494949]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{facility.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{facility.location}</p>
                    <div className="flex flex-col gap-1 mb-2">
                      <p className="text-xs text-gray-600">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {facility.hours}
                      </p>
                      <p className="text-xs text-gray-600">📞 {facility.phone}</p>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {facility.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredFacilities().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {facilitySearch ? "검색 결과가 없습니다." : "해당 조건에 맞는 편의시설이 없습니다."}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {facilitySearch ? "다른 검색어를 입력해보세요." : "다른 터미널이나 카테고리를 선택해보세요."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="airlines">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="터미널 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="제1터미널">제1터미널</SelectItem>
                <SelectItem value="제2터미널">제2터미널</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="항공사명을 입력해주세요."
                className="pl-10"
                value={airlineSearch}
                onChange={(e) => setAirlineSearch(e.target.value)}
              />
            </div>
          </div>

          {selectedTerminal === "제1터미널" && (
            <div className="mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <Plane className="h-5 w-5 mr-2" /> 제1터미널 항공사 카운터 배치도
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src="/images/terminal1-layout.jpeg"
                      alt="제1터미널 항공사 카운터 배치도"
                      className="w-full h-auto max-w-3xl rounded-md shadow-sm"
                    />
                  </div>
                  <div className="flex justify-center">
                    <img
                      src="/images/terminal1-legend.png"
                      alt="제1터미널 배치도 범례"
                      className="w-full h-auto max-w-3xl rounded-md shadow-sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">3층 출국장 체크인 카운터 배치도</p>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTerminal === "제2터미널" && (
            <div className="mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <Plane className="h-5 w-5 mr-2" /> 제2터미널 항공사 카운터 배치도
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src="/images/terminal2-layout.jpeg"
                      alt="제2터미널 항공사 카운터 배치도"
                      className="w-full h-auto max-w-3xl rounded-md shadow-sm"
                    />
                  </div>
                  <div className="flex justify-center">
                    <img
                      src="/images/terminal2-legend.png"
                      alt="제2터미널 배치도 범례"
                      className="w-full h-auto max-w-3xl rounded-md shadow-sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">3층 출국장 체크인 카운터 배치도</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-4">
            {airlineCounters
              .filter(
                (airline) =>
                  airline.terminal === selectedTerminal &&
                  airline.name.toLowerCase().includes(airlineSearch.toLowerCase()),
              )
              .map((airline) => (
                <Card key={airline.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <Plane className="h-5 w-5 text-[#494949] mr-3 shrink-0" />
                        <div>
                          <h3 className="font-medium">{airline.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="font-mono text-sm">
                          {airline.code}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-end">
                        <p className="text-sm text-gray-500 text-right">{airline.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {airlineCounters.filter(
              (airline) =>
                airline.terminal === selectedTerminal &&
                airline.name.toLowerCase().includes(airlineSearch.toLowerCase()),
            ).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
                <p className="text-sm text-gray-400 mt-2">다른 항공사명을 입력해보세요.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="parking">
          <div className="mb-6">
            <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="터미널 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="제1터미널">제1터미널</SelectItem>
                <SelectItem value="제2터미널">제2터미널</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium flex items-center">
                  <Car className="h-5 w-5 mr-2" /> {selectedTerminal} 주차장 안내도
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <img
                  src={selectedTerminal === "제1터미널" ? "/images/parking-info-t1.png" : "/images/parking-info-t2.png"}
                  alt={`${selectedTerminal} 주차장 안내도`}
                  className="w-full h-auto max-w-3xl rounded-md shadow-sm"
                />
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">주차장 정보를 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <p className="text-sm text-gray-500 mt-2">잠시 후 다시 시도해주세요.</p>
            </div>
          ) : parkingData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">주차장 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredParkingData().map((parking, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <Car className="h-5 w-5 mr-2" /> {parking.floor}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">주차 현황</span>
                      <div className="text-right">
                        <span className="font-medium">
                          {parking.parking} / {parking.parkingarea}
                        </span>
                        <div className="text-xs text-gray-500">
                          {getParkingStatusText(Number(parking.parking), Number(parking.parkingarea))}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${getParkingStatusColor(Number(parking.parking), Number(parking.parkingarea))}`}
                        style={{
                          width: `${calculateParkingPercentage(Number(parking.parking), Number(parking.parkingarea))}%`,
                          maxWidth: "100%",
                        }}
                      ></div>
                    </div>
                    {formatDate(parking.datetm) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">업데이트 시간</span>
                        <Badge variant="outline">{formatDate(parking.datetm)}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-4 bg-white p-3 rounded-md flex items-start space-x-2">
            <Clock className="h-5 w-5 text-[#494949] shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              주차장 정보는 실시간으로 업데이트됩니다. 주차 공간은 빠르게 변동될 수 있습니다.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
