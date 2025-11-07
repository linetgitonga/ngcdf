"use client"

import React from "react"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-secondary dark:from-background-dark dark:to-background-dark-secondary">
      <div className="w-full max-w-md px-4">
        <div className="bg-card dark:bg-card-bg-dark border border-border dark:border-border-dark rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-foreground-muted dark:text-foreground-dark-muted mt-2">Enter your phone number to receive reset instructions.</p>
          </div>

          <ForgotPasswordForm />

          <div className="mt-6 text-sm text-center">
            <Link href="/login" className="text-primary hover:underline">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
