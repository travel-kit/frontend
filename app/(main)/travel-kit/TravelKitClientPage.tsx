"use client"

import React from "react"
import { useState } from "react"
import { Plus, AlertTriangle, Info, Trash2, ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export default function TravelKitClientPage() {
  const [newItem, setNewItem] = useState("")
  const [packingList, setPackingList] = useState([
    // 필수 카테고리
    { id: 1, name: "여권", checked: false, category: "필수" },
    { id: 2, name: "이심/유심", checked: false, category: "필수" },
    { id: 3, name: "현금", checked: false, category: "필수" },
    { id: 4, name: "지갑", checked: false, category: "필수" },
    { id: 5, name: "해외 사용 가능 카드(트래블로그/트래블월렛 추천)", checked: false, category: "필수" },
    { id: 6, name: "충전기 (+보조배터리)", checked: false, category: "필수" },
    { id: 7, name: "상비약", checked: false, category: "필수" },
    { id: 8, name: "숙소 예약 확인 내역 (pdf 저장시 간편)", checked: false, category: "필수" },
    { id: 9, name: "각종 바우처 및 티켓 사본", checked: false, category: "필수" },
    { id: 10, name: "여행자 보험 증명서", checked: false, category: "필수" },
    { id: 11, name: "멀티 어댑터", checked: false, category: "필수" },
    { id: 12, name: "이어폰", checked: false, category: "필수" },
    { id: 13, name: "(국제 면허증)", checked: false, category: "필수" },

    // 기내용 카테고리
    { id: 14, name: "실내용 슬리퍼 (숙소에서도 사용 가능!)", checked: false, category: "기내용" },
    { id: 15, name: "목베개", checked: false, category: "기내용" },
    { id: 16, name: "가습 마스크", checked: false, category: "기내용" },
    { id: 17, name: "물티슈", checked: false, category: "기내용" },
    { id: 18, name: "온열 안대", checked: false, category: "기내용" },
    { id: 19, name: "간식", checked: false, category: "기내용" },

    // 욕실용품 카테고리
    { id: 20, name: "칫솔치약 세트", checked: false, category: "욕실용품" },
    { id: 21, name: "여행용 샴푸+컨디셔너+바디워시 세트", checked: false, category: "욕실용품" },
    { id: 22, name: "여행용 샤워기+필터 (동남아, 유럽 여행시)", checked: false, category: "욕실용품" },
    { id: 23, name: "클렌징폼 (+클렌징티슈)", checked: false, category: "욕실용품" },
    { id: 24, name: "면도기", checked: false, category: "욕실용품" },
    { id: 25, name: "여성용품", checked: false, category: "욕실용품" },

    // 생활용품 카테고리
    { id: 26, name: "접이식 전기포트", checked: false, category: "생활용품" },
    { id: 27, name: "접이식 다리미", checked: false, category: "생활용품" },
    { id: 28, name: "접이식 우산", checked: false, category: "생활용품" },
    { id: 29, name: "세탁망", checked: false, category: "생활용품" },
    { id: 30, name: "나무젓가락", checked: false, category: "생활용품" },
    { id: 31, name: "고데기", checked: false, category: "생활용품" },
    { id: 32, name: "비상식량 (김, 라면, 과자, 햇반 등)", checked: false, category: "생활용품" },
    { id: 33, name: "☀️휴대용 선풍기", checked: false, category: "생활용품" },

    // 의류/잡화 카테고리
    { id: 34, name: "잠옷", checked: false, category: "의류/잡화" },
    { id: 35, name: "아우터", checked: false, category: "의류/잡화" },
    { id: 36, name: "상하의", checked: false, category: "의류/잡화" },
    { id: 37, name: "양말", checked: false, category: "의류/잡화" },
    { id: 38, name: "속옷", checked: false, category: "의류/잡화" },
    { id: 39, name: "모자", checked: false, category: "의류/잡화" },
    { id: 40, name: "신발", checked: false, category: "의류/잡화" },
    { id: 41, name: "선글라스", checked: false, category: "의류/잡화" },
    { id: 42, name: "크기별 가방", checked: false, category: "의류/잡화" },
    { id: 43, name: "수건", checked: false, category: "의류/잡화" },
    { id: 44, name: "(수영복)", checked: false, category: "의류/잡화" },
    { id: 45, name: "❄️머플러", checked: false, category: "의류/잡화" },

    // 뷰티 카테고리
    { id: 46, name: "기초화장품", checked: false, category: "뷰티" },
    { id: 47, name: "색조화장품", checked: false, category: "뷰티" },
  ])

  const addItem = () => {
    if (newItem.trim()) {
      setPackingList([...packingList, { id: Date.now(), name: newItem, checked: false, category: "기타" }])
      setNewItem("")
    }
  }

  const toggleItem = (id: number) => {
    setPackingList(packingList.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const deleteItem = (id: number) => {
    setPackingList(packingList.filter((item) => item.id !== id))
  }

  const categories = Array.from(new Set(packingList.map((item) => item.category)))

  // 여행지 주의사항 데이터
  const precautions = [
    {
      country: "일본 🇯🇵",
      items: [
        {
          text: "자연재해: 일본 기상청 및 NHK를 통해 실시간 정보 확인 + 'Safety Tips' 앱을 설치(긴급 알림)",
        },
        {
          text: "치안: 전반적으로 안전한 편, 각 지역별 위험 지역 확인",
        },
        {
          text: "교통: 좌측통행 국가 → 보행 시 주의, 대중교통 이용 시 정숙",
        },
        {
          text: "문화: 식당에서는 직원 안내 후 착석(팁 문화는 X) + 문신 있을 경우 온천 이용 제한",
        },
        {
          text: "입국 시: Visit Japan Web을 통해 미리 입국 수속 준비",
          link: "https://services.digital.go.jp/ko/visit-japan-web/",
          linkText: "Visit Japan Web",
        },
      ],
    },
    {
      country: "미국 🇺🇸",
      items: [
        {
          text: "범죄: 일부 지역 총기 허용 → 야간 외출 시 주의",
        },
        {
          text: "교통: 비보호 좌회전 등 한국과 다른 교통 법규 → 현지에서 운전 시 숙지 필요",
        },
        {
          text: "문화: 팁 문화가 일반적, 식당에서는 15~20%의 팁을 지불",
        },
        {
          text: "자연재해: 산불, 허리케인 등이 발생 가능 → 여행 전 현지 기상 정보 확인",
        },
        {
          text: "입국 시: 최대 90일 체류 가능한 ESTA 여행 비자 신청 필요",
          link: "https://esta.cbp.dhs.gov/",
          linkText: "ESTA",
        },
      ],
    },
    {
      country: "프랑스 🇫🇷",
      items: [
        {
          text: "치안: 관광지, 지하철 등에서 소매치기가 빈번 → 소지품 관리에 각별히 주의",
        },
        {
          text: "보안: Vigipirate 보안 경보 체계가 운영 중이며, 공공장소에서의 보안 검색에 협조 요망",
        },
        {
          text: "문화: 식당에서는 직원 안내 후 착석 + 프랑스어로 인사",
        },
        {
          text: "의료: 높은 의료 비용 → 여행자 보험 권장",
        },
        {
          text: "입국 시: 90일 이내 단기 체류 시 쉥겐 비자 면제(2026년부터 유럽 비자 면제 프로그램 ETIAS 필요)",
          link: "https://www.etias.co.kr/",
          linkText: "ETIAS",
        },
      ],
    },
    {
      country: "이탈리아 🇮🇹",
      items: [
        {
          text: "치안: 소매치기와 절도가 빈번 → 소지품 관리에 각별히 주의",
        },
        {
          text: "기후: 여름에는 고온으로 인해 탈수 증상이 발생 가능 → 기상 정보 확인 후 충분한 수분 섭취와 자외선 차단에 유의",
        },
        {
          text: "문화: 식당에서는 직원 안내 후 착석 + 장소별 복장 규정 확인",
        },
        {
          text: "입국 시: 유럽 비자 면제 프로그램 ETIAS 필요(90일 이내 단기 체류)",
          link: "https://www.etias.co.kr/",
          linkText: "ETIAS",
        },
      ],
    },
    {
      country: "스페인 🇪🇸",
      items: [
        {
          text: "치안: 소매치기와 절도가 빈번 → 소지품 관리에 각별히 주의",
        },
        {
          text: "교통: 과속 단속 카메라가 설치 → 속도 제한 준수 요망",
        },
        {
          text: "문화: 식당에서는 직원 안내 후 착석 + 카드 사용 권장",
        },
        {
          text: "입국 시: 유럽 비자 면제 프로그램 ETIAS 필요(90일 이내 단기 체류)",
          link: "https://www.etias.co.kr/",
          linkText: "ETIAS",
        },
      ],
    },
    {
      country: "태국 🇹🇭",
      items: [
        {
          text: "범죄: 정부기관 직원 사칭 피싱 범죄가 발생하고 있으므로, 개인 정보를 요구하는 연락에 주의",
        },
        {
          text: "교통: 좌측통행 국가 + 교통체증이 심함(이동 시간에 여유)",
        },
        {
          text: "문화: 사원 방문 시 복장 규정 확인",
        },
        {
          text: "입국 시: 관광 목적일 경우 비자없이 90일간 단기 체류 가능",
        },
      ],
    },
    {
      country: "베트남 🇻🇳",
      items: [
        {
          text: "치안: 오토바이를 이용한 날치기 절도 빈번 → 소지품 관리에 각별히 주의",
        },
        {
          text: "보건: 모기 매개 질병 예방을 위한 모기 기피제 사용 + 긴 옷 착용",
        },
        {
          text: "문화: 사원 방문 시 복장 규정 확인",
        },
        {
          text: "입국 시: 비자없이 최대 45일간 단기 체류 가능(E-VISA 신청 시 90일간 체류 가능)",
          link: "https://evisa.gov.vn/",
          linkText: "E-VISA",
        },
      ],
    },
    {
      country: "호주 🇦🇺",
      items: [
        {
          text: "자연재해: 건조 기후로 인한 산불 주의 → 현지 기상 정보 확인",
        },
        {
          text: "교통: 좌측통행 국가 → 현지 교통 법규 확인",
        },
        {
          text: "불법: 공공장소나 해변에서 음주 행위, 쿼카 만지기 등",
        },
        {
          text: "문화: 팁은 필수 X, 대중 교통 이용 시 식사 금지",
        },
        {
          text: "입국 시: 최대 3개월간 체류 가능한 eVisitor 신청 필요",
        },
      ],
    },
    {
      country: "필리핀 🇵🇭",
      items: [
        {
          text: "치안: 불법 총기를 이용한 범죄가 빈번 → 인적이 드문 지역의 이동 자제",
        },
        {
          text: "교통: 교통 체증이 심한 편, 안전을 위해 '그랩(Grab)' 앱 이용 권장",
        },
        {
          text: "자연재해: 우기 때 태풍 및 집중호우 발생, 화산 인근 지역 방문 시 지침 준수",
        },
        {
          text: "문화: 팁 문화가 일반적, 서비스를 받은 후 50-100페소 정도의 팁을 지불",
        },
        {
          text: "입국 시: 입국 소속 온라인 서비스 E-Travel 작성 후 QR 제시",
          link: "https://etravel.gov.ph/",
          linkText: "E-Travel",
        },
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 pt-2 pb-6 min-h-screen">
      <Tabs defaultValue="packing" className="mt-4">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="packing" className="tabs-trigger">
            짐 체크리스트
          </TabsTrigger>
          <TabsTrigger value="precautions" className="tabs-trigger">
            여행지 주의사항
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packing">
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="새 아이템 추가"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addItem()
                }
              }}
            />
            <Button onClick={addItem} className="flex flex-row items-center justify-center w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" /> 추가
            </Button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category}>
                <CardHeader className="py-3">
                  <CardTitle className="text-md font-medium">{category}</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    {packingList
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <div key={item.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          <Label
                            htmlFor={`item-${item.id}`}
                            className={`flex-1 cursor-pointer ${item.checked ? "line-through text-gray-400" : ""}`}
                          >
                            {item.name}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                            onClick={() => deleteItem(item.id)}
                            aria-label={`${item.name} 삭제`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="precautions">
          <Accordion type="single" collapsible className="w-full">
            {precautions.map((country, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">{country.country}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-2">
                    {country.items.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 p-1">
                        <AlertTriangle className="h-5 w-5 text-[#494949] shrink-0 mt-0.5" />
                        <p className="text-gray-700">
                          {item.link ? (
                            <>
                              {item.text.split(item.linkText).map((part, i, arr) => (
                                <React.Fragment key={i}>
                                  {part}
                                  {i < arr.length - 1 && (
                                    <Link
                                      href={item.link || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline inline-flex items-center"
                                    >
                                      {item.linkText}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Link>
                                  )}
                                </React.Fragment>
                              ))}
                            </>
                          ) : (
                            item.text
                          )}
                        </p>
                      </div>
                    ))}
                    <div className="mt-4 bg-white p-3 rounded-md flex items-start space-x-2">
                      <Info className="h-5 w-5 text-[#494949] shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">더 자세한 정보는 외교부 해외안전여행 사이트를 참고하세요.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  )
}
