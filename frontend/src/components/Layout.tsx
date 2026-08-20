import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/food', label: 'Food Log' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/profile', label: 'Profile' }
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">FitTrack</span>
          <div className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-md text-sm transition ${
                  location.pathname === l.to
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-md text-sm bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}