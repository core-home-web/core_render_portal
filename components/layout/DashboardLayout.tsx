'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  user?: any
  onSignOut?: () => void
}

export function DashboardLayout({
  children,
  user,
  onSignOut,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#070e0e]">
      <Sidebar user={user} onSignOut={onSignOut} />
      <main className="flex-1 lg:ml-0 mt-[60px] lg:mt-0">
        {children}
      </main>
    </div>
  )
}

