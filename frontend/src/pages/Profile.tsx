import { useEffect, useState } from 'react'
import { get, put } from '../api'
import { Button, Card, Field, Stat, inputCls } from '../components/ui'
import type { ProfileMetrics } from '../types'

const activityLevels = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE']

export default function Profile() {
  const [metrics, setMetrics] = useState<ProfileMetrics | null>(null)
  const [form, setForm] = useState<any>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    get<ProfileMetrics>('/api/profile').then((m) => {
      setMetrics(m)
      setForm({ ...m.profile })
    }).catch(() => {})
  }, [])

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))

  const save = async () => {
    await put('/api/profile', {
      displayName: form.displayName,
      heightCm: form.heightCm ? Number(form.heightCm) : null,
      weightKg: form.weightKg ? Number(form.weightKg) : null,
      age: form.age ? Number(form.age) : null,
      sex: form.sex,
      activityLevel: form.activityLevel,
      customDailyCalories: form.customDailyCalories ? Number(form.customDailyCalories) : null
    })
    const m = await get<ProfileMetrics>('/api/profile')
    setMetrics(m)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label="BMR" value={metrics.bmr} sub="resting calories/day" />
          <Stat label="TDEE" value={metrics.tdee} sub="maintenance calories" />
          <Stat label="Daily goal" value={metrics.dailyGoal} sub={metrics.profile.customDailyCalories ? 'custom' : 'calculated'} />
        </div>
      )}

      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">Update profile</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Display name">
            <input className={inputCls} value={form.displayName ?? ''} onChange={(e) => set('displayName', e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputCls} value={metrics?.profile.email ?? ''} disabled />
          </Field>
          <Field label="Height (cm)">
            <input className={inputCls} type="number" value={form.heightCm ?? ''} onChange={(e) => set('heightCm', e.target.value)} />
          </Field>
          <Field label="Weight (kg)">
            <input className={inputCls} type="number" value={form.weightKg ?? ''} onChange={(e) => set('weightKg', e.target.value)} />
          </Field>
          <Field label="Age">
            <input className={inputCls} type="number" value={form.age ?? ''} onChange={(e) => set('age', e.target.value)} />
          </Field>
          <Field label="Sex">
            <select className={inputCls} value={form.sex ?? 'MALE'} onChange={(e) => set('sex', e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </Field>
          <Field label="Activity level">
            <select className={inputCls} value={form.activityLevel ?? 'MODERATE'} onChange={(e) => set('activityLevel', e.target.value)}>
              {activityLevels.map((a) => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
            </select>
          </Field>
          <Field label="Custom daily calories (blank = auto)">
            <input className={inputCls} type="number" value={form.customDailyCalories ?? ''} onChange={(e) => set('customDailyCalories', e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save}>Save changes</Button>
          {saved && <span className="text-sm text-emerald-600">Saved!</span>}
        </div>
      </Card>
    </div>
  )
}