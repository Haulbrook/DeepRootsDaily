'use client'

import { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/header'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
