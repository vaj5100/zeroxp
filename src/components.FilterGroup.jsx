import React from 'react'

export default function FilterGroup({ label, children, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-panel p-4 hover:shadow-neon transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm uppercase tracking-widest text-white/60">{label}</label>
        {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
      </div>
      {children}
    </div>
  )
}
