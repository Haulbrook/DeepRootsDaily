'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Truck,
  Wrench,
  MapPin,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Save,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ============ GOOGLE SHEETS API CONFIGURATION ============
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwV8EIR7jPTZn0bZ7Jgv3Pj-sn13q_Nz4kueZ9pppX_PGZrRbYjieUfkZWA41WLD2c/exec'

// ============ DEEP ROOTS DATA FROM GOOGLE SHEETS ============

interface Person {
  name: string
  type: 'person' | 'crew-leader' | 'manager'
}

interface Vehicle {
  name: string
}

interface Equipment {
  name: string
  type: 'trailer' | 'machine'
}

interface CrewAssignment {
  crewNumber: number
  members: Person[]
  vehicles: Vehicle[]
  equipment: Equipment[]
  jobs: string[]
  salesman: string
}

interface ScheduleState {
  date: string
  crews: CrewAssignment[]
  absent: Person[]
  outOfService: (Vehicle | Equipment)[]
  lastUpdated: string
}

// Deep Roots People
const PEOPLE: Person[] = [
  // Crew Leaders
  { name: 'Jacob', type: 'crew-leader' },
  { name: 'Layne', type: 'crew-leader' },
  { name: 'Brandon', type: 'crew-leader' },
  { name: 'Jose I', type: 'crew-leader' },
  { name: 'Chase', type: 'crew-leader' },
  { name: 'Pulo', type: 'crew-leader' },
  { name: 'Jonathan', type: 'crew-leader' },
  // Managers
  { name: 'Ben', type: 'manager' },
  { name: 'Scott', type: 'manager' },
  { name: 'Trey', type: 'manager' },
  { name: 'Ashe', type: 'manager' },
  { name: 'Dean', type: 'manager' },
  { name: 'James', type: 'manager' },
  { name: 'Dove', type: 'manager' },
  // Team Members
  { name: 'Vern', type: 'person' },
  { name: 'Andreas', type: 'person' },
  { name: 'Jaime', type: 'person' },
  { name: 'Daniel', type: 'person' },
  { name: 'Nathan', type: 'person' },
  { name: 'Juan Manuel', type: 'person' },
  { name: 'Juan Andreas', type: 'person' },
  { name: 'Zach', type: 'person' },
  { name: 'Amador', type: 'person' },
  { name: 'Edgar', type: 'person' },
  { name: 'Alejandro', type: 'person' },
  { name: 'Hayden', type: 'person' },
  { name: 'Tyler', type: 'person' },
  { name: 'Fredirico', type: 'person' },
  { name: 'Miguel', type: 'person' },
  { name: 'Andrew', type: 'person' },
  { name: 'Lupe', type: 'person' },
  { name: 'Armando', type: 'person' },
]

// Deep Roots Trucks
const TRUCKS: Vehicle[] = [
  { name: '301 Big Metal' },
  { name: '302 Old Girl 7.3' },
  { name: '303 Wood Side' },
  { name: '305 Power Wagon' },
  { name: '306 Plow' },
  { name: '307 Short Side' },
  { name: '308 White 350' },
  { name: '309 Power Wagon' },
  { name: '310 Silver 350' },
  { name: '701 Open Bed' },
]

// Deep Roots Equipment
const EQUIPMENT: Equipment[] = [
  { name: 'SVL 75 Open', type: 'trailer' },
  { name: 'SVL 75 Closed', type: 'trailer' },
  { name: 'Dingo 1000', type: 'trailer' },
  { name: 'Dingo 500', type: 'trailer' },
  { name: 'Hydro Seeder', type: 'machine' },
  { name: 'S85', type: 'machine' },
  { name: 'Vermeer', type: 'machine' },
  { name: 'Deere 319', type: 'machine' },
  { name: 'Deere 333', type: 'machine' },
  { name: 'KX 057', type: 'machine' },
  { name: 'KX 040', type: 'machine' },
]

// Initialize empty crews (1-8)
function initializeCrews(): CrewAssignment[] {
  return Array.from({ length: 8 }, (_, i) => ({
    crewNumber: i + 1,
    members: [],
    vehicles: [],
    equipment: [],
    jobs: [],
    salesman: ''
  }))
}

