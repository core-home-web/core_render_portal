'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  CheckSquare,
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: 'My Projects',
    href: '/projects',
    icon: <CheckSquare className="w-5 h-5" />,
  },
  {
    label: 'Progress',
    href: '/progress',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
]

const utilityItems: NavItem[] = [
  {
    label: 'Style Guide',
    href: '/styleguide',
    icon: <Settings className="w-5 h-5" />,
  },
]

interface SidebarProps {
  user?: any
  onSignOut?: () => void
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1a1e1f] px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center">
          <div className="text-[#38bdbb] font-bold text-xl">Core Home Render Portal</div>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="w-8 h-8 rounded-full bg-[#38bdbb] flex items-center justify-center text-white text-sm">
              {user.email?.[0].toUpperCase()}
            </div>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-[#1a1e1f] text-white w-[265px] p-10 z-40 transition-transform lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="mb-12 block"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="text-[#38bdbb] font-bold text-2xl">Core Home</div>
            <div className="text-white text-sm mt-1">Render Portal</div>
          </Link>

          {/* Navigation Menu */}
          <div className="mb-12">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-all',
                  'hover:bg-[#222a31] hover:text-[#38bdbb]',
                  pathname === item.href
                    ? 'bg-[#222a31] text-[#38bdbb]'
                    : 'text-white'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Utility Links */}
          <div className="mb-6 pb-6 border-b border-gray-700">
            {utilityItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                  'hover:bg-[#222a31] hover:text-[#38bdbb]',
                  pathname === item.href
                    ? 'bg-[#222a31] text-[#38bdbb]'
                    : 'text-gray-400'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Teams Section */}
          <div className="mb-auto">
            <p className="text-xs uppercase text-gray-400 mb-5 tracking-wide">
              Teams
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#38bdbb]"></div>
                <span className="text-sm">Product Development</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#f9903c]"></div>
                <span className="text-sm">Industrial Design</span>
              </div>
              <Link
                href="/project/new"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-[#38bdbb] hover:text-[#2ea9a7] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add project</span>
              </Link>
            </div>
          </div>

          {/* User Info & Sign Out */}
          {user && (
            <div className="pt-6 border-t border-gray-700 mt-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#38bdbb] flex items-center justify-center text-white">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-gray-400">Active</p>
                </div>
              </div>
              {onSignOut && (
                <button
                  onClick={() => {
                    onSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-sm text-gray-400 hover:text-white transition-colors text-left"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

