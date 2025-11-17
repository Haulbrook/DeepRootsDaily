'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, AlertTriangle, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchInventory, checkLowStock, getRecentActivity } from '@/services/api'
import { LowStockAlert, RecentActivity } from '@/types'

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<string>('')
  const [isSearching, setIsSearching] = useState(false)
  const [lowStockItems, setLowStockItems] = useState<LowStockAlert[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    loadLowStockAlerts()
    loadRecentActivity()
  }, [])

  async function loadLowStockAlerts() {
    const response = await checkLowStock()
    if (response.success && response.response) {
      setLowStockItems(response.response)
    }
  }

  async function loadRecentActivity() {
    const response = await getRecentActivity(5)
    if (response.success && response.response) {
      setRecentActivity(response.response)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    const response = await searchInventory(searchQuery)
    setIsSearching(false)

    if (response.success && response.response) {
      setSearchResult(response.response.answer)
    } else if (response.error) {
      setSearchResult(`Error: ${response.error.message}`)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Search, track, and manage your clippings and materials inventory
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search inventory... (e.g., 'red mulch', '10 yards', 'boxwood')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {searchResult && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {searchResult}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity.length}</div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Items that need reordering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {item.quantity} {item.unit} | Minimum: {item.minStock} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${item.needsOrdering ? 'text-destructive' : 'text-amber-500'}`}>
                      {item.percentOfMin}% of min
                    </span>
                    <Button size="sm" variant="outline">
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest inventory changes and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.itemName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.details}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
