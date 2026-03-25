import { Navigate, Outlet } from 'react-router-dom'

export default function AuthGuard() {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  // Agar user logged in nahi hai, toh seedha Auth (Login) page pe bhej do
  if (!token || !user) {
    return <Navigate to="/auth" replace />
  }

  // Agar logged in hai, toh jo page manga tha wo dikha do
  return <Outlet />
}