"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTaskContext, type Task, type TaskPriority, type TaskTag } from "@/context/task-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { LocationReminderFields, type LocationReminderData } from "@/components/location-reminder-fields"

interface EditTaskDialogProps {
  task: Task
  open: boolean
  setOpen: (open: boolean) => void
}

export function EditTaskDialog({ task, open, setOpen }: EditTaskDialogProps) {
  const { dispatch } = useTaskContext()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [dueDate, setDueDate] = useState<Date>(task.dueDate)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [tag, setTag] = useState<TaskTag>(task.tag)
  const [locationReminder, setLocationReminder] = useState<LocationReminderData | undefined>(
    task.locationReminder || undefined
  )

  useEffect(() => {
    if (open) {
      setTitle(task.title)
      setDescription(task.description)
      setDueDate(task.dueDate)
      setPriority(task.priority)
      setTag(task.tag)
      setLocationReminder(task.locationReminder || undefined)
    }
  }, [open, task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const updatedTask = {
      ...task,
      title,
      description,
      dueDate,
      priority,
      tag,
      locationReminder: locationReminder?.enabled ? locationReminder : undefined,
    }

    dispatch({ type: "UPDATE_TASK", task: updatedTask })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to the task details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tag">Tag</Label>
                <Select value={tag} onValueChange={(value) => setTag(value as TaskTag)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Studies">Studies</SelectItem>
                    <SelectItem value="Hobbies">Hobbies</SelectItem>
                    <SelectItem value="Misc">Misc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Location Reminder Fields */}
            <div className="border-t pt-4 mt-2">
              <LocationReminderFields 
                value={locationReminder}
                onChange={setLocationReminder}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

