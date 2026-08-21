import React, { createContext, useContext, useEffect, useState } from 'react'
import { getToken, setToken, clearToken, getStoredUser, setStoredUser, setUnauthorizedHandler, StoredUser } from './api'

interface AuthCtx {
  token: string | null
  user: StoredUser | null
  login: (token: string, user: StoredUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken())
  const [user, setUser] = useState<StoredUser | null>(getStoredUser())

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setTokenState(null)
      setUser(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = (t: string, u: StoredUser) => {
    setToken(t)
    setStoredUser(u)
    setTokenState(t)
    setUser(u)
  }

  const logout = () => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
