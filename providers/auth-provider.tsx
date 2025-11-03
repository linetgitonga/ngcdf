"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export interface User {
  id: string
  phone_number: string
  first_name: string
  last_name: string
  role: "admin" | "officer" | "leader"
  ward: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (phoneNumber: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      apiClient.loadTokens()
      // Use the public helper to check if an access token was loaded
      if (apiClient.hasAccessToken()) {
        // Token exists, user is authenticated
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async (phoneNumber: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<{
        access: string
        refresh: string
        user: User
      }>("/dashboard-login/", {
        phone_number: phoneNumber,
        password,
      })

      apiClient.setTokens(response.access, response.refresh)
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiClient.clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
