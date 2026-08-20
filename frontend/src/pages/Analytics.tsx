import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  Legend, BarChart, Bar
} from 'recharts'
import { get } from '../api'
import { Card, Field, inputCls } from '../components/ui'
import type { DayPoint } from '../types'

export default function Analytics() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<DayPoint[]>([])

  useEffect(() => {
    get<DayPoint[]>(`/api/analytics/daily?days=${days}`).then(setData).catch(() => {})
  }, [days])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
        <div className="w-32">
          <Field label="Range (days)">
            <select className={inputCls} value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={7}>7</option>
              <option value={30}>30</option>
              <option value={90}>90</option>
            </select>
          </Field>
        </div>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-900 mb-3">Calories in vs goal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="caloriesIn" name="Calories eaten" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="goal" name="Goal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900 mb-3">Calories burned from workouts</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="caloriesBurned" name="Burned" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}