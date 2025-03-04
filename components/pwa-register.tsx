"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function PWARegister() {
  const { toast } = useToast()
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Check if we're in a production environment by looking at the hostname
    // This helps avoid service worker registration in preview environments
    const hostname = window.location.hostname
    const isProductionHost =
      !hostname.includes("vusercontent.net") && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")

    setIsProduction(isProductionHost)

    if (typeof window !== "undefined" && "serviceWorker" in navigator && isProductionHost) {
      // Only register the service worker in production environments
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
          // Don't show error toast in preview environments
          if (isProductionHost) {
            toast({
              title: "Offline mode limited",
              description: "The app will still work offline, but may need to reload when you revisit.",
              duration: 5000,
            })
          }
        })
    }
  }, [toast])

  return null
}

