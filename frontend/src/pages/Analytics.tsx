import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from 'recharts'
import { Download, TrendingUp } from 'lucide-react'
import { get } from '../api'
import { Card, CardHeader, Skeleton, Stat } from '../components/ui'
import { useToast } from '../components/Toast'
import { cn } from '../components/ui'
import type { DayPoint, WeightPoint } from '../types'

const ranges = [7, 30, 90]

function shortDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface TooltipEntry {
  dataKey?: string | number
  name?: string
  value?: number | string
  color?: string
}
interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length || typeof label !== 'string') return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{shortDate(label)}</p>
      {payload.map((p, i) => (
        <p key={p.dataKey ?? i} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <span className="inline-block size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">{Number(p.value).toLocaleString()} kcal</span>
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const toast = useToast()
  const [days, setDays] = useState(30)
  const [data, setData] = useState<DayPoint[]>([])
  const [weights, setWeights] = useState<WeightPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      get<DayPoint[]>(`/api/analytics/daily?days=${days}`),
      get<WeightPoint[]>(`/api/weight?days=${days}`)
    ])
      .then(([d, w]) => {
        setData(d)
        setWeights(w)
      })
      .catch((err) => toast.error((err as Error).message))
      .finally(() => setLoading(false))
  }, [days, toast])

  const stats = useMemo(() => {
    const logged = data.filter((d) => d.caloriesIn > 0)
    const avgIn = logged.length ? Math.round(logged.reduce((s, d) => s + d.caloriesIn, 0) / logged.length) : 0
    const totalBurned = data.reduce((s, d) => s + d.caloriesBurned, 0)
    const goal = data.at(-1)?.goal ?? 0
    const onGoalDays = logged.filter((d) => d.caloriesIn <= d.goal).length
    return { avgIn, totalBurned, goal, onGoalDays, loggedDays: logged.length }
  }, [data])

  const exportCsv = () => {
    const header = 'date,calories_in,calories_burned,goal\n'
    const rows = data.map((d) => `${d.date},${d.caloriesIn},${d.caloriesBurned},${d.goal}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fittrack-analytics-${days}d.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your nutrition and training trends over time.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  days === r
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                {r}d
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            title="Export CSV"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Download className="size-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat icon={<TrendingUp className="size-4" />} label="Avg intake" value={`${stats.avgIn.toLocaleString()}`} sub="kcal on logged days" accent="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" />
          <Stat label="Daily goal" value={`${stats.goal.toLocaleString()}`} sub="kcal target" accent="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
          <Stat label="Total burned" value={`${stats.totalBurned.toLocaleString()}`} sub="kcal from workouts" accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
          <Stat label="Days on goal" value={`${stats.onGoalDays}/${stats.loggedDays || 0}`} sub="logged within goal" accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
        </div>
      )}

      <Card>
        <CardHeader title="Calories in vs goal" subtitle="Solid line is intake, dashed line is your daily goal" />
        <div className="px-3 pb-5 sm:px-5">
          {loading ? <Skeleton className="h-[300px]" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={40} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="caloriesIn" name="Eaten" stroke="#6366f1" strokeWidth={2.5} fill="url(#inGradient)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="goal" name="Goal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Weight trend"
          subtitle={weights.length >= 2 ? `${(weights.at(-1)!.weightKg - weights[0].weightKg).toFixed(1)} kg over the period` : 'Log your weight to see the trend'}
        />
        <div className="px-3 pb-5 sm:px-5">
          {loading ? <Skeleton className="h-[250px]" /> : weights.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
              No weight entries in this range — use “Log weight” on the dashboard.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weights} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={40} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                <Tooltip
                  content={({ active, payload, label }: ChartTooltipProps) =>
                    active && payload?.length && typeof label === 'string' ? (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{shortDate(label)}</p>
                        <p className="text-violet-500">{Number(payload[0].value).toFixed(1)} kg</p>
                      </div>
                    ) : null
                  }
                />
                <Area type="monotone" dataKey="weightKg" name="Weight" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#weightGradient)" dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Calories burned from workouts" subtitle="Estimated burn per day across all sessions" />
        <div className="px-3 pb-5 sm:px-5">
          {loading ? <Skeleton className="h-[250px]" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={40} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'currentColor', className: 'text-slate-100 dark:text-slate-800/50' }} />
                <Bar dataKey="caloriesBurned" name="Burned" fill="url(#burnGradient)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  )
}
