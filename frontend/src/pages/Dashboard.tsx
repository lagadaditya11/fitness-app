import { useEffect, useState } from 'react'
import { get } from '../api'
import { Card, Stat, MacroBar } from '../components/ui'
import type { DaySummary, ProfileMetrics } from '../types'

export default function Dashboard() {
  const [day, setDay] = useState<DaySummary | null>(null)
  const [profile, setProfile] = useState<ProfileMetrics | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    get<DaySummary>('/api/foodlog/day').then(setDay).catch(() => {})
    get<ProfileMetrics>('/api/profile').then(setProfile).catch(() => {})
    get<{ streak: number }>('/api/analytics/streak').then((s) => setStreak(s.streak)).catch(() => {})
  }, [])

  const goal = profile?.dailyGoal ?? 0
  const remaining = goal - (day?.calories ?? 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Calories eaten" value={day?.calories ?? 0} accent="text-blue-600" />
        <Stat label="Goal" value={goal} />
        <Stat
          label="Remaining"
          value={remaining}
          accent={remaining < 0 ? 'text-red-600' : 'text-emerald-600'}
        />
        <Stat label="Day streak" value={`${streak} 🔥`} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-900">Macros today</h2>
        </div>
        <MacroBar protein={day?.protein ?? 0} carbs={day?.carbs ?? 0} fat={day?.fat ?? 0} />
        <div className="grid grid-cols-3 mt-3 text-center text-sm">
          <div><span className="font-bold text-blue-600">{day?.protein ?? 0}g</span> protein</div>
          <div><span className="font-bold text-emerald-600">{day?.carbs ?? 0}g</span> carbs</div>
          <div><span className="font-bold text-amber-600">{day?.fat ?? 0}g</span> fat</div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900 mb-3">Today&apos;s meals</h2>
        {day && Object.entries(day.byMeal).length === 0 && (
          <p className="text-sm text-slate-400">No meals logged yet today.</p>
        )}
        <div className="space-y-3">
          {day &&
            Object.entries(day.byMeal).map(([meal, entries]) => (
              <div key={meal}>
                <div className="text-sm font-medium text-slate-600 capitalize">{meal.toLowerCase()}</div>
                <ul className="mt-1 text-sm text-slate-700">
                  {entries.map((en) => (
                    <li key={en.id} className="flex justify-between py-0.5">
                      <span>{en.name} · {en.grams}g</span>
                      <span className="text-slate-500">{en.calories} kcal</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}