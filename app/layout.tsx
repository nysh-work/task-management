import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata, Viewport } from "next"
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/context/auth-context"
import { TaskProvider } from "@/context/task-context"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Manage your tasks with calendar and list views",
  manifest: "/manifest.json",
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <AuthProvider>
              <TaskProvider>
                {children}
              </TaskProvider>
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}