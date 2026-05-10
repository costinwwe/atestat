import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../AuthContext.jsx'

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('vs-theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vs-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  return { theme, toggle }
}

export default function Header() {
  const { user, setUser } = useContext(AuthContext)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggle } = useTheme()

  const handleLogout = () => {
    setUser(null)
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="app-header">
      <div className="app-header__container">
        <Link to="/" className="app-header__logo" onClick={closeMobileMenu}>
          <div className="app-header__logo-icon">
            <svg viewBox="0 0 16 16">
              <path d="M8 2L3 5v4c0 3 2.5 5 5 6 2.5-1 5-3 5-6V5L8 2z" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="app-header__logo-text">VoteSafe</span>
        </Link>

        <nav className={`app-header__nav ${mobileMenuOpen ? 'is-open' : ''}`}>
          <Link to="/" className="app-header__nav-link" onClick={closeMobileMenu}>
            Home
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="app-header__nav-link" onClick={closeMobileMenu}>
                Sign In
              </Link>
              <Link to="/register" className="app-header__nav-link app-header__nav-link--highlight" onClick={closeMobileMenu}>
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === 'organizer' && (
                <Link to="/polls/create" className="app-header__nav-link app-header__nav-link--highlight" onClick={closeMobileMenu}>
                  Create Poll
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="app-header__auth">
          <button className="theme-toggle-btn" onClick={toggle} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="app-header__user-info" style={{ marginLeft: '8px' }}>
              <div className="app-header__user-menu">
                <div className="app-header__user-avatar">
                  <svg viewBox="0 0 16 16">
                    <circle cx="8" cy="6" r="3" />
                    <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="app-header__user-tooltip">
                  Signed in as <strong>{user.username || user.email}</strong>
                  <br />
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user.role}</span>
                </div>
              </div>
              <button className="app-header__logout-btn" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="app-header__auth-label" style={{ marginLeft: '8px' }}>Not signed in</div>
          )}
        </div>

        <button
          className="app-header__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="app-header__hamburger" />
        </button>
      </div>
    </header>
  )
}