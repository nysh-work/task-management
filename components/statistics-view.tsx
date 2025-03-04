"use client"

import { useTaskContext, type TaskTag } from "@/context/task-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function StatisticsView() {
  const { getTaskStatsByTag, getCompletedTasksThisWeek, getCreatedTasksThisWeek } = useTaskContext()

  const stats = getTaskStatsByTag()
  const completedTasksThisWeek = getCompletedTasksThisWeek()
  const createdTasksThisWeek = getCreatedTasksThisWeek()

  const tags: TaskTag[] = ["Work", "Personal", "Studies", "Hobbies", "Misc"]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Statistics</CardTitle>
          <CardDescription>Task completion and creation statistics for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="completed">
            <TabsList className="mb-4">
              <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
              <TabsTrigger value="created">Created Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="completed">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Completed Tasks This Week: {completedTasksThisWeek.length}</h3>
                  <p className="text-sm text-muted-foreground">Breakdown by tag</p>
                </div>
                <div className="grid gap-4 md:grid-cols-5">
                  {tags.map((tag) => (
                    <Card key={tag}>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">{tag}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats[tag].completed}</div>
                        <p className="text-xs text-muted-foreground">completed tasks</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="relative h-[200px] w-full">
                  <div className="absolute inset-0 flex items-end justify-around">
                    {tags.map((tag) => {
                      const percentage = completedTasksThisWeek.length
                        ? (stats[tag].completed / completedTasksThisWeek.length) * 100
                        : 0
                      return (
                        <div key={tag} className="flex flex-col items-center">
                          <div
                            className="w-16 bg-primary transition-all duration-500 ease-in-out"
                            style={{
                              height: `${Math.max(percentage, 5)}%`,
                              opacity: percentage > 0 ? 1 : 0.3,
                            }}
                          />
                          <div className="mt-2 text-xs">{tag}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="created">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Created Tasks This Week: {createdTasksThisWeek.length}</h3>
                  <p className="text-sm text-muted-foreground">Breakdown by tag</p>
                </div>
                <div className="grid gap-4 md:grid-cols-5">
                  {tags.map((tag) => (
                    <Card key={tag}>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">{tag}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats[tag].created}</div>
                        <p className="text-xs text-muted-foreground">created tasks</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="relative h-[200px] w-full">
                  <div className="absolute inset-0 flex items-end justify-around">
                    {tags.map((tag) => {
                      const percentage = createdTasksThisWeek.length
                        ? (stats[tag].created / createdTasksThisWeek.length) * 100
                        : 0
                      return (
                        <div key={tag} className="flex flex-col items-center">
                          <div
                            className="w-16 bg-primary transition-all duration-500 ease-in-out"
                            style={{
                              height: `${Math.max(percentage, 5)}%`,
                              opacity: percentage > 0 ? 1 : 0.3,
                            }}
                          />
                          <div className="mt-2 text-xs">{tag}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

