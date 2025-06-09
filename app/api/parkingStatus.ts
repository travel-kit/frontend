const encodedKey = "7dDWXrSnLtH1uNISYe1GNbWAQyeuKUn33Krx41SdkNacCKoKMX3vELPvwRWB%2FyzE2Y%2BhX7%2Fd9MlTiUmsXyGxMg%3D%3D"

export interface ParkingItem {
  floor: string
  parking: number
  parkingarea: number
  datetm: string
}

export async function fetchParkingStatus(): Promise<ParkingItem[]> {
  const url = `https://apis.data.go.kr/B551177/StatusOfParking/getTrackingParking?serviceKey=${encodedKey}&numOfRows=10&pageNo=1&type=json`

  try {
    const response = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = await response.json()
    return json?.response?.body?.items || []
  } catch (error) {
    console.error("주차 정보 요청 오류:", error)
    return []
  }
}
