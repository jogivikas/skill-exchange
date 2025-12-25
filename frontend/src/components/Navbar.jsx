import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) return null

  const navLinks = [
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/find-match', label: 'Find Match', icon: '🔍' },
    { path: '/skills', label: 'Skills', icon: '⭐' },
    { path: '/requests', label: 'Requests', icon: '📬' },
    { path: '/messages', label: 'Messages', icon: '💬' },
  ]

  const adminLink = user.isAdmin ? { path: '/admin', label: 'Admin', icon: '⚙️' } : null

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              SkillSwap
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                  isActive(path)
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{icon}</span>
                <span className="text-sm">{label}</span>
              </Link>
            ))}
            {adminLink && (
              <Link
                to={adminLink.path}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                  isActive(adminLink.path)
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{adminLink.icon}</span>
                <span className="text-sm">{adminLink.label}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button + Logout */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline-block"
            >
              Logout
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="sm:hidden"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


