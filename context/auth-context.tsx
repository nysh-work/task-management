"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: any | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  googleLogin: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Login with email and password
  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    }
  }

  // Register new user
  const register = async (name: string, email: string, password: string) => {
    setError(null)
    try {
      // Call the registration API endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // If registration is successful, redirect to sign in
      router.push("/auth/signin?registered=true")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Registration failed. Please try again.")
      }
      console.error(err)
    }
  }

  // Logout
  const logout = async () => {
    await signOut({ redirect: false })
    router.push("/auth/signin")
  }

  // Google login
  const googleLogin = async () => {
    setError(null)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      setError("Google login failed. Please try again.")
      console.error(err)
    }
  }

  const value = {
    user: session?.user || null,
    loading: status === "loading",
    error,
    login,
    register,
    logout,
    googleLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 