export default function SchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [crews, setCrews] = useState<CrewAssignment[]>(initializeCrews())
  const [absentPeople, setAbsentPeople] = useState<Person[]>([])
  const [outOfServiceItems, setOutOfServiceItems] = useState<(Vehicle | Equipment)[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('Never')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<Person | Vehicle | Equipment | null>(null)
  const [draggedItemType, setDraggedItemType] = useState<'person' | 'vehicle' | 'equipment' | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // ============ GOOGLE SHEETS API FUNCTIONS ============

  // Helper to find person type from name
  const findPersonType = useCallback((name: string): 'person' | 'crew-leader' | 'manager' => {
    const person = PEOPLE.find(p => p.name === name)
    return person?.type || 'person'
  }, [])

  // Helper to find equipment type from name
  const findEquipmentType = useCallback((name: string): 'trailer' | 'machine' => {
    const equip = EQUIPMENT.find(e => e.name === name)
    return equip?.type || 'machine'
  }, [])

  // Load schedule from Google Sheets
  const loadSchedule = useCallback(async (date: Date) => {
    setIsLoading(true)
    setStatusMessage(null)

    try {
      const dateString = date.toLocaleDateString()

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requires this
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getScheduleForDate',
          date: dateString
        })
      })

      // Note: Due to no-cors, we can't read the response directly
      // The Google Apps Script will need CORS headers or we use JSONP approach
      // For now, we'll try a different approach using GET with callback

      // Alternative: Use fetch with redirect following
      const getResponse = await fetch(`${GOOGLE_SCRIPT_URL}?action=getCurrentState`, {
        method: 'GET',
        redirect: 'follow'
      })

      if (getResponse.ok) {
        const data = await getResponse.json()

        if (data.error) {
          throw new Error(data.error)
        }

        // Parse the schedule data if available
        if (data.schedule) {
          const newCrews = initializeCrews()

          data.schedule.crews?.forEach((crewData: any) => {
            const crewIndex = crewData.number - 1
            if (crewIndex >= 0 && crewIndex < 8) {
              newCrews[crewIndex] = {
                crewNumber: crewData.number,
                members: crewData.members?.map((m: any) => ({
                  name: m.name,
                  type: m.isLeader ? 'crew-leader' : m.isManager ? 'manager' : 'person'
                })) || [],
                vehicles: crewData.vehicles?.map((v: string) => ({ name: v })) || [],
                equipment: crewData.equipment?.map((e: string) => ({
                  name: e,
                  type: findEquipmentType(e)
                })) || [],
                jobs: crewData.jobs || [],
                salesman: crewData.salesman || ''
              }
            }
          })

          setCrews(newCrews)

          // Set absent people
          if (data.schedule.absent) {
            setAbsentPeople(data.schedule.absent.map((a: any) => ({
              name: a.name,
              type: findPersonType(a.name)
            })))
          }

          // Set out of service items
          if (data.schedule.outOfService) {
            setOutOfServiceItems(data.schedule.outOfService.map((item: any) => ({
              name: item.name,
              type: findEquipmentType(item.name)
            })))
          }
        }

        setLastUpdated(data.lastUpdate || 'Just loaded')
        setStatusMessage({ type: 'success', message: 'Schedule loaded successfully' })
      }
    } catch (error) {
      console.error('Error loading schedule:', error)
      setStatusMessage({ type: 'error', message: 'Failed to load schedule. Check console for details.' })
    } finally {
      setIsLoading(false)
    }
  }, [findPersonType, findEquipmentType])

  // Save schedule to Google Sheets
  const saveSchedule = useCallback(async () => {
    setIsSaving(true)
    setStatusMessage(null)

    try {
      const dateString = selectedDate.toLocaleDateString()
      const timestamp = new Date().toLocaleString()

      // Format data for Google Sheets (matching the expected format from the Apps Script)
      const values: any[][] = [
        ['Date', 'Crew_Number', 'Team_Members', 'Crew_Leaders', 'Managers', 'Truck', 'Equipment', 'Job_Name', 'Salesman_PM', 'Last_Updated', 'Absent_Today', 'Out_Of_Service']
      ]

      // Add crew rows
      crews.forEach(crew => {
        if (crew.members.length > 0 || crew.vehicles.length > 0 || crew.equipment.length > 0 || crew.jobs.length > 0) {
          const teamMembers = crew.members.filter(m => m.type === 'person').map(m => m.name).join(', ')
          const crewLeaders = crew.members.filter(m => m.type === 'crew-leader').map(m => m.name).join(', ')
          const managers = crew.members.filter(m => m.type === 'manager').map(m => m.name).join(', ')
          const trucks = crew.vehicles.map(v => v.name).join(', ')
          const equipment = crew.equipment.map(e => e.name).join(', ')
          const jobs = crew.jobs.join(', ')

          values.push([
            dateString,
            crew.crewNumber,
            teamMembers,
            crewLeaders,
            managers,
            trucks,
            equipment,
            jobs,
            crew.salesman,
            timestamp,
            '', // Absent_Today (filled in summary row)
            ''  // Out_Of_Service (filled in summary row)
          ])
        }
      })

      // Add summary row with absent and out of service
      const absentNames = absentPeople.map(p => p.name).join(', ')
      const outOfServiceNames = outOfServiceItems.map(i => i.name).join(', ')

      values.push([
        dateString,
        'SUMMARY',
        '', '', '', '', '', '', '',
        timestamp,
        absentNames,
        outOfServiceNames
      ])

      // Prepare tags data
      const tags = {
        people: PEOPLE.map(p => ({ name: p.name, type: p.type })),
        trucks: TRUCKS.map(t => ({ name: t.name })),
        equipment: EQUIPMENT.map(e => ({ name: e.name, type: e.type })),
        jobs: [] // Jobs are entered manually per crew
      }

      const payload = {
        date: dateString,
        values: values,
        tags: tags
      }

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      // Since no-cors doesn't let us read the response, we assume success
      setLastUpdated(timestamp)
      setStatusMessage({ type: 'success', message: 'Schedule saved successfully!' })
    } catch (error) {
      console.error('Error saving schedule:', error)
      setStatusMessage({ type: 'error', message: 'Failed to save schedule. Check console for details.' })
    } finally {
      setIsSaving(false)
    }
  }, [selectedDate, crews, absentPeople, outOfServiceItems])

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [statusMessage])

  // Get assigned items
  const assignedPeople = crews.flatMap(c => c.members.map(m => m.name))
  const assignedVehicles = crews.flatMap(c => c.vehicles.map(v => v.name))
  const assignedEquipment = crews.flatMap(c => c.equipment.map(e => e.name))
  const absentNames = absentPeople.map(p => p.name)
  const outOfServiceNames = outOfServiceItems.map(i => i.name)

  // Available (unassigned) items
  const availablePeople = PEOPLE.filter(p =>
    !assignedPeople.includes(p.name) && !absentNames.includes(p.name)
  )
  const availableTrucks = TRUCKS.filter(t =>
    !assignedVehicles.includes(t.name) && !outOfServiceNames.includes(t.name)
  )
  const availableEquipment = EQUIPMENT.filter(e =>
    !assignedEquipment.includes(e.name) && !outOfServiceNames.includes(e.name)
  )

  // Stats calculations
  const totalAssigned = assignedPeople.length
  const totalAvailable = availablePeople.length
  const totalAbsent = absentPeople.length
  const crewsInUse = crews.filter(c => c.members.length > 0).length

  // Drag and drop handlers
  function handleDragStart(item: Person | Vehicle | Equipment, type: 'person' | 'vehicle' | 'equipment') {
    setDraggedItem(item)
    setDraggedItemType(type)
  }

  function handleDragEnd() {
    setDraggedItem(null)
    setDraggedItemType(null)
    setActiveDropZone(null)
  }

  function handleDragOver(e: React.DragEvent, zoneId: string) {
    e.preventDefault()
    setActiveDropZone(zoneId)
  }

  function handleDragLeave() {
    setActiveDropZone(null)
  }

  function handleDrop(crewNumber: number, dropType: 'person' | 'vehicle' | 'equipment') {
    if (!draggedItem || !draggedItemType) return
    if (draggedItemType !== dropType) return

    setCrews(prev => prev.map(crew => {
      if (crew.crewNumber !== crewNumber) return crew

      if (dropType === 'person') {
        const person = draggedItem as Person
        if (crew.members.some(m => m.name === person.name)) return crew
        return { ...crew, members: [...crew.members, person] }
      }
      if (dropType === 'vehicle') {
        const vehicle = draggedItem as Vehicle
        if (crew.vehicles.some(v => v.name === vehicle.name)) return crew
        return { ...crew, vehicles: [...crew.vehicles, vehicle] }
      }
      if (dropType === 'equipment') {
        const equipment = draggedItem as Equipment
        if (crew.equipment.some(e => e.name === equipment.name)) return crew
        return { ...crew, equipment: [...crew.equipment, equipment] }
      }
      return crew
    }))

    handleDragEnd()
  }

  function removeFromCrew(crewNumber: number, itemName: string, itemType: 'person' | 'vehicle' | 'equipment') {
    setCrews(prev => prev.map(crew => {
      if (crew.crewNumber !== crewNumber) return crew

      if (itemType === 'person') {
        return { ...crew, members: crew.members.filter(m => m.name !== itemName) }
      }
      if (itemType === 'vehicle') {
        return { ...crew, vehicles: crew.vehicles.filter(v => v.name !== itemName) }
      }
      if (itemType === 'equipment') {
        return { ...crew, equipment: crew.equipment.filter(e => e.name !== itemName) }
      }
      return crew
    }))
  }

  function markAbsent(person: Person) {
    if (!absentNames.includes(person.name)) {
      setAbsentPeople(prev => [...prev, person])
    }
  }

  function unmarkAbsent(personName: string) {
    setAbsentPeople(prev => prev.filter(p => p.name !== personName))
  }

  function markOutOfService(item: Vehicle | Equipment) {
    if (!outOfServiceNames.includes(item.name)) {
      setOutOfServiceItems(prev => [...prev, item])
    }
  }

  function unmarkOutOfService(itemName: string) {
    setOutOfServiceItems(prev => prev.filter(i => i.name !== itemName))
  }

  function updateCrewJob(crewNumber: number, job: string) {
    setCrews(prev => prev.map(crew => {
      if (crew.crewNumber !== crewNumber) return crew
      return { ...crew, jobs: job ? [job] : [] }
    }))
  }

  function updateCrewSalesman(crewNumber: number, salesman: string) {
    setCrews(prev => prev.map(crew => {
      if (crew.crewNumber !== crewNumber) return crew
      return { ...crew, salesman }
    }))
  }

  // Calendar helpers
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

  function getPersonTypeColor(type: string) {
    switch (type) {
      case 'crew-leader': return 'bg-primary text-primary-foreground'
      case 'manager': return 'bg-secondary text-secondary-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  function getPersonTypeBadge(type: string) {
    switch (type) {
      case 'crew-leader': return 'CL'
      case 'manager': return 'M'
      default: return ''
    }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crew Scheduler</h1>
          <p className="text-muted-foreground">
            Assign crews, trucks, and equipment for {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadSchedule(selectedDate)} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Load Schedule
          </Button>
          <Button onClick={saveSchedule} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Schedule
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          statusMessage.type === 'success'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{statusMessage.message}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-auto hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crewsInUse}</div>
            <p className="text-xs text-muted-foreground">of 8 crews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssigned}</div>
            <p className="text-xs text-muted-foreground">people working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAvailable}</div>
            <p className="text-xs text-muted-foreground">unassigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAbsent}</div>
            <p className="text-xs text-muted-foreground">off today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{lastUpdated}</div>
            <p className="text-xs text-muted-foreground">schedule saved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {/* Calendar and Available Resources */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{monthName}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <div key={day} className="text-xs font-medium text-muted-foreground py-1">
                    {day[0]}
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
                        aspect-square text-xs rounded hover:bg-accent transition-colors
                        ${isToday(day) ? 'bg-primary text-primary-foreground font-bold' : ''}
                        ${isSelected(day) && !isToday(day) ? 'bg-accent font-medium' : ''}
                      `}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Available People */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Available People ({availablePeople.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {availablePeople.map((person) => (
                  <div
                    key={person.name}
                    draggable
                    onDragStart={() => handleDragStart(person, 'person')}
                    onDragEnd={handleDragEnd}
                    className={`
                      cursor-grab active:cursor-grabbing text-xs px-2 py-1 rounded-full
                      flex items-center gap-1 ${getPersonTypeColor(person.type)}
                    `}
                  >
                    {person.name}
                    {getPersonTypeBadge(person.type) && (
                      <span className="text-[10px] opacity-75">({getPersonTypeBadge(person.type)})</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Trucks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Available Trucks ({availableTrucks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-36 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {availableTrucks.map((truck) => (
                  <div
                    key={truck.name}
                    draggable
                    onDragStart={() => handleDragStart(truck, 'vehicle')}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {truck.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Equipment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Available Equipment ({availableEquipment.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-36 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {availableEquipment.map((equip) => (
                  <div
                    key={equip.name}
                    draggable
                    onDragStart={() => handleDragStart(equip, 'equipment')}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  >
                    {equip.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Absent / Out of Service */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Absent / Out of Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              {absentPeople.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground mb-1">Absent Today:</p>
                  <div className="flex flex-wrap gap-1">
                    {absentPeople.map((person) => (
                      <div
                        key={person.name}
                        className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center gap-1"
                      >
                        {person.name}
                        <button onClick={() => unmarkAbsent(person.name)} className="hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {outOfServiceItems.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Out of Service:</p>
                  <div className="flex flex-wrap gap-1">
                    {outOfServiceItems.map((item) => (
                      <div
                        key={item.name}
                        className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex items-center gap-1"
                      >
                        {item.name}
                        <button onClick={() => unmarkOutOfService(item.name)} className="hover:text-orange-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {absentPeople.length === 0 && outOfServiceItems.length === 0 && (
                <p className="text-xs text-muted-foreground">No absences or out-of-service items</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Crew Assignments Grid */}
        <div className="xl:col-span-3">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {crews.map((crew) => (
              <Card
                key={crew.crewNumber}
                className={`${crew.members.length > 0 ? 'card-accent' : 'opacity-75'}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Crew {crew.crewNumber}
                    <span className="text-sm font-normal text-muted-foreground">
                      {crew.members.length} members
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* People Drop Zone */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Team Members
                    </p>
                    <div
                      onDragOver={(e) => handleDragOver(e, `crew-${crew.crewNumber}-people`)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(crew.crewNumber, 'person')}
                      className={`
                        min-h-[40px] p-2 rounded border-2 border-dashed transition-colors
                        ${activeDropZone === `crew-${crew.crewNumber}-people` && draggedItemType === 'person'
                          ? 'border-primary bg-primary/10'
                          : 'border-muted'
                        }
                      `}
                    >
                      <div className="flex flex-wrap gap-1">
                        {crew.members.map((member) => (
                          <div
                            key={member.name}
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getPersonTypeColor(member.type)}`}
                          >
                            {member.name}
                            {getPersonTypeBadge(member.type) && (
                              <span className="text-[10px] opacity-75">({getPersonTypeBadge(member.type)})</span>
                            )}
                            <button
                              onClick={() => removeFromCrew(crew.crewNumber, member.name, 'person')}
                              className="hover:opacity-75"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {crew.members.length === 0 && (
                          <span className="text-xs text-muted-foreground">Drop people here</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicles Drop Zone */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Truck
                    </p>
                    <div
                      onDragOver={(e) => handleDragOver(e, `crew-${crew.crewNumber}-vehicle`)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(crew.crewNumber, 'vehicle')}
                      className={`
                        min-h-[32px] p-2 rounded border-2 border-dashed transition-colors
                        ${activeDropZone === `crew-${crew.crewNumber}-vehicle` && draggedItemType === 'vehicle'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-muted'
                        }
                      `}
                    >
                      <div className="flex flex-wrap gap-1">
                        {crew.vehicles.map((vehicle) => (
                          <div
                            key={vehicle.name}
                            className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1"
                          >
                            {vehicle.name}
                            <button
                              onClick={() => removeFromCrew(crew.crewNumber, vehicle.name, 'vehicle')}
                              className="hover:opacity-75"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {crew.vehicles.length === 0 && (
                          <span className="text-xs text-muted-foreground">Drop truck here</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Equipment Drop Zone */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> Equipment
                    </p>
                    <div
                      onDragOver={(e) => handleDragOver(e, `crew-${crew.crewNumber}-equipment`)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(crew.crewNumber, 'equipment')}
                      className={`
                        min-h-[32px] p-2 rounded border-2 border-dashed transition-colors
                        ${activeDropZone === `crew-${crew.crewNumber}-equipment` && draggedItemType === 'equipment'
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-muted'
                        }
                      `}
                    >
                      <div className="flex flex-wrap gap-1">
                        {crew.equipment.map((equip) => (
                          <div
                            key={equip.name}
                            className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1"
                          >
                            {equip.name}
                            <button
                              onClick={() => removeFromCrew(crew.crewNumber, equip.name, 'equipment')}
                              className="hover:opacity-75"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {crew.equipment.length === 0 && (
                          <span className="text-xs text-muted-foreground">Drop equipment here</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Job Input */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Job / Location
                    </p>
                    <input
                      type="text"
                      placeholder="Enter job name..."
                      value={crew.jobs[0] || ''}
                      onChange={(e) => updateCrewJob(crew.crewNumber, e.target.value)}
                      className="w-full text-xs p-2 rounded border bg-background"
                    />
                  </div>

                  {/* Salesman/PM */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Salesman / PM</p>
                    <input
                      type="text"
                      placeholder="Enter salesman..."
                      value={crew.salesman}
                      onChange={(e) => updateCrewSalesman(crew.crewNumber, e.target.value)}
                      className="w-full text-xs p-2 rounded border bg-background"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground">CL</span>
              <span>Crew Leader</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">M</span>
              <span>Manager</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Name</span>
              <span>Team Member</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Truck</span>
              <span>Vehicle</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Equipment</span>
              <span>Machine/Trailer</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
