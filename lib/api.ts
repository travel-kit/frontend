import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { API_URL } from './constants'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CORS 인증 정보 포함
})

// 요청 인터셉터
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 