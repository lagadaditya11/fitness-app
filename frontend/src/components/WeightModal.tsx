import { useEffect, useState } from 'react'
import { Scale } from 'lucide-react'
import { get, post, ApiError } from '../api'
import { Button, Field, Input, Modal } from './ui'
import { useToast } from './Toast'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function WeightModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const [date, setDate] = useState(today)
  const [weight, setWeight] = useState('')
  const [latest, setLatest] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    get<{ date: string; weightKg: number }[]>('/api/weight?days=1')
      .then((rows) => {
        const last = rows.at(-1)
        if (last) {
          setLatest(last.weightKg)
          setWeight(String(last.weightKg))
        }
      })
      .catch(() => {})
  }, [open])

  const save = async () => {
    const w = Number(weight)
    if (!Number.isFinite(w) || w <= 0 || w > 500) {
      toast.error('Enter a valid weight in kilograms.')
      return
    }
    setSaving(true)
    try {
      await post('/api/weight', { date, weightKg: w })
      toast.success('Weight logged')
      onClose()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save weight.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Log your weight">
      <div className="space-y-4">
        {latest != null && (
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Scale className="size-3.5" /> Last entry: <span className="font-semibold text-slate-700 dark:text-slate-200">{latest} kg</span>
          </p>
        )}
        <Field label="Date">
          <Input type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" step="0.1" min={0} max={500} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 75.5" autoFocus />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}
