import { agbalumo } from "@/lib/fonts"
import LoginForm from "@/components/login-form"

export default function Home() {
  // 루트 경로에서 직접 로그인 폼 표시하고 폰트 클래스 전달
  return <LoginForm agbalumoClassName={agbalumo.className} />
}
