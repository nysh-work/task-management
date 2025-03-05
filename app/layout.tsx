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

// Detect if we're in a static generation or prerendering context
const isStaticRendering = 
  process.env.VERCEL || 
  process.env.NEXT_PHASE === 'phase-production-build';

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
          {isStaticRendering ? (
            // During prerendering/static build, don't use auth providers
            // This prevents "e is not a function" errors
            <div className="min-h-screen">{children}</div>
          ) : (
            // During normal operation, use the full provider structure
            <SessionProvider>
              <AuthProvider>
                <TaskProvider>
                  {children}
                </TaskProvider>
              </AuthProvider>
            </SessionProvider>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}