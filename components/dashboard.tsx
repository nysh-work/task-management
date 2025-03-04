"use client"

import { useState, useEffect } from "react"
import { useTaskContext } from "@/context/task-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListView } from "@/components/list-view"
import { CalendarView } from "@/components/calendar-view"
import { StatisticsView } from "@/components/statistics-view"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { 
  CalendarDays, 
  ListTodo, 
  BarChart3, 
  MapPin,
  Bell,
  BellOff
} from "lucide-react"
import { 
  startLocationMonitoring, 
  stopLocationMonitoring,
  isLocationMonitoringActive,
  requestNotificationPermission
} from "@/lib/location-monitor"
import { isGeolocationSupported } from "@/lib/location-service"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TaskSummary } from "@/components/task-summary"
import { Toaster } from "@/components/ui/toaster"
import { PWARegister } from "@/components/pwa-register"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export function Dashboard() {
  const { state } = useTaskContext()
  const [activeTab, setActiveTab] = useState("list")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isLocationMonitoringEnabled, setIsLocationMonitoringEnabled] = useState(false)
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null)

  // Check for geolocation and notification support
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    setIsGeolocationAvailable(isGeolocationSupported());
    
    if (typeof Notification !== "undefined") {
      setNotificationPermission(Notification.permission);
    }
    
    // Check if location monitoring is already active
    setIsLocationMonitoringEnabled(isLocationMonitoringActive());
  }, []);

  // Handle toggling location monitoring
  const toggleLocationMonitoring = async () => {
    if (isLocationMonitoringEnabled) {
      stopLocationMonitoring();
      setIsLocationMonitoringEnabled(false);
    } else {
      // Request notification permission if not already granted
      if (notificationPermission !== "granted") {
        const granted = await requestNotificationPermission();
        if (granted) {
          setNotificationPermission("granted");
        } else {
          // Can't enable monitoring without notification permission
          return;
        }
      }
      
      // Start location monitoring
      startLocationMonitoring(() => state.tasks);
      setIsLocationMonitoringEnabled(true);
    }
  };

  // Generate location monitoring status label
  const getLocationStatusLabel = () => {
    if (!isGeolocationAvailable) {
      return "Unavailable";
    }
    
    if (notificationPermission !== "granted") {
      return "Needs Permission";
    }
    
    return isLocationMonitoringEnabled ? "Active" : "Inactive";
  };

  // Generate location monitoring status color
  const getLocationStatusColor = () => {
    if (!isGeolocationAvailable) {
      return "destructive";
    }
    
    if (notificationPermission !== "granted") {
      return "secondary";
    }
    
    return isLocationMonitoringEnabled ? "default" : "secondary";
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <div className="flex items-center gap-3">
          {/* Location Monitoring Toggle */}
          {isGeolocationAvailable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3">
                    <Badge variant={getLocationStatusColor()}>
                      <MapPin className="h-3 w-3 mr-1" />
                      {getLocationStatusLabel()}
                    </Badge>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={toggleLocationMonitoring}
                      disabled={!isGeolocationAvailable || notificationPermission === "denied"}
                    >
                      {isLocationMonitoringEnabled ? (
                        <BellOff className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {!isGeolocationAvailable
                    ? "Geolocation is not supported in this browser"
                    : notificationPermission === "denied"
                    ? "Notification permission denied. Please update your browser settings."
                    : isLocationMonitoringEnabled
                    ? "Disable location-based reminders"
                    : "Enable location-based reminders"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <ModeToggle />
          <AddTaskDialog open={isAddTaskOpen} setOpen={setIsAddTaskOpen} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">
              <ListTodo className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-6">
          <TaskSummary />
          <ListView />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <TaskSummary />
          <CalendarView />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <StatisticsView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

