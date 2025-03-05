import type { Metadata } from "next"
import dynamic from "next/dynamic"

// Use dynamic import with SSR disabled to prevent prerendering issues
const ClientPage = dynamic(() => import("@/components/client-page"), {
  ssr: false,
})

export const metadata: Metadata = {
  title: "Task Management App",
  description: "Manage your tasks with calendar and list views",
}

export default function Home() {
  return <ClientPage />
}

