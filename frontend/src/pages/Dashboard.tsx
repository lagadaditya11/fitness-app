import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, UtensilsCrossed, Target, Scale, Plus, Sun, Moon, Coffee } from 'lucide-react'
import { get } from '../api'
import { Card, CardHeader, Stat, MacroBar, ProgressRing, Skeleton, EmptyState, Badge, Button } from '../components/ui'
import WeightModal from '../components/WeightModal'
import type { DaySummary, ProfileMetrics } from '../types'

const mealIcons: Record<string, React.ReactNode> = {
  BREAKFAST: <Coffee className="size-4" />,
  LUNCH: <Sun className="size-4" />,
  DINNER: <Moon className="size-4" />,
  SNACK: <UtensilsCrossed className="size-4" />
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const [day, setDay] = useState<DaySummary | null>(null)
  const [profile, setProfile] = useState<ProfileMetrics | null>(null)
  const [streak, setStreak] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [weightOpen, setWeightOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      get<DaySummary>('/api/foodlog/day'),
      get<ProfileMetrics>('/api/profile'),
      get<{ streak: number }>('/api/analytics/streak')
    ])
      .then(([d, p, s]) => {
        setDay(d)
        setProfile(p)
        setStreak(s.streak)
      })
      .finally(() => setLoading(false))
  }, [])

  const goal = profile?.dailyGoal ?? 0
  const eaten = day?.calories ?? 0
  const remaining = goal - eaten

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-1" />
          <Skeleton className="h-72 lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting()}{profile?.profile.displayName ? `, ${profile.profile.displayName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here&apos;s your nutrition at a glance today.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setWeightOpen(true)}>
          <Scale className="size-4" /> Log weight
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={<Flame className="size-4" />}
          label="Eaten"
          value={<>{eaten.toLocaleString()} <span className="text-sm font-medium text-slate-400">kcal</span></>}
          accent="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
        />
        <Stat
          icon={<Target className="size-4" />}
          label="Goal"
          value={<>{goal.toLocaleString()} <span className="text-sm font-medium text-slate-400">kcal</span></>}
          accent="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
        />
        <Stat
          icon={<Scale className="size-4" />}
          label="Remaining"
          value={<>{remaining.toLocaleString()} <span className="text-sm font-medium text-slate-400">kcal</span></>}
          sub={remaining < 0 ? 'Over your goal' : 'Still to enjoy'}
          accent={remaining < 0
            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}
        />
        <Stat
          icon={<Flame className="size-4" />}
          label="Streak"
          value={<>{streak ?? 0} <span className="text-sm font-medium text-slate-400">days</span></>}
          sub={(streak ?? 0) > 0 ? "Keep it going!" : 'Log today to start'}
          accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-6">
          <h2 className="mb-4 self-start text-base font-semibold text-slate-900 dark:text-slate-100">Today&apos;s progress</h2>
          <ProgressRing
            value={eaten}
            max={goal}
            label={`${Math.round(goal > 0 ? (eaten / goal) * 100 : 0)}%`}
            sub={`${eaten.toLocaleString()} / ${goal.toLocaleString()} kcal`}
          />
          <p className={`mt-4 rounded-full px-3 py-1 text-xs font-medium ${remaining >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'}`}>
            {remaining >= 0
              ? `${remaining.toLocaleString()} kcal left today`
              : `${Math.abs(remaining).toLocaleString()} kcal over goal`}
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Macros today" subtitle="Distribution of protein, carbs and fat" />
          <div className="px-5 pb-5">
            <MacroBar protein={day?.protein ?? 0} carbs={day?.carbs ?? 0} fat={day?.fat ?? 0} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Today's meals"
          subtitle={Object.keys(day?.byMeal ?? {}).length > 0 ? `${Object.values(day?.byMeal ?? {}).flat().length} items logged` : undefined}
          action={
            <Link to="/food">
              <Button size="sm" variant="secondary"><Plus className="size-3.5" /> Log food</Button>
            </Link>
          }
        />
        <div className="px-5 pb-5">
          {!day || Object.entries(day.byMeal).length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="size-6" />}
              title="No meals logged yet today"
              description="Search our food database and log your first meal to see it here."
              action={<Link to="/food"><Button size="sm"><Plus className="size-3.5" /> Log your first meal</Button></Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(day.byMeal).map(([meal, entries]) => {
                const mealKcal = entries.reduce((sum, e) => sum + e.calories, 0)
                return (
                  <div key={meal} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">
                        <span className="text-brand-500">{mealIcons[meal.toUpperCase()] ?? <UtensilsCrossed className="size-4" />}</span>
                        {meal.toLowerCase()}
                      </span>
                      <Badge color="brand">{mealKcal} kcal</Badge>
                    </div>
                    <ul className="space-y-1.5">
                      {entries.map((en) => (
                        <li key={en.id} className="flex items-center justify-between text-sm">
                          <span className="truncate text-slate-600 dark:text-slate-300">{en.name} · {en.grams}g</span>
                          <span className="ml-2 shrink-0 tabular-nums text-slate-400">{en.calories} kcal</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      <WeightModal open={weightOpen} onClose={() => setWeightOpen(false)} />
    </div>
  )
}
