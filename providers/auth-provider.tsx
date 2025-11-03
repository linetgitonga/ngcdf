"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type User = {
  id?: string
  first_name?: string
  last_name?: string
  role?: string
  phone?: string
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (phoneNumber: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("skika_user")
      if (raw) setUser(JSON.parse(raw))
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (phoneNumber: string, password: string) => {
    // Minimal fake login for dev: replace with real API call
    setIsLoading(true)
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (!phoneNumber) return reject(new Error("Phone number required"))
        const fakeUser: User = {
          id: "1",
          first_name: "Officer",
          last_name: "User",
          role: "officer",
          phone: phoneNumber,
        }
        setUser(fakeUser)
        try {
          localStorage.setItem("skika_user", JSON.stringify(fakeUser))
        } catch (_) {}
        setIsLoading(false)
        resolve()
      }, 400)
    })
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("skika_user")
    } catch (_) {}
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
