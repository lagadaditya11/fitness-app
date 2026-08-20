import React from 'react'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${className}`}>
      {children}
    </div>
  )
}

export function Stat({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <Card>
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${accent ?? 'text-slate-900'}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </Card>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

export const inputCls =
  'w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function MacroBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat || 1
  return (
    <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-200">
      <div className="bg-blue-500" style={{ width: `${(protein / total) * 100}%` }} title="Protein" />
      <div className="bg-emerald-500" style={{ width: `${(carbs / total) * 100}%` }} title="Carbs" />
      <div className="bg-amber-500" style={{ width: `${(fat / total) * 100}%` }} title="Fat" />
    </div>
  )
}