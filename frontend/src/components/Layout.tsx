import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, UtensilsCrossed, Dumbbell, TrendingUp, User,
  LogOut, Sun, Moon, Menu, X, Flame
} from 'lucide-react'
import { useAuth } from '../auth'
import { useTheme } from '../hooks/useTheme'
import { cn } from './ui'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/food', label: 'Food Log', icon: UtensilsCrossed },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/profile', label: 'Profile', icon: User }
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md shadow-brand-600/30">
        <Flame className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        Fit<span className="text-brand-600 dark:text-brand-400">Track</span>
      </span>
    </Link>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) => cn(
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
          )}
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('size-[18px] shrink-0', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300')} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = (user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()

  const sidebarBody = (
    <>
      <div className="px-2 pt-1">
        <Logo />
      </div>
      <div className="mt-8 flex-1">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu
        </p>
        <NavLinks onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {user?.displayName ?? 'Athlete'}
            </p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-fade-in absolute inset-y-0 left-0 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="size-5" />
            </button>
            {sidebarBody}
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/80">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop theme toggle row */}
        <div className="absolute right-6 top-5 z-10 hidden lg:block">
          <ThemeToggle />
        </div>
        <main key={location.pathname} className="animate-fade-in-up mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
