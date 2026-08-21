import { useCallback, useEffect, useRef, useState } from 'react'
import { Dumbbell, Plus, Search, Trash2, CalendarDays } from 'lucide-react'
import { del, get, post, ApiError } from '../api'
import { Button, Card, CardHeader, EmptyState, Field, Input, Skeleton, Badge, Modal } from '../components/ui'
import { useToast } from '../components/Toast'
import type { Exercise, WorkoutSession, WorkoutSet } from '../types'

interface SessionDetail { session: WorkoutSession; sets: WorkoutSet[] }

export default function Workouts() {
  const toast = useToast()
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [selected, setSelected] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const loadSessions = useCallback(async () => {
    try {
      setSessions(await get<WorkoutSession[]>('/api/workouts/sessions'))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load workouts.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadDetail = useCallback(async (id: number) => {
    try {
      setSelected(await get<SessionDetail>(`/api/workouts/sessions/${id}`))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load workout.')
    }
  }, [toast])

  useEffect(() => { loadSessions() }, [loadSessions])

  const createSession = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const s = await post<WorkoutSession>('/api/workouts/sessions', {
        name: name.trim(),
        date: new Date().toISOString().slice(0, 10)
      })
      toast.success(`Started "${s.name}"`)
      setName('')
      await loadSessions()
      await loadDetail(s.id)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create workout.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workouts</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your training sessions, set by set.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit lg:col-span-1">
          <CardHeader title="Sessions" subtitle={`${sessions.length} total`} />
          <div className="px-5 pb-5">
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="New workout name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createSession()}
              />
              <Button onClick={createSession} disabled={!name.trim() || creating} loading={creating} aria-label="Create workout">
                <Plus className="size-4" />
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : sessions.length === 0 ? (
              <EmptyState
                icon={<Dumbbell className="size-6" />}
                title="No workouts yet"
                description="Name your first session above and hit enter."
              />
            ) : (
              <ul className="-mx-2 space-y-1">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => loadDetail(s.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                        selected?.session.id === s.id
                          ? 'bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-500/10 dark:ring-brand-500/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={`block truncate text-sm font-medium ${selected?.session.id === s.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'}`}>
                        {s.name ?? 'Workout'}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <CalendarDays className="size-3" /> {s.date}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          {selected ? (
            <SessionEditor
              key={selected.session.id}
              detail={selected}
              onChanged={() => loadDetail(selected.session.id)}
            />
          ) : (
            <EmptyState
              icon={<Dumbbell className="size-6" />}
              title="Select a workout"
              description="Pick a session on the left to view or add sets — or create a new one."
            />
          )}
        </Card>
      </div>
    </div>
  )
}

function SessionEditor({ detail, onChanged }: { detail: SessionDetail; onChanged: () => void }) {
  const toast = useToast()
  const [exQ, setExQ] = useState('')
  const [results, setResults] = useState<Exercise[]>([])
  const [searching, setSearching] = useState(false)
  const [exerciseId, setExerciseId] = useState<number | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [adding, setAdding] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  const sid = detail.session.id
  const grouped = detail.sets.reduce<Record<string, WorkoutSet[]>>((acc, s) => {
    const key = s.exercise?.name ?? 'Unknown'
    ;(acc[key] ??= []).push(s)
    return acc
  }, {})

  useEffect(() => {
    const q = exQ.trim()
    if (!q || exerciseId != null) { setResults([]); return }
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        setResults(await get<Exercise[]>(`/api/workouts/exercises/search?q=${encodeURIComponent(q)}`))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 250)
    return () => clearTimeout(searchTimer.current)
  }, [exQ, exerciseId])

  const addSet = async () => {
    if (!exerciseId) return
    setAdding(true)
    try {
      await post(`/api/workouts/sessions/${sid}/sets?exerciseId=${exerciseId}`, {
        weightKg: weight ? Number(weight) : null,
        reps: reps ? Number(reps) : null
      })
      setWeight(''); setReps(''); setExerciseId(null); setExQ(''); setResults([])
      onChanged()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add set.')
    } finally {
      setAdding(false)
    }
  }

  const removeSet = async () => {
    if (pendingDelete == null) return
    try {
      await del(`/api/workouts/sessions/${sid}/sets/${pendingDelete}`)
      setPendingDelete(null)
      onChanged()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove set.')
    }
  }

  return (
    <div>
      <CardHeader
        title={detail.session.name ?? 'Workout'}
        subtitle={detail.session.date}
        action={<Badge color="brand">{detail.sets.length} sets</Badge>}
      />

      <div className="grid gap-3 px-5 pb-5 sm:grid-cols-4">
        <Field label="Exercise">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search..."
              value={exQ}
              onChange={(e) => { setExerciseId(null); setExQ(e.target.value) }}
              autoComplete="off"
            />
          </div>
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" min={0} step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Reps">
          <Input type="number" min={0} value={reps} onChange={(e) => setReps(e.target.value)} placeholder="Optional" />
        </Field>
        <div className="flex items-end">
          <Button onClick={addSet} disabled={!exerciseId || adding} loading={adding} className="w-full">
            <Plus className="size-4" /> Add set
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <ul className="mx-5 mb-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
          {results.map((ex) => (
            <li key={ex.id}>
              <button
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => { setExerciseId(ex.id); setExQ(ex.name); setResults([]) }}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{ex.name}</span>
                {ex.muscleGroup && <Badge color="slate">{ex.muscleGroup}</Badge>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {searching && <p className="px-5 pb-4 text-xs text-slate-400">Searching...</p>}

      <div className="border-t border-slate-100 px-5 py-5 dark:border-slate-800">
        {detail.sets.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="size-6" />}
            title="No sets yet"
            description="Search an exercise above and log your first set."
          />
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([exerciseName, sets]) => (
              <div key={exerciseName}>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{exerciseName}</h3>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                  {sets.map((s) => (
                    <li key={s.id} className="group flex items-center gap-4 px-4 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {s.setNumber}
                      </span>
                      <span className="flex-1 text-sm tabular-nums text-slate-600 dark:text-slate-300">
                        {s.weightKg != null ? `${s.weightKg} kg` : 'Bodyweight'}
                        <span className="mx-1.5 text-slate-300 dark:text-slate-600">×</span>
                        {s.reps ?? '?'} reps
                      </span>
                      <button
                        onClick={() => setPendingDelete(s.id)}
                        aria-label="Remove set"
                        className="rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={pendingDelete != null} onClose={() => setPendingDelete(null)} title="Remove set?">
        <p className="text-sm text-slate-500 dark:text-slate-400">This will permanently remove this set from the session.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={removeSet}>Remove</Button>
        </div>
      </Modal>
    </div>
  )
}
