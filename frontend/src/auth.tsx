import React, { createContext, useContext, useEffect, useState } from 'react'
import { getToken, setToken, clearToken } from './api'

interface AuthCtx {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken())

  useEffect(() => {
    setTokenState(getToken())
  }, [])

  const login = (t: string) => {
    setToken(t)
    setTokenState(t)
  }

  const logout = () => {
    clearToken()
    setTokenState(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}