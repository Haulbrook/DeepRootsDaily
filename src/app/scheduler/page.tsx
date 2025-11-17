'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Users, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ScheduleItem {
  id: string
  crew: string
  location: string
  task: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'in-progress' | 'completed'
}

export default function SchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const crews = [
    { id: 'crew-a', name: 'Crew A', members: 5, lead: 'Mike Johnson' },
    { id: 'crew-b', name: 'Crew B', members: 4, lead: 'Sarah Williams' },
    { id: 'crew-c', name: 'Crew C', members: 6, lead: 'David Martinez' },
  ]

  const scheduleItems: ScheduleItem[] = [
    {
      id: '1',
      crew: 'Crew A',
      location: '123 Main St, Springfield',
      task: 'Hedge trimming and cleanup',
      startTime: '08:00',
      endTime: '12:00',
      status: 'completed'
    },
    {
      id: '2',
      crew: 'Crew A',
      location: '456 Oak Ave, Springfield',
      task: 'Lawn maintenance',
      startTime: '13:00',
      endTime: '16:00',
      status: 'in-progress'
    },
    {
      id: '3',
      crew: 'Crew B',
      location: '789 Pine Rd, Springfield',
      task: 'Tree planting',
      startTime: '09:00',
      endTime: '15:00',
      status: 'scheduled'
    },
  ]

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  function isToday(day: number) {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  function isSelected(day: number) {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'scheduled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crew Scheduler</h1>
          <p className="text-muted-foreground">
            Manage crew assignments and job schedules
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crews.length}</div>
            <p className="text-xs text-muted-foreground">
              {crews.reduce((acc, crew) => acc + crew.members, 0)} total members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 completed, 5 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Scheduled jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Crew capacity used</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{monthName}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`
                      aspect-square p-2 text-sm rounded-md hover:bg-accent transition-colors
                      ${isToday(day) ? 'bg-primary text-primary-foreground font-bold' : ''}
                      ${isSelected(day) && !isToday(day) ? 'bg-accent' : ''}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Crew List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Crews</CardTitle>
            <CardDescription>Available crew teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {crews.map((crew) => (
                <div key={crew.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{crew.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {crew.members} members
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Lead: {crew.lead}</p>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    View Schedule
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule for {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
          </CardTitle>
          <CardDescription>
            Planned jobs and crew assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduleItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{item.task}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {item.location}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{item.crew}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{item.startTime} - {item.endTime}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="outline">Reschedule</Button>
                  {item.status === 'scheduled' && (
                    <Button size="sm" variant="outline">Start Job</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
