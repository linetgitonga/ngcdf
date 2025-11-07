"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

export default function ForgotPasswordForm() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!phoneNumber) {
      setError("Phone number is required")
      return
    }

    setIsLoading(true)
    try {
      // Send request to backend to initiate password reset. Adjust endpoint if different.
      await apiClient.unauthenticatedPost("/password-reset/", { phone_number: phoneNumber })
      setMessage("If the phone number is registered, you will receive further instructions.")
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && 'message' in (err as any) ? (err as any).message : "Request failed"
      setError(String(msg))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <div className="bg-green-50 text-green-800 px-4 py-2 rounded">{message}</div>}
      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-foreground dark:text-foreground-dark mb-2">Phone Number</label>
        <Input
          type="tel"
          placeholder="+254712345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
        <p className="text-xs text-foreground-muted dark:text-foreground-dark-muted mt-1">We will send instructions to reset your password.</p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Sending..." : "Send reset instructions"}
      </Button>
    </form>
  )
}
