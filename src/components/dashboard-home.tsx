'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, Package, Wrench, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InventoryTrendChart, ToolUsagePieChart, CrewProductivityChart } from '@/components/charts'

const stats = [
  {
    title: 'Inventory Items',
    value: '1,234',
    change: '+12.5%',
    icon: Package,
    href: '/inventory',
  },
  {
    title: 'Tools In Use',
    value: '45',
    change: '+8.2%',
    icon: Wrench,
    href: '/tools',
  },
  {
    title: 'Scheduled Jobs',
    value: '23',
    change: '+4.1%',
    icon: Calendar,
    href: '/scheduler',
  },
  {
    title: 'Active Crews',
    value: '8',
    change: '0%',
    icon: Users,
    href: '/scheduler',
  },
]

const recentActivity = [
  { action: 'Updated inventory', item: 'Mulch - Red', time: '2 minutes ago' },
  { action: 'Checked out', item: 'Hedge Trimmer', time: '15 minutes ago' },
  { action: 'Scheduled job', item: 'Crew A - Site 123', time: '1 hour ago' },
  { action: 'Graded plant', item: 'Boxwood #45', time: '2 hours ago' },
]

export function DashboardHome() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your operations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-600'}>
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
                <Button
                  asChild
                  variant="link"
                  className="mt-2 h-auto p-0 text-xs"
                >
                  <Link href={stat.href}>
                    View details <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to commonly used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
              <Link href="/inventory">
                <Package className="mb-2 h-5 w-5" />
                <span className="font-medium">Check Inventory</span>
                <span className="text-xs text-muted-foreground">
                  Search and manage stock
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
              <Link href="/grading">
                <Wrench className="mb-2 h-5 w-5" />
                <span className="font-medium">Grade Plants</span>
                <span className="text-xs text-muted-foreground">
                  Quality assessment
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
              <Link href="/scheduler">
                <Calendar className="mb-2 h-5 w-5" />
                <span className="font-medium">View Schedule</span>
                <span className="text-xs text-muted-foreground">
                  Crew assignments
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
              <Link href="/tools">
                <Wrench className="mb-2 h-5 w-5" />
                <span className="font-medium">Tool Checkout</span>
                <span className="text-xs text-muted-foreground">
                  Manage rentals
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Visualization */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Trends</CardTitle>
            <CardDescription>
              Monthly inventory levels and estimated value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tool Usage Distribution</CardTitle>
            <CardDescription>
              Breakdown of tool categories in use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToolUsagePieChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crew Productivity</CardTitle>
          <CardDescription>
            Jobs completed and hours worked per crew this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CrewProductivityChart />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates across all tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.item}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
