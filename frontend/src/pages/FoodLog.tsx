import { useEffect, useState } from 'react'
import { del, get, post } from '../api'
import { Button, Card, Field, inputCls } from '../components/ui'
import type { DaySummary, Food } from '../types'

const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

export default function FoodLog() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [day, setDay] = useState<DaySummary | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [foodId, setFoodId] = useState<number | null>(null)
  const [grams, setGrams] = useState('100')
  const [mealType, setMealType] = useState('LUNCH')

  const load = () => get<DaySummary>(`/api/foodlog/day?date=${date}`).then(setDay)

  useEffect(() => { load() }, [date]) // eslint-disable-line

  const search = async (q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    try {
      const r = await get<Food[]>(`/api/foods/search?q=${encodeURIComponent(q)}`)
      setResults(r)
    } catch { /* ignore */ }
  }

  const addLogReal = async () => {
    if (!foodId) return
    await post(`/api/foodlog?foodId=${foodId}`, { date, grams: Number(grams), mealType })
    setFoodId(null)
    setQuery('')
    setResults([])
    load()
  }

  const remove = async (id: number) => {
    await del(`/api/foodlog/${id}`)
    load()
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-semibold text-slate-900 mb-3">Log food</h2>
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <Field label="Date">
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Food">
            <input
              className={inputCls}
              placeholder="Search foods..."
              value={query}
              onChange={(e) => search(e.target.value)}
              onFocus={() => foodId && search(query)}
            />
          </Field>
          <Field label="Grams">
            <input className={inputCls} type="number" value={grams} onChange={(e) => setGrams(e.target.value)} />
          </Field>
          <Field label="Meal">
            <select className={inputCls} value={mealType} onChange={(e) => setMealType(e.target.value)}>
              {mealTypes.map((m) => <option key={m} value={m}>{m.toLowerCase()}</option>)}
            </select>
          </Field>
        </div>

        {results.length > 0 && (
          <ul className="mt-3 border rounded-md overflow-hidden">
            {results.map((f) => (
              <li key={f.id}>
                <button
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex justify-between ${
                    foodId === f.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => { setFoodId(f.id); setQuery(`${f.name} · ${f.caloriesPer100g} kcal/100g`) }}
                >
                  <span>{f.name}</span>
                  <span className="text-slate-400">{f.caloriesPer100g} kcal/100g</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3">
          <Button onClick={addLogReal} disabled={!foodId}>Add to log</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900 mb-3">
          Logged meals <span className="text-sm font-normal text-slate-500">· {day?.calories ?? 0} kcal total</span>
        </h2>
        {day && Object.entries(day.byMeal).length === 0 && (
          <p className="text-sm text-slate-400">Nothing logged for this day.</p>
        )}
        <div className="space-y-3">
          {day &&
            Object.entries(day.byMeal).map(([meal, entries]) => (
              <div key={meal}>
                <div className="text-sm font-medium text-slate-600 capitalize">{meal.toLowerCase()}</div>
                <ul className="mt-1">
                  {entries.map((en) => (
                    <li key={en.id} className="flex justify-between py-1.5 text-sm border-b border-slate-100">
                      <span>{en.name} · {en.grams}g</span>
                      <span className="flex items-center gap-3">
                        <span className="text-slate-500">{en.calories} kcal · P{en.protein} C{en.carbs} F{en.fat}</span>
                        <button onClick={() => remove(en.id)} className="text-red-500 hover:text-red-700">✕</button>
                      </span>
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