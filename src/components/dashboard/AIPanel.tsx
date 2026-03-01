// src/components/dashboard/AIPanel.tsx

import { timeAgo } from '@/lib/utils'

interface AILog {
  id: string
  timestamp: string
  tasksCreated: number
  riskUpdates: number
  patientsAffected: number
  summary: string
  durationMs: number | null
}

interface Metrics {
  overdueFollowUps: number
  highRiskPatients: number
  overdueTasks: number
  revenuePending: number
}

interface AIPanelProps {
  agentLog: AILog | null
  metrics: Metrics
}

export default function AIPanel({ agentLog, metrics }: AIPanelProps) {
  return (
    <div className="glass-card p-4 border border-blue-500/20 bg-blue-500/[0.04]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">
          AI Daily Summary
        </h3>
        {agentLog && (
          <span className="ml-auto text-[10px] text-white/25 font-mono">
            {timeAgo(agentLog.timestamp)}
          </span>
        )}
      </div>

      {agentLog ? (
        <div className="space-y-3">
          {/* AI Summary Text */}
          <p className="text-sm text-white/60 leading-relaxed">
            {agentLog.summary}
          </p>

          {/* Action Badges */}
          <div className="flex flex-wrap gap-2">
            {agentLog.tasksCreated > 0 && (
              <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/25 font-semibold">
                {agentLog.tasksCreated} tasks created
              </span>
            )}
            {agentLog.riskUpdates > 0 && (
              <span className="text-[10px] px-2 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-500/25 font-semibold">
                {agentLog.riskUpdates} risk scores updated
              </span>
            )}
            {agentLog.patientsAffected > 0 && (
              <span className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/25 font-semibold">
                {agentLog.patientsAffected} patients affected
              </span>
            )}
            {agentLog.durationMs && (
              <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/30 font-mono">
                {(agentLog.durationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>

          {/* Current Alerts */}
          {(metrics.overdueFollowUps > 0 || metrics.overdueTasks > 0) && (
            <div className="border-t border-white/[0.06] pt-3 space-y-1.5">
              {metrics.overdueFollowUps > 0 && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <span>⚠</span>
                  <span>{metrics.overdueFollowUps} post-op patient(s) without scheduled follow-up</span>
                </div>
              )}
              {metrics.overdueTasks > 0 && (
                <div className="flex items-center gap-2 text-xs text-orange-400">
                  <span>⚠</span>
                  <span>{metrics.overdueTasks} task(s) past their due date</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-white/30 mb-3">No agent run yet.</p>
          <p className="text-xs text-white/20">Click "Run AI Agent" to start your first analysis.</p>
        </div>
      )}
    </div>
  )
}
