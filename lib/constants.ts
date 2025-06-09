export const COUNTRY_FLAGS: { [key: string]: string } = {
  "일본": "🇯🇵",
  "중국": "🇨🇳",
  "태국": "🇹🇭",
  "베트남": "🇻🇳",
  "프랑스": "🇫🇷",
  "영국": "🇬🇧",
  "미국": "🇺🇸",
  "호주": "🇦🇺",
}

export const COUNTRIES = Object.entries(COUNTRY_FLAGS).map(([name, flag]) => ({
  name,
  flag,
  label: `${flag} ${name}`
}))

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
export const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000' 