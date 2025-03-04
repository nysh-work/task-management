"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode, useEffect } from "react"
import type { NamedLocation } from "@/lib/location-service"

export type TaskPriority = "low" | "medium" | "high"
export type TaskTag = "Work" | "Personal" | "Studies" | "Hobbies" | "Misc"

export interface Task {
  id: string
  title: string
  description: string
  dueDate: Date
  priority: TaskPriority
  tag: TaskTag
  completed: boolean
  createdAt: Date
  // New location-based fields
  locationReminder?: {
    locationId: string
    enabled: boolean
    notifyOnArrival: boolean
    notifyOnDeparture: boolean
    message?: string
  }
}

type TaskState = {
  tasks: Task[]
}

type TaskAction =
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; task: Task }
  | { type: "DELETE_TASK"; id: string }
  | { type: "TOGGLE_COMPLETE"; id: string }
  | { type: "LOAD_TASKS"; tasks: Task[] }

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Complete project proposal",
    description: "Finish the draft and send for review",
    dueDate: new Date(Date.now() + 86400000), // tomorrow
    priority: "high",
    tag: "Work",
    completed: false,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
  },
  {
    id: "2",
    title: "Grocery shopping",
    description: "Buy fruits, vegetables, and milk",
    dueDate: new Date(Date.now() + 172800000), // day after tomorrow
    priority: "medium",
    tag: "Personal",
    completed: false,
    createdAt: new Date(Date.now() - 86400000), // yesterday
  },
  {
    id: "3",
    title: "Study for exam",
    description: "Review chapters 5-8",
    dueDate: new Date(Date.now() + 432000000), // 5 days from now
    priority: "high",
    tag: "Studies",
    completed: false,
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
  },
  {
    id: "4",
    title: "Practice guitar",
    description: "Work on new song for 30 minutes",
    dueDate: new Date(Date.now() + 86400000), // tomorrow
    priority: "low",
    tag: "Hobbies",
    completed: true,
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
  },
  {
    id: "5",
    title: "Call insurance company",
    description: "Discuss policy renewal",
    dueDate: new Date(Date.now() + 259200000), // 3 days from now
    priority: "medium",
    tag: "Misc",
    completed: false,
    createdAt: new Date(Date.now() - 86400000), // yesterday
  },
]

const initialState: TaskState = {
  tasks: [],
}

// Helper function to serialize and deserialize dates
const serializeTasks = (tasks: Task[]): string => {
  return JSON.stringify(tasks)
}

const deserializeTasks = (tasksString: string): Task[] => {
  try {
    const parsedTasks = JSON.parse(tasksString)
    return parsedTasks.map((task: any) => ({
      ...task,
      dueDate: new Date(task.dueDate),
      createdAt: new Date(task.createdAt),
    }))
  } catch (error) {
    console.error("Error deserializing tasks:", error)
    return []
  }
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  let newState: TaskState

  switch (action.type) {
    case "LOAD_TASKS":
      newState = {
        ...state,
        tasks: action.tasks,
      }
      break
    case "ADD_TASK":
      newState = {
        ...state,
        tasks: [...state.tasks, action.task],
      }
      break
    case "UPDATE_TASK":
      newState = {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.task.id ? action.task : task)),
      }
      break
    case "DELETE_TASK":
      newState = {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      }
      break
    case "TOGGLE_COMPLETE":
      newState = {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.id ? { ...task, completed: !task.completed } : task)),
      }
      break
    default:
      return state
  }

  // Save to localStorage after state changes
  if (typeof window !== "undefined") {
    localStorage.setItem("tasks", serializeTasks(newState.tasks))
  }

  return newState
}

type TaskContextType = {
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
  getTasksByDate: (date: Date) => Task[]
  getTasksByTag: (tag: TaskTag | "All") => Task[]
  getOpenTasks: () => Task[]
  getCompletedTasksThisWeek: () => Task[]
  getCreatedTasksThisWeek: () => Task[]
  getTaskStatsByTag: () => Record<TaskTag, { completed: number; created: number }>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Load tasks from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("tasks")

      if (savedTasks) {
        const tasks = deserializeTasks(savedTasks)
        dispatch({ type: "LOAD_TASKS", tasks })
      } else {
        // If no saved tasks, use initial sample tasks
        dispatch({ type: "LOAD_TASKS", tasks: initialTasks })
        localStorage.setItem("tasks", serializeTasks(initialTasks))
      }
    }
  }, [])

  const getTasksByDate = (date: Date) => {
    return state.tasks.filter(
      (task) =>
        task.dueDate.getDate() === date.getDate() &&
        task.dueDate.getMonth() === date.getMonth() &&
        task.dueDate.getFullYear() === date.getFullYear(),
    )
  }

  const getTasksByTag = (tag: TaskTag | "All") => {
    if (tag === "All") return state.tasks
    return state.tasks.filter((task) => task.tag === tag)
  }

  const getOpenTasks = () => {
    return state.tasks.filter((task) => !task.completed)
  }

  const isThisWeek = (date: Date) => {
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()))
    return date >= startOfWeek && date <= endOfWeek
  }

  const getCompletedTasksThisWeek = () => {
    return state.tasks.filter((task) => task.completed && isThisWeek(task.dueDate))
  }

  const getCreatedTasksThisWeek = () => {
    return state.tasks.filter((task) => isThisWeek(task.createdAt))
  }

  const getTaskStatsByTag = () => {
    const tags: TaskTag[] = ["Work", "Personal", "Studies", "Hobbies", "Misc"]
    const stats: Record<TaskTag, { completed: number; created: number }> = {
      Work: { completed: 0, created: 0 },
      Personal: { completed: 0, created: 0 },
      Studies: { completed: 0, created: 0 },
      Hobbies: { completed: 0, created: 0 },
      Misc: { completed: 0, created: 0 },
    }

    const completedTasksThisWeek = getCompletedTasksThisWeek()
    const createdTasksThisWeek = getCreatedTasksThisWeek()

    tags.forEach((tag) => {
      stats[tag].completed = completedTasksThisWeek.filter((task) => task.tag === tag).length
      stats[tag].created = createdTasksThisWeek.filter((task) => task.tag === tag).length
    })

    return stats
  }

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        getTasksByDate,
        getTasksByTag,
        getOpenTasks,
        getCompletedTasksThisWeek,
        getCreatedTasksThisWeek,
        getTaskStatsByTag,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider")
  }
  return context
}

