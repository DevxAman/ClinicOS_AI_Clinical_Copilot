// src/app/agent-log/page.tsx

import { prisma } from '@/lib/prisma'
import { formatDateTime, timeAgo } from '@/lib/utils'

async function getAgentLogs() {
  return prisma.agentLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

export default async function AgentLogPage() {
  const logs = await getAgentLogs()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Agent Log</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Full transparency into every AI agent execution
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-white/30">No agent runs yet. Click "Run AI Agent" on the dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const aiOutput = log.aiOutput as any
            const rawQuery = log.rawQueryResults as any
            const actions = log.actionsExecuted as any

            return (
              <div key={log.id} className="glass-card p-5 space-y-4">
                {/* Log Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm font-semibold text-white">
                      Agent Run
                    </span>
                    <span className="text-xs text-white/30 font-mono">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.durationMs && (
                      <span className="text-[10px] font-mono text-white/25 px-2 py-1 rounded bg-white/5">
                        {(log.durationMs / 1000).toFixed(2)}s
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-1 rounded bg-green-500/15 text-green-400 font-semibold">
                      {log.tasksCreated} tasks · {log.riskUpdated} risk updates
                    </span>
                  </div>
                </div>

                {/* AI Summary */}
                {aiOutput?.summary && (
                  <div className="bg-blue-500/[0.06] border border-blue-500/15 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-widest text-blue-400/70 mb-1.5 font-bold">
                      AI Summary
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed">{aiOutput.summary}</p>
                  </div>
                )}

                {/* Three columns: Query | AI Output | Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Raw Query Results */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">
                      DB Query Results
                    </div>
                    <pre className="text-[10px] font-mono text-white/45 overflow-auto max-h-48 leading-relaxed">
                      {JSON.stringify(rawQuery, null, 2)}
                    </pre>
                  </div>

                  {/* AI Output */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">
                      AI Output
                    </div>
                    {aiOutput?.priorityIssues?.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {aiOutput.priorityIssues.map((issue: any, i: number) => (
                          <div key={i} className="text-[10px] text-white/50">
                            <span className={`font-bold ${issue.severity === 'CRITICAL' ? 'text-red-400' :
                                issue.severity === 'HIGH' ? 'text-orange-400' :
                                  issue.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                              [{issue.severity}]
                            </span>{' '}
                            {issue.issue}
                          </div>
                        ))}
                      </div>
                    )}
                    <pre className="text-[10px] font-mono text-white/40 overflow-auto max-h-36 leading-relaxed">
                      {JSON.stringify({ recommendedTasks: aiOutput?.recommendedTasks, riskUpdates: aiOutput?.riskUpdates }, null, 2)}
                    </pre>
                  </div>

                  {/* Actions Executed */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">
                      Actions Executed
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">
                          CREATE_TASK
                        </span>
                        <span className="text-[10px] text-white/40">{log.tasksCreated} created</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">
                          UPDATE_RISK
                        </span>
                        <span className="text-[10px] text-white/40">{log.riskUpdated} patients</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          LOG_ENTRY
                        </span>
                        <span className="text-[10px] text-white/40">stored</span>
                      </div>
                    </div>
                    <pre className="text-[10px] font-mono text-white/35 overflow-auto max-h-32 leading-relaxed mt-2">
                      {JSON.stringify(actions, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
