"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download } from "lucide-react"

export function PWAInstallPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if the app is already installed
    if (typeof window !== "undefined") {
      // For iOS
      const isIOSStandalone = window.navigator.standalone === true
      // For other browsers
      const isOtherStandalone = window.matchMedia("(display-mode: standalone)").matches

      setIsStandalone(isIOSStandalone || isOtherStandalone)
    }

    const handler = (e: Event) => {
      // Prevent the default behavior
      e.preventDefault()
      // Store the event for later use
      setDeferredPrompt(e)
      // Show the install dialog
      setIsOpen(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the deferred prompt variable
      setDeferredPrompt(null)
      setIsOpen(false)
    })
  }

  // Don't show if already installed or no install prompt available
  if (!isOpen || isStandalone) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Install Task Manager</DialogTitle>
          <DialogDescription>Install this app on your device for quick access even when offline.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Benefits of installing:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Works offline</li>
            <li>Faster loading</li>
            <li>Home screen icon</li>
            <li>Full-screen experience</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Not now
          </Button>
          <Button onClick={handleInstall}>
            <Download className="mr-2 h-4 w-4" />
            Install
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

