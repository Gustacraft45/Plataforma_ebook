import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Dashboard from './Dashboard'
import BookReading from './BookReading'
import AuthorPanel from './AuthorPanel'
import NotFound from './NotFound'

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/" replace />
  if (role) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== role) return <Navigate to={user.role === 'escritor' ? '/author' : '/dashboard'} replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute role="leitor"><Dashboard /></PrivateRoute>} />
        <Route path="/book/:id"  element={<PrivateRoute role="leitor"><BookReading /></PrivateRoute>} />
        <Route path="/author"   element={<PrivateRoute role="escritor"><AuthorPanel /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
