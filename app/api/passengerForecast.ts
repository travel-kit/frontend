interface PassengerForecastResponse {
  body: {
    items: {
      item: Array<{
        atime: string;
        t1sumset1: number; // T1 입국
        t1sumset2: number; // T1 출국
        t2sumset1: number; // T2 입국
        t2sumset2: number; // T2 출국
        t1sum1: number; // T1 입국장 동편(A,B)
        t1sum2: number; // T1 입국장 서편(E,F)
        t1sum3: number; // T1 입국심사(C)
        t1sum4: number; // T1 입국심사(D)
        t1sum5: number; // T1 출국장1,2
        t1sum6: number; // T1 출국장3
        t1sum7: number; // T1 출국장4
        t1sum8: number; // T1 출국장5,6
        t2sum1: number; // T2 입국장 1
        t2sum2: number; // T2 입국장 2
        t2sum3: number; // T2 출국장 1
        t2sum4: number; // T2 출국장 2
      }>;
    };
  };
}

// API URL을 환경에 따라 결정하는 함수
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080';
  }
  return 'https://backend-production-51cd.up.railway.app';
};

export async function fetchPassengerForecast(selectdate: number) {
  try {
    const baseUrl = getApiUrl();
    const response = await fetch(
      `${baseUrl}/api/test/passenger-notice?selectdate=${selectdate}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch passenger forecast');
    }

    const data: PassengerForecastResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching passenger forecast:', error);
    throw error;
  }
}

// 혼잡도 레벨 계산 함수
export function getCongestionLevel(passengers: number): string {
  if (passengers < 300) return "여유";
  if (passengers < 600) return "보통";
  return "혼잡";
}

// 시간 포맷 변환 함수
export function formatTimeRange(atime: string): string {
  if (atime === "합계") return atime;
  const [start] = atime.split("_");
  const startHour = parseInt(start);
  return `${start}:00 ~ ${(startHour + 1).toString().padStart(2, "0")}:00`;
} 