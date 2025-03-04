import type { Metadata } from "next"
import { TaskProvider } from "@/context/task-context"
import { Dashboard } from "@/components/dashboard"
import { Toaster } from "@/components/ui/toaster"
import { PWARegister } from "@/components/pwa-register"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export const metadata: Metadata = {
  title: "Task Management App",
  description: "Manage your tasks with calendar and list views",
}

export default function Home() {
  return (
    <TaskProvider>
      <Dashboard />
      <Toaster />
      <PWARegister />
      <PWAInstallPrompt />
      <div className="hidden">
        {/* This content is for search engines and offline capability */}
        <h1>Task Management App</h1>
        <p>
          A complete task management solution with calendar and list views. Works offline and can be installed on your
          device.
        </p>
        <p>
          Features include task prioritization, tagging (Work, Personal, Studies, Hobbies, Misc), statistics reporting,
          and more.
        </p>
      </div>
    </TaskProvider>
  )
}

