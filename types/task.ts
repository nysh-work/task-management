// Type definition for location reminder associated with a task
export interface LocationReminder {
  locationId: string
  enabled: boolean
  notifyOnArrival: boolean
  notifyOnDeparture: boolean
  message?: string
}

// Main Task type used throughout the application
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  locationReminder?: LocationReminder
}

// Additional helper types related to tasks
export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskFormValues {
  title: string
  description: string
  dueDate?: Date
  priority: TaskPriority
  locationReminder?: LocationReminder
}

export interface TaskStats {
  completed: number
  pending: number
  overdue: number
  total: number
  completionRate: number
} 