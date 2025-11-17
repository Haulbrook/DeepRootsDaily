'use client'

import { useState } from 'react'
import { MapPin, ExternalLink, RefreshCw, Maximize2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ChessMapPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // This should be configured in environment variables
  const chessMapUrl = process.env.NEXT_PUBLIC_CHESSMAP_URL || 'https://dailychessmap.netlify.app'

  function handleRefresh() {
    setIsRefreshing(true)
    // Force iframe reload
    const iframe = document.getElementById('chess-map-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  function openInNewTab() {
    window.open(chessMapUrl, '_blank')
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DRL Chess Map</h1>
          <p className="text-muted-foreground">
            Real-time crew location tracking and coordination
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={openInNewTab}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crews</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently on site</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45mi²</div>
            <p className="text-xs text-muted-foreground">Service radius</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Live</div>
            <p className="text-xs text-muted-foreground">Real-time tracking</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <Card className="flex-1 min-h-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Crew Location Map
          </CardTitle>
          <CardDescription>
            Interactive map showing real-time crew positions and job sites
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100vh-350px)]">
          <div className="relative w-full h-full rounded-b-lg overflow-hidden">
            <iframe
              id="chess-map-iframe"
              src={chessMapUrl}
              className="w-full h-full border-0"
              title="DRL Chess Map - Crew Locations"
              allow="geolocation"
            />
            <div className="absolute bottom-4 right-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const iframe = document.getElementById('chess-map-iframe')
                  if (iframe) {
                    iframe.requestFullscreen?.()
                  }
                }}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">📍 Tracking Crews</h4>
              <p className="text-sm text-muted-foreground">
                Each crew's current location is marked on the map. Click markers for details about active jobs and crew members.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Job Sites</h4>
              <p className="text-sm text-muted-foreground">
                Scheduled job sites are displayed with unique markers. See crew assignments and estimated completion times.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔄 Real-time Updates</h4>
              <p className="text-sm text-muted-foreground">
                The map updates automatically as crews move. Use the refresh button to force an immediate update.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📱 Mobile Access</h4>
              <p className="text-sm text-muted-foreground">
                Open in a new tab for dedicated mobile tracking. Share links with crew leads for coordination.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
