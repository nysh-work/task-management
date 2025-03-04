"use client"

import { useState } from "react"
import { useTaskContext, type TaskTag } from "@/context/task-context"
import { TaskCard } from "@/components/task-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function ListView() {
  const { getTasksByTag } = useTaskContext()
  const [selectedTag, setSelectedTag] = useState<TaskTag | "All">("All")
  const [searchQuery, setSearchQuery] = useState("")

  const tasks = getTasksByTag(selectedTag).filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Select value={selectedTag} onValueChange={(value) => setSelectedTag(value as TaskTag | "All")}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tags</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Studies">Studies</SelectItem>
              <SelectItem value="Hobbies">Hobbies</SelectItem>
              <SelectItem value="Misc">Misc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full md:w-1/3">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  )
}

