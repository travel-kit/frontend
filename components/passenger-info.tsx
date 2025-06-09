interface PassengerInfoProps {
  data: any;
}

export function PassengerInfo({ data }: PassengerInfoProps) {
  if (!data || !data.body || !data.body.items || !data.body.items.item) {
    return null;
  }

  const items = data.body.items.item;
  const totalRow = items.find((item: any) => item.atime === '합계');

  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">인천공항 승객 예고 정보</h3>
        
        {/* 전체 합계 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">전체 합계</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium">제1터미널</h5>
              <div className="space-y-1">
                <p>입국: {totalRow?.t1sumset1}명</p>
                <p>출국: {totalRow?.t1sumset2}명</p>
              </div>
            </div>
            <div>
              <h5 className="font-medium">제2터미널</h5>
              <div className="space-y-1">
                <p>입국: {totalRow?.t2sumset1}명</p>
                <p>출국: {totalRow?.t2sumset2}명</p>
              </div>
            </div>
          </div>
        </div>

        {/* 시간대별 정보 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-50">시간대</th>
                <th className="px-4 py-2 bg-gray-50">T1 입국</th>
                <th className="px-4 py-2 bg-gray-50">T1 출국</th>
                <th className="px-4 py-2 bg-gray-50">T2 입국</th>
                <th className="px-4 py-2 bg-gray-50">T2 출국</th>
              </tr>
            </thead>
            <tbody>
              {items.filter((item: any) => item.atime !== '합계').map((item: any) => (
                <tr key={item.atime} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{item.atime.replace('_', '~')}</td>
                  <td className="px-4 py-2 border text-right">{item.t1sumset1}</td>
                  <td className="px-4 py-2 border text-right">{item.t1sumset2}</td>
                  <td className="px-4 py-2 border text-right">{item.t2sumset1}</td>
                  <td className="px-4 py-2 border text-right">{item.t2sumset2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 