'use client'

import { useState, useEffect } from 'react'
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
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
          <Button variant="outline" onClick={() => setIsLoading(true)} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Load Schedule
          </Button>
          <Button onClick={() => setIsSaving(true)} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save Schedule
          </Button>
        </div>
      </div>

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
