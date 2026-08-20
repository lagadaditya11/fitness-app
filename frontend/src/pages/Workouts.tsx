import { useEffect, useState } from 'react'
import { del, get, post } from '../api'
import { Button, Card, Field, inputCls } from '../components/ui'
import type { Exercise, WorkoutSession, WorkoutSet } from '../types'

interface SessionDetail { session: WorkoutSession; sets: WorkoutSet[] }

export default function Workouts() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [selected, setSelected] = useState<SessionDetail | null>(null)
  const [name, setName] = useState('')

  const loadSessions = () => get<WorkoutSession[]>('/api/workouts/sessions').then(setSessions)
  const loadDetail = (id: number) => get<SessionDetail>(`/api/workouts/sessions/${id}`).then(setSelected)

  useEffect(() => { loadSessions() }, [])

  const createSession = async () => {
    const s = await post<WorkoutSession>('/api/workouts/sessions', { name, date: new Date().toISOString().slice(0, 10) })
    setName('')
    await loadSessions()
    setSelected(null)
    loadDetail(s.id)
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <h2 className="font-semibold text-slate-900 mb-3">Workouts</h2>
        <div className="flex gap-2 mb-3">
          <input className={inputCls} placeholder="New workout name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={createSession} disabled={!name.trim()}>+</Button>
        </div>
        <ul className="space-y-1">
          {sessions.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => loadDetail(s.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${selected?.session.id === s.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              >
                <span className="font-medium">{s.name ?? 'Workout'}</span>
                <span className="block text-xs text-slate-400">{s.date}</span>
              </button>
            </li>
          ))}
          {sessions.length === 0 && <p className="text-sm text-slate-400">No workouts yet.</p>}
        </ul>
      </Card>

      <Card className="md:col-span-2">
        {selected ? (
          <SessionEditor
            detail={selected}
            onChanged={() => loadDetail(selected.session.id)}
          />
        ) : (
          <p className="text-sm text-slate-400">Select a workout to view or add sets.</p>
        )}
      </Card>
    </div>
  )
}

function SessionEditor({ detail, onChanged }: {
  detail: SessionDetail
  onChanged: () => void
}) {
  const [exQ, setExQ] = useState('')
  const [results, setResults] = useState<Exercise[]>([])
  const [exerciseId, setExerciseId] = useState<number | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  const sid = detail.session.id

  const searchEx = async (q: string) => {
    setExQ(q)
    if (!q.trim()) { setResults([]); return }
    const r = await get<Exercise[]>(`/api/workouts/exercises/search?q=${encodeURIComponent(q)}`)
    setResults(r)
  }

  const addSet = async () => {
    if (!exerciseId) return
    await post(`/api/workouts/sessions/${sid}/sets?exerciseId=${exerciseId}`, {
      weightKg: weight ? Number(weight) : null,
      reps: reps ? Number(reps) : null
    })
    setWeight(''); setReps(''); setExerciseId(null); setExQ(''); setResults([])
    onChanged()
  }

  const removeSet = async (setId: number) => {
    await del(`/api/workouts/sessions/${sid}/sets/${setId}`)
    onChanged()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-semibold text-slate-900">{detail.session.name ?? 'Workout'}</h2>
          <p className="text-xs text-slate-400">{detail.session.date}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 items-end mb-2">
        <Field label="Exercise">
          <input className={inputCls} placeholder="Search..." value={exQ} onChange={(e) => searchEx(e.target.value)} />
        </Field>
        <Field label="Weight (kg)">
          <input className={inputCls} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <Field label="Reps">
          <input className={inputCls} type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
        </Field>
        <Button onClick={addSet} disabled={!exerciseId}>Add set</Button>
      </div>

      {results.length > 0 && (
        <ul className="mb-3 border rounded-md overflow-hidden">
          {results.map((ex) => (
            <li key={ex.id}>
              <button
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${exerciseId === ex.id ? 'bg-blue-50' : ''}`}
                onClick={() => { setExerciseId(ex.id); setExQ(`${ex.name}${ex.muscleGroup ? ' · ' + ex.muscleGroup : ''}`); setResults([]) }}
              >
                {ex.name} <span className="text-slate-400">{ex.muscleGroup}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {detail.sets.length === 0 ? (
        <p className="text-sm text-slate-400">No sets yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">Set</th><th>Exercise</th><th>Weight</th><th>Reps</th><th></th>
            </tr>
          </thead>
          <tbody>
            {detail.sets.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-2 text-slate-400">{s.setNumber}</td>
                <td>{s.exercise?.name}</td>
                <td>{s.weightKg ?? '-'} kg</td>
                <td>{s.reps ?? '-'}</td>
                <td className="text-right">
                  <button onClick={() => removeSet(s.id)} className="text-red-500 hover:text-red-700">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}