import React, { useState } from 'react'

export default function TagInput({ placeholder = "Add skill and press Enter", tags = [], onChange }) {
  const [value, setValue] = useState('')

  const addTag = (t) => {
    const trimmed = t.trim()
    if (!trimmed) return
    const next = Array.from(new Set([...(tags||[]), trimmed]))
    onChange?.(next)
    setValue('')
  }

  const removeTag = (t) => {
    const next = (tags||[]).filter(x => x !== t)
    onChange?.(next)
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-panel px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
        {(tags||[]).map(t => (
          <span key={t} className="text-sm bg-white/10 rounded-xl px-2 py-1 border border-white/10">
            {t}
            <button onClick={() => removeTag(t)} className="ml-2 text-white/60 hover:text-white">×</button>
          </span>
        ))}
        <input
          className="flex-1 bg-transparent outline-none placeholder-white/40"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag(value)
            }
          }}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
