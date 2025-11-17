'use client'

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const inventoryData = [
  { month: 'Jan', items: 980, value: 45000 },
  { month: 'Feb', items: 1050, value: 48000 },
  { month: 'Mar', items: 1150, value: 52000 },
  { month: 'Apr', items: 1200, value: 55000 },
  { month: 'May', items: 1234, value: 58000 },
]

const toolUsageData = [
  { name: 'Power Tools', value: 45 },
  { name: 'Hand Tools', value: 30 },
  { name: 'Heavy Equipment', value: 15 },
  { name: 'Safety Gear', value: 10 },
]

const crewProductivityData = [
  { crew: 'Crew A', jobs: 42, hours: 320 },
  { crew: 'Crew B', jobs: 38, hours: 290 },
  { crew: 'Crew C', jobs: 45, hours: 340 },
]

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))']

export function InventoryTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={inventoryData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="items" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Items" />
        <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Estimated Value ($)" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ToolUsagePieChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={toolUsageData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {toolUsageData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function CrewProductivityChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={crewProductivityData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="crew" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Bar dataKey="jobs" fill="hsl(var(--primary))" name="Jobs Completed" />
        <Bar dataKey="hours" fill="hsl(var(--chart-3))" name="Total Hours" />
      </BarChart>
    </ResponsiveContainer>
  )
}
