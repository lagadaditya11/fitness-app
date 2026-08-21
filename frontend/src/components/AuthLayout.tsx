import { Link } from 'react-router-dom'
import { Flame, Check } from 'lucide-react'
import React from 'react'

const highlights = [
  'Log meals from a built-in food database',
  'Track workouts set by set',
  'See calories, macros and trends at a glance',
  'Personalized daily calorie goal (BMR/TDEE)'
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-950 lg:block">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 size-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg shadow-brand-600/40">
              <Flame className="size-6" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Fit<span className="text-brand-400">Track</span>
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight text-white">
              Your body keeps an accurate log.<br />
              <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
                Now you can too.
              </span>
            </h2>
            <ul className="mt-8 space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400">
                    <Check className="size-3" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">Track smarter. Train harder. © {new Date().getFullYear()} FitTrack</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 lg:w-1/2">
        <div className="animate-fade-in-up w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg shadow-brand-600/40">
              <Flame className="size-6" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Fit<span className="text-brand-600 dark:text-brand-400">Track</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
