import Header from './Header.jsx'

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-content">{children}</main>
    </div>
  )
}
