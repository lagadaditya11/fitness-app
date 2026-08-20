import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { post } from '../api'
import { useAuth } from '../auth'
import { Button, Field, inputCls } from '../components/ui'
import type { AuthResponse } from '../types'

const activityLevels = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', displayName: '',
    heightCm: '', weightKg: '', age: '', sex: 'MALE', activityLevel: 'MODERATE'
  })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await post<AuthResponse>('/api/auth/register', {
        ...form,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        age: form.age ? Number(form.age) : null
      })
      login(res.token)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <Field label="Display name">
          <input className={inputCls} value={form.displayName} onChange={(e) => set('displayName', e.target.value)} required />
        </Field>
        <Field label="Email">
          <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </Field>
        <Field label="Password">
          <input className={inputCls} type="password" minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} required />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Height (cm)">
            <input className={inputCls} type="number" value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} />
          </Field>
          <Field label="Weight (kg)">
            <input className={inputCls} type="number" value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} />
          </Field>
          <Field label="Age">
            <input className={inputCls} type="number" value={form.age} onChange={(e) => set('age', e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sex">
            <select className={inputCls} value={form.sex} onChange={(e) => set('sex', e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </Field>
          <Field label="Activity level">
            <select className={inputCls} value={form.activityLevel} onChange={(e) => set('activityLevel', e.target.value)}>
              {activityLevels.map((a) => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
            </select>
          </Field>
        </div>
        <Button type="submit" className="w-full">Register</Button>
        <p className="text-sm text-center text-slate-500">
          Have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}