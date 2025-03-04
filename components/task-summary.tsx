"use client"

import { useTaskContext, type TaskTag } from "@/context/task-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TaskSummary() {
  const { getOpenTasks } = useTaskContext()
  const openTasks = getOpenTasks()

  // Count tasks by tag
  const tasksByTag: Record<TaskTag, number> = {
    Work: 0,
    Personal: 0,
    Studies: 0,
    Hobbies: 0,
    Misc: 0,
  }

  openTasks.forEach((task) => {
    tasksByTag[task.tag]++
  })

  // Count tasks by priority
  const highPriorityCount = openTasks.filter((task) => task.priority === "high").length
  const mediumPriorityCount = openTasks.filter((task) => task.priority === "medium").length
  const lowPriorityCount = openTasks.filter((task) => task.priority === "low").length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Summary</CardTitle>
        <CardDescription>You have {openTasks.length} open tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-medium">By Tag</h3>
            <ul className="space-y-1">
              {Object.entries(tasksByTag).map(([tag, count]) => (
                <li key={tag} className="flex justify-between">
                  <span>{tag}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-medium">By Priority</h3>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>High</span>
                <span className="font-medium">{highPriorityCount}</span>
              </li>
              <li className="flex justify-between">
                <span>Medium</span>
                <span className="font-medium">{mediumPriorityCount}</span>
              </li>
              <li className="flex justify-between">
                <span>Low</span>
                <span className="font-medium">{lowPriorityCount}</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

