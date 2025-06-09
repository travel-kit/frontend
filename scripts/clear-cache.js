const fs = require("fs")
const path = require("path")

console.log("🧹 Next.js 빌드 캐시 초기화 중...")

// .next 폴더 삭제
const nextDir = path.join(process.cwd(), ".next")
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true })
  console.log("✅ .next 폴더가 삭제되었습니다.")
} else {
  console.log("ℹ️  .next 폴더가 존재하지 않습니다.")
}

// node_modules/.cache 폴더 삭제 (있다면)
const cacheDir = path.join(process.cwd(), "node_modules", ".cache")
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true })
  console.log("✅ node_modules/.cache 폴더가 삭제되었습니다.")
}

console.log("🚀 이제 npm run build를 실행하여 새로 빌드하세요.")
console.log('📝 Vercel 배포 시에는 배포 설정에서 "Clear Build Cache"를 체크하세요.')
