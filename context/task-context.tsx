"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { useToast } from "@/components/ui/use-toast"
import { TaskWithLocations } from "@/lib/db-utils"

export type TaskPriority = "low" | "medium" | "high"
export type TaskTag = "Work" | "Personal" | "Studies" | "Hobbies" | "Misc"

// Extend the TaskWithLocations type with UI-specific properties
export interface Task extends Omit<TaskWithLocations, 'dueDate' | 'priority'> {
  dueDate: Date | null
  priority: TaskPriority
  tag: TaskTag
}

type TaskState = {
  tasks: Task[]
  loading: boolean
  error: string | null
}

type TaskAction =
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; error: string }
  | { type: "LOAD_TASKS"; tasks: Task[] }
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; task: Task }
  | { type: "DELETE_TASK"; id: string }
  | { type: "TOGGLE_COMPLETE"; id: string }

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: true, error: null }
    case "SET_ERROR":
      return { ...state, loading: false, error: action.error }
    case "LOAD_TASKS":
      return { ...state, tasks: action.tasks, loading: false, error: null }
    case "ADD_TASK":
      return { ...state, tasks: [action.task, ...state.tasks] }
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.task.id ? action.task : task
        ),
      }
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      }
    case "TOGGLE_COMPLETE":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? { ...task, isCompleted: !task.isCompleted }
            : task
        ),
      }
    default:
      return state
  }
}

// Convert database task to UI task
function mapDatabaseTaskToUITask(dbTask: TaskWithLocations): Task {
  return {
    ...dbTask,
    dueDate: dbTask.dueDate ? new Date(dbTask.dueDate) : null,
    priority: (dbTask.priority || 'medium') as TaskPriority,
    tag: 'Work' as TaskTag // Default tag since it's not in the database
  }
}

interface TaskContextProps {
  state: TaskState
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateTask: (task: Task) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  refreshTasks: () => Promise<void>
}

// Default task context value for prerendering
const defaultTaskContext: TaskContextProps = {
  state: initialState,
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  toggleComplete: async () => {},
  refreshTasks: async () => {},
}

const TaskContext = createContext<TaskContextProps>(defaultTaskContext)

export function TaskProvider({ children }: { children: ReactNode }) {
  // During prerendering, just render children with default context
  if (typeof window === 'undefined' && 
      (process.env.VERCEL || process.env.NEXT_PHASE === 'phase-production-build')) {
    console.log("Using default task context during prerendering");
    return <TaskContext.Provider value={defaultTaskContext}>{children}</TaskContext.Provider>;
  }

  const [state, dispatch] = useReducer(taskReducer, initialState)
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Skip fetch operations during prerendering to avoid errors
  const isPrerendering = typeof window === 'undefined' && 
    (process.env.VERCEL || process.env.NEXT_PHASE === 'phase-production-build');

  // Fetch tasks from the API
  async function fetchTasks() {
    // Skip during prerendering
    if (isPrerendering || !user) return;
    
    dispatch({ type: "SET_LOADING" })
    
    try {
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      
      const data: TaskWithLocations[] = await response.json()
      const uiTasks = data.map(mapDatabaseTaskToUITask)
      
      dispatch({ type: "LOAD_TASKS", tasks: uiTasks })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      dispatch({ type: "SET_ERROR", error: 'Failed to load tasks' })
      
      toast({
        title: "Error",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch tasks on initial load and when user changes
  useEffect(() => {
    // Skip during prerendering
    if (isPrerendering) return;
    
    if (user) {
      fetchTasks()
    }
  }, [user])

  // Add a new task
  async function addTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) {
    // Skip during prerendering
    if (isPrerendering || !user) return;
    
    try {
      // Format the task data for the API
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description || "",
        dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : null,
        priority: taskData.priority,
        // Handle locations if present
        locations: taskData.locations?.map((loc: {
          name: string;
          latitude: number;
          longitude: number;
          radius?: number;
          notifyOnArrival?: boolean;
          notifyOnDeparture?: boolean;
          reminderMessage?: string;
        }) => ({
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: loc.radius,
          notifyOnArrival: loc.notifyOnArrival,
          notifyOnDeparture: loc.notifyOnDeparture,
          reminderMessage: loc.reminderMessage
        }))
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiTaskData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create task')
      }
      
      const createdTask = await response.json()
      dispatch({ type: "ADD_TASK", task: mapDatabaseTaskToUITask(createdTask) })
      
      toast({
        title: "Success",
        description: "Task created successfully",
      })
    } catch (error) {
      console.error('Error creating task:', error)
      
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update a task
  async function updateTask(task: Task) {
    // Skip during prerendering
    if (isPrerendering || !user) return;
    
    try {
      // Format the task data for the API
      const apiTaskData = {
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        priority: task.priority,
        isCompleted: task.isCompleted
      }
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiTaskData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update task')
      }
      
      const updatedTask = await response.json()
      dispatch({ type: "UPDATE_TASK", task: mapDatabaseTaskToUITask(updatedTask) })
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error('Error updating task:', error)
      
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete a task
  async function deleteTask(id: string) {
    // Skip during prerendering
    if (isPrerendering || !user) return;
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete task')
      }
      
      dispatch({ type: "DELETE_TASK", id })
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle task completion status
  async function toggleComplete(id: string) {
    // Skip during prerendering
    if (isPrerendering || !user) return;
    
    const task = state.tasks.find(t => t.id === id)
    if (!task) return
    
    try {
      const apiTaskData = {
        isCompleted: !task.isCompleted
      }
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiTaskData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update task completion status')
      }
      
      dispatch({ type: "TOGGLE_COMPLETE", id })
    } catch (error) {
      console.error('Error toggling task completion:', error)
      
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to manually refresh tasks
  async function refreshTasks() {
    // Skip during prerendering
    if (isPrerendering) return;
    
    await fetchTasks()
  }

  return (
    <TaskContext.Provider
      value={{
        state,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        refreshTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  return context
}

