"use client"

import { useState } from "react"
import { format } from "date-fns"
import { type Task, useTaskContext } from "@/context/task-context"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { Trash, Edit } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LocationReminderBadge } from "@/components/location-reminder-badge"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { dispatch } = useTaskContext()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleToggleComplete = () => {
    dispatch({ type: "TOGGLE_COMPLETE", id: task.id })
  }

  const handleDelete = () => {
    dispatch({ type: "DELETE_TASK", id: task.id })
    setDeleteDialogOpen(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
      case "medium":
        return "text-yellow-500 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400"
      case "low":
        return "text-green-500 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
      default:
        return ""
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Work":
        return "text-blue-500 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400"
      case "Personal":
        return "text-purple-500 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-400"
      case "Studies":
        return "text-indigo-500 border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
      case "Hobbies":
        return "text-pink-500 border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/50 dark:text-pink-400"
      case "Misc":
        return "text-gray-500 border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400"
      default:
        return ""
    }
  }

  const isOverdue = () => {
    if (task.completed) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  return (
    <>
      <Card className={task.completed ? "opacity-60" : ""}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Checkbox checked={task.completed} onCheckedChange={handleToggleComplete} />
              <div>
                <h3
                  className={`font-medium text-base ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className={`text-sm text-muted-foreground mt-1 ${
                      task.completed ? "line-through" : ""
                    }`}
                  >
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 py-2">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
            <Badge className={getTagColor(task.tag)}>
              {task.tag}
            </Badge>
            <LocationReminderBadge task={task} />
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className={isOverdue() ? "text-destructive font-medium" : ""}>
              {format(new Date(task.dueDate), "MMM d, yyyy")}
              {isOverdue() && " (Overdue)"}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <span>Created {format(new Date(task.createdAt), "MMM d, yyyy")}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTaskDialog task={task} open={editDialogOpen} setOpen={setEditDialogOpen} />
    </>
  )
}

