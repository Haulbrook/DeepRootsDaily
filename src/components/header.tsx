'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory, tools, or schedules..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <span className="text-sm font-medium">DR</span>
        </div>
      </div>
    </header>
  )
}
