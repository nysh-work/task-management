"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { useTaskContext } from "@/context/task-context"
import { TaskCard } from "@/components/task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimpleTaskCalendar } from "@/components/simple-task-calendar"
import { ListFilter, Grid } from "lucide-react"

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { getTasksByDate } = useTaskContext()
  const [viewType, setViewType] = useState<"single-day" | "month">("single-day")

  const tasksForSelectedDate = date ? getTasksByDate(date) : []

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Tabs value={viewType} onValueChange={(value: string) => setViewType(value as "single-day" | "month")}>
          <TabsList className="grid grid-cols-2 w-[200px]">
            <TabsTrigger value="single-day">
              <ListFilter className="h-4 w-4 mr-2" />
              Day View
            </TabsTrigger>
            <TabsTrigger value="month">
              <Grid className="h-4 w-4 mr-2" />
              Month View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewType === "single-day" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {date
                  ? date.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksForSelectedDate.length > 0 ? (
                  tasksForSelectedDate.map((task) => <TaskCard key={task.id} task={task} />)
                ) : (
                  <p className="text-muted-foreground">No tasks for this date</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <SimpleTaskCalendar />
      )}
    </div>
  )
}

