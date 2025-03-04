"use client"

import { useState, useEffect } from 'react'
import { useTaskContext, Task } from '@/context/task-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

interface DayProps {
  date: Date
  isCurrentMonth: boolean
  tasks: Task[]
  onClick: (date: Date, tasks: Task[]) => void
}

const DayCell = ({ date, isCurrentMonth, tasks, onClick }: DayProps) => {
  const hasTask = tasks.length > 0
  const isToday = new Date().toDateString() === date.toDateString()
  
  return (
    <div 
      className={`border p-1 h-32 overflow-hidden ${
        isCurrentMonth ? 'bg-background' : 'bg-muted/30'
      } ${isToday ? 'border-primary' : ''}`}
      onClick={() => onClick(date, tasks)}
    >
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${isCurrentMonth ? '' : 'text-muted-foreground'}`}>
          {date.getDate()}
        </span>
        {hasTask && (
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        )}
      </div>
      <div className="mt-1 max-h-24 overflow-hidden">
        {tasks.slice(0, 3).map(task => (
          <div 
            key={task.id} 
            className={`text-xs truncate rounded px-1 py-0.5 mb-0.5 ${
              task.priority === 'high' 
                ? 'bg-red-500/10 text-red-700 dark:text-red-400' 
                : task.priority === 'medium' 
                  ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400' 
                  : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
            } ${task.completed ? 'line-through opacity-50' : ''}`}
          >
            {task.title}
          </div>
        ))}
        {tasks.length > 3 && (
          <div className="text-xs text-muted-foreground">
            +{tasks.length - 3} more
          </div>
        )}
      </div>
    </div>
  )
}

export function TaskCalendar() {
  const { state } = useTaskContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Get days in current month view (including days from prev/next month to fill the grid)
  const getDaysInMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of month
    const firstDay = new Date(year, month, 1)
    // Day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Create array of dates for the view
    const days: Date[] = []
    
    // Add days from previous month to fill the first row
    const daysFromPrevMonth = firstDayOfWeek
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    // Add days from next month to fill remaining cells (6 rows * 7 days = 42 cells total)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    return days
  }
  
  // Get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    if (!state?.tasks) return []
    
    return state.tasks.filter((task: Task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      )
    })
  }
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  
  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  // Handle day click
  const handleDayClick = (date: Date, tasks: Task[]) => {
    setSelectedDate(date)
    setSelectedTasks(tasks)
    setIsDialogOpen(true)
  }
  
  // Format date: Month Year (e.g., "March 2023")
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  
  // Week days header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Get days for the current month view
  const days = getDaysInMonthView()
  
  return (
    <Card className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{formatMonthYear(currentDate)}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map(day => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <DayCell 
            key={index}
            date={day}
            isCurrentMonth={day.getMonth() === currentDate.getMonth()}
            tasks={getTasksForDate(day)}
            onClick={handleDayClick}
          />
        ))}
      </div>
      
      {/* Task details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </DialogTitle>
            <DialogDescription>
              {selectedTasks.length === 0 
                ? "No tasks scheduled for this day" 
                : `${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''} scheduled`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4 max-h-[60vh] overflow-auto">
            {selectedTasks.map(task => (
              <div key={task.id} className="border rounded-lg p-3">
                <div className="flex justify-between">
                  <h3 className={`font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                    {task.title}
                  </h3>
                  {task.priority && (
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' : 
                      task.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {task.priority}
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
                {task.locationReminder?.enabled && (
                  <div className="mt-2 text-xs flex items-center">
                    <Badge variant="outline" className="mr-2">Location Reminder</Badge>
                    {task.locationReminder.message}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 