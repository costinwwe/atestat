import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import SignIn from './pages/SignIn.jsx'
import Vote from './pages/Vote.jsx'
import Results from './pages/Results.jsx'
import CreatePoll from './pages/CreatePoll.jsx'
import AppShell from './components/AppShell.jsx'
import { AuthContext } from './AuthContext.jsx'

function App() {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null
    const stored = window.localStorage.getItem('votesafe_user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (user) {
      window.localStorage.setItem('votesafe_user', JSON.stringify(user))
    } else {
      window.localStorage.removeItem('votesafe_user')
    }
  }, [user])

  const authValue = useMemo(() => ({ user, setUser }), [user])

  return (
    <AuthContext.Provider value={authValue}>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/polls/create" element={<CreatePoll />} />
          <Route path="/polls/:id" element={<Vote />} />
          <Route path="/polls/:id/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </AuthContext.Provider>
  )
}

export default App
