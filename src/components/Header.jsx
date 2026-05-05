import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../AuthContext.jsx'

export default function Header() {
  const { user, setUser } = useContext(AuthContext)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    setUser(null)
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="app-header">
      <div className="app-header__container">
        <Link to="/" className="app-header__logo" onClick={closeMobileMenu}>
          <span className="app-header__logo-icon">🗳️</span>
          <span className="app-header__logo-text">VoteSafe</span>
        </Link>

        <button
          className="app-header__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="app-header__hamburger"></span>
        </button>

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
          {user ? (
            <div className="app-header__user-info">
              <div className="app-header__user-menu">
                <span className="app-header__user-badge">
                  <span className="app-header__user-avatar">👤</span>
                </span>
                <div className="app-header__user-tooltip">
                  Signed in as <strong>{user.username || user.email}</strong>
                </div>
              </div>
              <button className="app-header__logout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="app-header__auth-label">Not signed in</div>
          )}
        </div>
      </div>
    </header>
  )
}
