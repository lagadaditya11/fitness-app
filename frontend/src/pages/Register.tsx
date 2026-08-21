import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { post } from '../api'
import { useAuth } from '../auth'
import { Button, Field, Input } from '../components/ui'
import AuthLayout from '../components/AuthLayout'
import type { AuthResponse } from '../types'

interface Errors {
  displayName?: string
  email?: string
  password?: string
}

export default function Register() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = (): boolean => {
    const e: Errors = {}
    if (!displayName.trim()) e.displayName = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address.'
    if (password.length < 8) e.password = 'Password must be at least 8 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await post<AuthResponse>('/api/auth/register', {
        displayName: displayName.trim(),
        email: email.trim(),
        password
      })
      login(res.token, { email: res.email, displayName: res.displayName })
      navigate('/')
    } catch (err) {
      setServerError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start tracking in under a minute.</p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        {serverError && (
          <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {serverError}
          </div>
        )}
        <Field label="Name" error={errors.displayName}>
          <Input
            placeholder="Alex Doe"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            invalid={!!errors.displayName}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!errors.email}
          />
        </Field>
        <Field label="Password" error={errors.password} hint="At least 8 characters">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={!!errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <Button type="submit" size="lg" loading={submitting} className="w-full">Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
