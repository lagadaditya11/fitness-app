import { useEffect, useState } from 'react'
import { get, put, ApiError } from '../api'
import { Button, Card, CardHeader, Field, Input, Select, Skeleton, Stat } from '../components/ui'
import { useToast } from '../components/Toast'
import type { ProfileMetrics } from '../types'

const activityLevels = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']
const activityLabels: Record<string, string> = {
  SEDENTARY: 'Sedentary — desk job',
  LIGHT: 'Light — 1-2 workouts/week',
  MODERATE: 'Moderate — 3-4 workouts/week',
  ACTIVE: 'Active — 5-6 workouts/week',
  VERY_ACTIVE: 'Very active — daily training'
}

interface ProfileForm {
  displayName: string
  heightCm: string
  weightKg: string
  age: string
  sex: string
  activityLevel: string
  customDailyCalories: string
}

export default function Profile() {
  const toast = useToast()
  const [metrics, setMetrics] = useState<ProfileMetrics | null>(null)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    get<ProfileMetrics>('/api/profile')
      .then((m) => {
        setMetrics(m)
        setForm({
          displayName: m.profile.displayName ?? '',
          heightCm: m.profile.heightCm?.toString() ?? '',
          weightKg: m.profile.weightKg?.toString() ?? '',
          age: m.profile.age?.toString() ?? '',
          sex: m.profile.sex ?? 'MALE',
          activityLevel: m.profile.activityLevel ?? 'MODERATE',
          customDailyCalories: m.profile.customDailyCalories?.toString() ?? ''
        })
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : 'Failed to load profile.'))
  }, [toast])

  const set = (k: keyof ProfileForm, v: string) =>
    setForm((f) => (f ? { ...f, [k]: v } : f))

  const save = async () => {
    if (!form) return
    setSaving(true)
    try {
      await put('/api/profile', {
        displayName: form.displayName.trim(),
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        age: form.age ? Number(form.age) : null,
        sex: form.sex,
        activityLevel: form.activityLevel,
        customDailyCalories: form.customDailyCalories ? Number(form.customDailyCalories) : null
      })
      const m = await get<ProfileMetrics>('/api/profile')
      setMetrics(m)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your stats drive your personalized calorie goal.</p>
      </div>

      {!metrics || !form ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-96" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="BMR" value={metrics.bmr.toLocaleString()} sub="kcal/day at rest" accent="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" />
            <Stat label="TDEE" value={metrics.tdee.toLocaleString()} sub="maintenance calories" accent="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
            <Stat label="Daily goal" value={metrics.dailyGoal.toLocaleString()} sub={metrics.profile.customDailyCalories ? 'custom target' : 'auto-calculated'} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
          </div>

          <Card>
            <CardHeader title="Your details" subtitle="Used to calculate BMR (Mifflin-St Jeor) and TDEE" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Field label="Display name">
                <Input value={form.displayName} onChange={(e) => set('displayName', e.target.value)} />
              </Field>
              <Field label="Email" hint="Email cannot be changed">
                <Input value={metrics.profile.email} disabled />
              </Field>
              <Field label="Height (cm)">
                <Input type="number" min={0} value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} placeholder="e.g. 178" />
              </Field>
              <Field label="Weight (kg)">
                <Input type="number" min={0} step="0.1" value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} placeholder="e.g. 75.5" />
              </Field>
              <Field label="Age">
                <Input type="number" min={0} max={120} value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="e.g. 30" />
              </Field>
              <Field label="Sex">
                <Select value={form.sex} onChange={(e) => set('sex', e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </Select>
              </Field>
              <Field label="Activity level">
                <Select value={form.activityLevel} onChange={(e) => set('activityLevel', e.target.value)}>
                  {activityLevels.map((a) => <option key={a} value={a}>{activityLabels[a]}</option>)}
                </Select>
              </Field>
              <Field label="Custom daily calories" hint="Leave blank to use the calculated goal">
                <Input type="number" min={0} value={form.customDailyCalories} onChange={(e) => set('customDailyCalories', e.target.value)} placeholder="Auto" />
              </Field>
            </div>
            <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
              <Button onClick={save} loading={saving}>Save changes</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
