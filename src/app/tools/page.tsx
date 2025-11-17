'use client'

import { useState } from 'react'
import { Search, Hammer, LogIn, LogOut, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Tool {
  id: string
  name: string
  category: string
  status: 'available' | 'checked-out' | 'maintenance'
  checkedOutBy?: string
  dueDate?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
}

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

  const tools: Tool[] = [
    {
      id: 'T001',
      name: 'Hedge Trimmer - Electric',
      category: 'Power Tools',
      status: 'available',
      condition: 'excellent'
    },
    {
      id: 'T002',
      name: 'Lawn Mower - Commercial',
      category: 'Power Tools',
      status: 'checked-out',
      checkedOutBy: 'Mike Johnson',
      dueDate: '2024-11-18',
      condition: 'good'
    },
    {
      id: 'T003',
      name: 'Pruning Shears - Professional',
      category: 'Hand Tools',
      status: 'available',
      condition: 'good'
    },
    {
      id: 'T004',
      name: 'Leaf Blower - Gas',
      category: 'Power Tools',
      status: 'maintenance',
      condition: 'fair'
    },
    {
      id: 'T005',
      name: 'Rake - Heavy Duty',
      category: 'Hand Tools',
      status: 'available',
      condition: 'excellent'
    },
    {
      id: 'T006',
      name: 'Chainsaw - 18 inch',
      category: 'Power Tools',
      status: 'checked-out',
      checkedOutBy: 'Sarah Williams',
      dueDate: '2024-11-17',
      condition: 'excellent'
    },
  ]

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function getStatusColor(status: string) {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'checked-out': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getConditionColor(condition: string) {
    switch (condition) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-amber-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const availableCount = tools.filter(t => t.status === 'available').length
  const checkedOutCount = tools.filter(t => t.status === 'checked-out').length
  const maintenanceCount = tools.filter(t => t.status === 'maintenance').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tool Checkout</h1>
        <p className="text-muted-foreground">
          Manage hand tool rentals and equipment tracking
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <Hammer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tools.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <LogOut className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{checkedOutCount}</div>
            <p className="text-xs text-muted-foreground">In use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{maintenanceCount}</div>
            <p className="text-xs text-muted-foreground">Under repair</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tools by name, category, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <CardDescription>{tool.category}</CardDescription>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tool.status)}`}>
                  {tool.status.replace('-', ' ')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tool ID:</span>
                  <span className="font-mono">{tool.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className={`font-medium capitalize ${getConditionColor(tool.condition)}`}>
                    {tool.condition}
                  </span>
                </div>
                {tool.checkedOutBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Checked out by:</span>
                    <span className="font-medium">{tool.checkedOutBy}</span>
                  </div>
                )}
                {tool.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due date:</span>
                    <span className="font-medium">
                      {new Date(tool.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {tool.status === 'available' && (
                  <Button className="flex-1" onClick={() => setSelectedTool(tool)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                )}
                {tool.status === 'checked-out' && (
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedTool(tool)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Return
                  </Button>
                )}
                {tool.status === 'maintenance' && (
                  <Button variant="outline" className="flex-1" disabled>
                    Under Maintenance
                  </Button>
                )}
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Checkout Modal/Panel */}
      {selectedTool && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedTool.status === 'available' ? 'Check Out Tool' : 'Return Tool'}
              </CardTitle>
              <Button variant="ghost" onClick={() => setSelectedTool(null)}>
                ×
              </Button>
            </div>
            <CardDescription>
              {selectedTool.name} ({selectedTool.id})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input placeholder="Enter your name" />
            </div>

            {selectedTool.status === 'available' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Return Date</label>
                <Input type="date" />
              </div>
            )}

            {selectedTool.status === 'checked-out' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tool Condition on Return</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair - Needs attention</option>
                  <option value="poor">Poor - Needs repair</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input placeholder="Any additional notes..." />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">
                {selectedTool.status === 'available' ? 'Check Out' : 'Return Tool'}
              </Button>
              <Button variant="outline" onClick={() => setSelectedTool(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest tool checkouts and returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { tool: 'Hedge Trimmer', action: 'returned', user: 'Mike Johnson', time: '5 min ago' },
              { tool: 'Lawn Mower', action: 'checked out', user: 'Sarah Williams', time: '15 min ago' },
              { tool: 'Chainsaw', action: 'checked out', user: 'David Martinez', time: '1 hour ago' },
              { tool: 'Pruning Shears', action: 'returned', user: 'Lisa Anderson', time: '2 hours ago' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {activity.action === 'checked out' ? (
                    <LogOut className="h-4 w-4 text-blue-600" />
                  ) : (
                    <LogIn className="h-4 w-4 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium">{activity.tool}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action} by {activity.user}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
