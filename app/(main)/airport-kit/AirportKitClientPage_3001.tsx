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
  const [selectedDate, setSelectedDate] = useState("오늘")
  const [selectedTime, setSelectedTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passengerData, setPassengerData] = useState<any>(null)

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
  )
}
