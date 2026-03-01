'use client'
// src/components/dashboard/RunAgentButton.tsx
// Client component — triggers AI agent via API and shows loading/result state

import { useState } from 'react'

export default function RunAgentButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ tasksCreated: number; patientsAffected: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRunAgent() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType: 'MANUAL' }),
      })
      const json = await res.json()
      if (json.success) {
        setResult({
          tasksCreated: json.data.tasksCreated,
          patientsAffected: json.data.patientsAffected,
        })
        // Reload page after 2s to show updated data
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setError(json.error ?? 'Agent failed')
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-green-400 animate-fade-in">
          ✓ {result.tasksCreated} tasks created · {result.patientsAffected} patients updated
        </span>
      )}
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
      <button
        onClick={handleRunAgent}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all animate-agent-glow"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Running...
          </>
        ) : (
          <>⚡ Run AI Agent</>
        )}
      </button>
    </div>
  )
}
