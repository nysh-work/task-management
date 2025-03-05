"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  // If not logged in, redirect to sign in page
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  const handleLogout = async () => {
    await logout()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback>{user.name ? getInitials(user.name) : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Account Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">Account ID</span>
              <span>{user.id}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 