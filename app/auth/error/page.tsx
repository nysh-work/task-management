"use client"

import React, { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const router = useRouter()

  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration. Please try again later."
      case "AccessDenied":
        return "You do not have permission to sign in."
      case "Verification":
        return "The verification link may have expired or has already been used."
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
      case "OAuthAccountNotLinked":
      case "EmailSignin":
      case "CredentialsSignin":
        return "There was a problem with your sign in attempt. Please try again."
      default:
        return "An unexpected error occurred. Please try again."
    }
  }

  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>There was a problem signing you in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="mb-4 text-gray-700">{getErrorMessage(error)}</p>
            <p className="text-sm text-gray-500">
              Error code: {error || "unknown"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
          <Button asChild>
            <Link href="/auth/signin">
              Try Again
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
} 