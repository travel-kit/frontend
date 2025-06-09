"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface UserContextType {
  user: User | null
  loading: boolean
  userName: string
  setUserName: (name: string) => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  userName: '',
  setUserName: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      if (user) {
        setUserName(user.displayName || '사용자')
      } else {
        setUserName('')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, userName, setUserName }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
} 