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
  BellOff,
  LogIn,
  LogOut,
  User
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
import { useAuth } from "@/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Dashboard() {
  const { state } = useTaskContext()
  const [activeTab, setActiveTab] = useState("list")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isLocationMonitoringEnabled, setIsLocationMonitoringEnabled] = useState(false)
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null)
  const { user, loading, logout } = useAuth()

  // Check for geolocation and notification support
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if geolocation is supported
    setIsGeolocationAvailable(isGeolocationSupported());
    
    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Check if location monitoring is active
    setIsLocationMonitoringEnabled(isLocationMonitoringActive());
  }, []);
  
  // Toggle location monitoring
  const toggleLocationMonitoring = async () => {
    if (isLocationMonitoringEnabled) {
      stopLocationMonitoring();
      setIsLocationMonitoringEnabled(false);
    } else {
      // Request notification permission if not granted
      if (notificationPermission !== "granted") {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
        
        // Only start monitoring if permission granted
        if (permission === "granted") {
          startLocationMonitoring();
          setIsLocationMonitoringEnabled(true);
        }
      } else {
        startLocationMonitoring();
        setIsLocationMonitoringEnabled(true);
      }
    }
  };
  
  // Get location status label
  const getLocationStatusLabel = () => {
    if (!isGeolocationAvailable) {
      return "Geolocation not supported";
    }
    
    if (notificationPermission === "denied") {
      return "Notification permission denied";
    }
    
    return isLocationMonitoringEnabled ? "Location monitoring active" : "Location monitoring disabled";
  };
  
  // Get location status color
  const getLocationStatusColor = () => {
    if (!isGeolocationAvailable || notificationPermission === "denied") {
      return "destructive";
    }
    
    return isLocationMonitoringEnabled ? "default" : "secondary";
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Task Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <TaskSummary />
            <ModeToggle />
            
            {/* User Account Section */}
            {loading ? (
              <Button variant="ghost" size="icon" disabled>
                <User className="h-4 w-4" />
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                      <AvatarFallback>{user.name ? getInitials(user.name) : "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name || "User"}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/profile">Profile</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/signin">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container">
        <div className="py-10 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
            <div className="flex items-center gap-2">
              {isGeolocationAvailable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={isLocationMonitoringEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={toggleLocationMonitoring}
                        className="flex items-center gap-1"
                      >
                        <Badge variant={getLocationStatusColor()}>
                          {isLocationMonitoringEnabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                        </Badge>
                        <span className="hidden sm:inline-block">
                          {isLocationMonitoringEnabled ? "Monitoring" : "Monitor Location"}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getLocationStatusLabel()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <Button onClick={() => setIsAddTaskOpen(true)}>Add Task</Button>
              <AddTaskDialog open={isAddTaskOpen} setOpen={setIsAddTaskOpen} />
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="space-y-4">
              <ListView />
            </TabsContent>
            <TabsContent value="calendar" className="space-y-4">
              <CalendarView />
            </TabsContent>
            <TabsContent value="statistics" className="space-y-4">
              <StatisticsView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <PWARegister />
      <PWAInstallPrompt />
      <Toaster />
    </div>
  )
}

