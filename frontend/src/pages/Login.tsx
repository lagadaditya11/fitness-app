import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { post } from '../api'
import { useAuth } from '../auth'
import { Button, Field, inputCls } from '../components/ui'
import type { AuthResponse } from '../types'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await post<AuthResponse>('/api/auth/login', { email, password })
      login(res.token)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">FitTrack</h1>
        <p className="text-sm text-slate-500">Sign in to track your nutrition & workouts</p>
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <Field label="Email">
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Button type="submit" className="w-full">Sign in</Button>
        <p className="text-sm text-center text-slate-500">
          No account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}