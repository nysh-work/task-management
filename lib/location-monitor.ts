"use client"

import { 
  watchLocation,
  isNearLocation,
  getSavedLocations,
  type LocationCoordinates
} from "./location-service"
import { type Task } from "@/context/task-context"

// Check if code is running in browser environment
const isBrowser = typeof window !== 'undefined';

// Store the previous location state to detect entry/exit
const locationState: Record<string, boolean> = {}

// Store the watch location cleanup function
let stopWatching: (() => void) | null = null

// Check if the notification API is available
const isNotificationSupported = () => {
  return isBrowser && typeof Notification !== "undefined"
}

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn("Notifications are not supported in this browser")
    return false
  }
  
  if (Notification.permission === "granted") {
    return true
  }
  
  try {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return false
  }
}

// Show a notification
const showNotification = (title: string, options?: NotificationOptions) => {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return
  }
  
  try {
    // Use the Notification API
    new Notification(title, options)
  } catch (error) {
    console.error("Error showing notification:", error)
  }
}

// Check for location-based reminders
const checkLocationReminders = (
  location: LocationCoordinates,
  tasks: Task[]
) => {
  if (!isBrowser) return;
  
  // Get all saved locations
  const savedLocations = getSavedLocations()
  
  // Filter for tasks with location reminders
  const tasksWithLocationReminders = tasks.filter(
    task => !task.completed && task.locationReminder?.enabled
  )
  
  if (tasksWithLocationReminders.length === 0) {
    return
  }
  
  // Check each location
  savedLocations.forEach(savedLocation => {
    // Current state: is the user near this location?
    const isNear = isNearLocation(location, savedLocation)
    
    // Get previous state (default to opposite of current to trigger on first check)
    const wasNear = locationState[savedLocation.id] ?? !isNear
    
    // Store current state for next check
    locationState[savedLocation.id] = isNear
    
    // Find tasks associated with this location
    const relevantTasks = tasksWithLocationReminders.filter(
      task => task.locationReminder?.locationId === savedLocation.id
    )
    
    if (relevantTasks.length === 0) {
      return
    }
    
    // Handle arrival (entering the location)
    if (isNear && !wasNear) {
      const arrivalTasks = relevantTasks.filter(
        task => task.locationReminder?.notifyOnArrival
      )
      
      arrivalTasks.forEach(task => {
        const message = task.locationReminder?.message || `Reminder: ${task.title}`
        showNotification(`Arrived at ${savedLocation.name}`, {
          body: message,
          icon: "/icon-192x192.png",
          tag: `location-arrival-${task.id}`,
          data: { taskId: task.id, locationId: savedLocation.id }
        })
      })
    }
    
    // Handle departure (leaving the location)
    if (!isNear && wasNear) {
      const departureTasks = relevantTasks.filter(
        task => task.locationReminder?.notifyOnDeparture
      )
      
      departureTasks.forEach(task => {
        const message = task.locationReminder?.message || `Reminder: ${task.title}`
        showNotification(`Left ${savedLocation.name}`, {
          body: message,
          icon: "/icon-192x192.png",
          tag: `location-departure-${task.id}`,
          data: { taskId: task.id, locationId: savedLocation.id }
        })
      })
    }
  })
}

// Start monitoring location
export const startLocationMonitoring = (getTasks: () => Task[]) => {
  if (!isBrowser) return false;
  
  // Stop any existing monitoring
  stopLocationMonitoring()
  
  // Request notification permission
  requestNotificationPermission()
  
  // Start watching location
  stopWatching = watchLocation(
    (location) => {
      // Check for location-based reminders when location updates
      checkLocationReminders(location, getTasks())
    },
    (error) => {
      console.error("Location monitoring error:", error)
    }
  )
  
  return true
}

// Stop monitoring location
export const stopLocationMonitoring = () => {
  if (!isBrowser || !stopWatching) return;
  
  stopWatching()
  stopWatching = null
}

// Check if location monitoring is active
export const isLocationMonitoringActive = (): boolean => {
  if (!isBrowser) return false;
  return stopWatching !== null
} 