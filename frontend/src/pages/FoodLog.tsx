import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, Search, Trash2, UtensilsCrossed, CalendarDays } from 'lucide-react'
import { del, get, post, ApiError } from '../api'
import { Button, Card, CardHeader, EmptyState, Field, Input, Select, Skeleton, Badge, Modal } from '../components/ui'
import { useToast } from '../components/Toast'
import type { DaySummary, Food } from '../types'

const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
const mealLabels: Record<string, string> = {
  BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack'
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function FoodLog() {
  const toast = useToast()
  const [date, setDate] = useState(today)
  const [day, setDay] = useState<DaySummary | null>(null)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [grams, setGrams] = useState('100')
  const [mealType, setMealType] = useState('LUNCH')
  const [adding, setAdding] = useState(false)

  const [pendingDelete, setPendingDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  const load = useCallback(async () => {
    try {
      setDay(await get<DaySummary>(`/api/foodlog/day?date=${date}`))
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [date, toast])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = query.trim()
    if (!q || selectedFood?.name === q) { setResults([]); return }
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        setResults(await get<Food[]>(`/api/foods/search?q=${encodeURIComponent(q)}`))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 250)
    return () => clearTimeout(searchTimer.current)
  }, [query, selectedFood])

  const addLog = async () => {
    if (!selectedFood) return
    const g = Number(grams)
    if (!Number.isFinite(g) || g <= 0) {
      toast.error('Please enter a valid amount in grams.')
      return
    }
    setAdding(true)
    try {
      await post(`/api/foodlog?foodId=${selectedFood.id}`, { date, grams: g, mealType })
      toast.success(`Added ${selectedFood.name} to ${mealLabels[mealType].toLowerCase()}`)
      setSelectedFood(null)
      setQuery('')
      setResults([])
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to log food.')
    } finally {
      setAdding(false)
    }
  }

  const removeEntry = async () => {
    if (pendingDelete == null) return
    setDeleting(true)
    try {
      await del(`/api/foodlog/${pendingDelete}`)
      toast.success('Entry removed')
      setPendingDelete(null)
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove entry.')
    } finally {
      setDeleting(false)
    }
  }

  const totalKcal = day?.calories ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Food Log</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search the database and log what you eat.</p>
      </div>

      <Card>
        <CardHeader title="Log food" subtitle="Pick a food, set the amount and meal" />
        <div className="grid gap-4 px-5 pb-5 md:grid-cols-4">
          <Field label="Date">
            <Input type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Food" hint={selectedFood ? `${selectedFood.caloriesPer100g} kcal / 100g` : undefined}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search foods..."
                value={query}
                onChange={(e) => { setSelectedFood(null); setQuery(e.target.value) }}
                autoComplete="off"
              />
            </div>
          </Field>
          <Field label="Grams">
            <Input type="number" min={1} value={grams} onChange={(e) => setGrams(e.target.value)} invalid={!!grams && Number(grams) <= 0} />
          </Field>
          <Field label="Meal">
            <Select value={mealType} onChange={(e) => setMealType(e.target.value)}>
              {mealTypes.map((m) => <option key={m} value={m}>{mealLabels[m]}</option>)}
            </Select>
          </Field>
        </div>

        {results.length > 0 && (
          <ul className="mx-5 mb-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
            {results.map((f) => (
              <li key={f.id}>
                <button
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => { setSelectedFood(f); setQuery(f.name); setResults([]) }}
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200">{f.name}</span>
                  <Badge color="slate">{f.caloriesPer100g} kcal/100g</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
        {searching && <p className="px-5 pb-4 text-xs text-slate-400">Searching...</p>}

        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <Button onClick={addLog} disabled={!selectedFood || adding} loading={adding}>
            <Plus className="size-4" /> Add to log
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={`Logged meals — ${new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`}
          subtitle={`${totalKcal.toLocaleString()} kcal total`}
          action={<Badge color="brand"><CalendarDays className="size-3.5" /> {Object.values(day?.byMeal ?? {}).flat().length} items</Badge>}
        />
        <div className="px-5 pb-5">
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : !day || Object.entries(day.byMeal).length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="size-6" />}
              title="Nothing logged for this day"
              description="Use the form above to log your first meal for this date."
            />
          ) : (
            <div className="space-y-5">
              {Object.entries(day.byMeal).map(([meal, entries]) => (
                <div key={meal}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">
                      {mealLabels[meal.toUpperCase()] ?? meal.toLowerCase()}
                    </h3>
                    <span className="text-xs tabular-nums text-slate-400">
                      {entries.reduce((s, e) => s + e.calories, 0)} kcal
                    </span>
                  </div>
                  <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                    {entries.map((en) => (
                      <li key={en.id} className="group flex items-center justify-between gap-3 px-4 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{en.name}</p>
                          <p className="text-xs text-slate-400">{en.grams}g · P {en.protein}g · C {en.carbs}g · F {en.fat}g</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="tabular-nums text-sm font-medium text-slate-600 dark:text-slate-300">{en.calories} kcal</span>
                          <button
                            onClick={() => setPendingDelete(en.id)}
                            aria-label={`Remove ${en.name}`}
                            className="rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal open={pendingDelete != null} onClose={() => setPendingDelete(null)} title="Remove entry?">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This will permanently remove this item from your food log.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={removeEntry} loading={deleting}>Remove</Button>
        </div>
      </Modal>
    </div>
  )
}
