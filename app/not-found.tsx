import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="mb-4">요청하신 페이지가 존재하지 않습니다.</p>
        <Link href="/home" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
