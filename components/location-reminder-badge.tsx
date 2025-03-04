"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getSavedLocations } from "@/lib/location-service"
import { type Task } from "@/context/task-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LocationReminderBadgeProps {
  task: Task
}

export function LocationReminderBadge({ task }: LocationReminderBadgeProps) {
  const [locationName, setLocationName] = useState<string | null>(null)
  
  useEffect(() => {
    if (!task.locationReminder?.enabled) return
    
    // Find the location name from the saved locations
    const locations = getSavedLocations()
    const location = locations.find(loc => loc.id === task.locationReminder?.locationId)
    
    if (location) {
      setLocationName(location.name)
    }
  }, [task.locationReminder])
  
  if (!task.locationReminder?.enabled || !locationName) {
    return null
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="ml-2 px-2 py-0 h-5">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="text-xs">{locationName}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {task.locationReminder.notifyOnArrival && task.locationReminder.notifyOnDeparture
              ? `Notify on arrival and departure from ${locationName}`
              : task.locationReminder.notifyOnArrival
              ? `Notify on arrival at ${locationName}`
              : `Notify on departure from ${locationName}`}
          </p>
          {task.locationReminder.message && (
            <p className="text-xs text-muted-foreground mt-1">
              "{task.locationReminder.message}"
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 