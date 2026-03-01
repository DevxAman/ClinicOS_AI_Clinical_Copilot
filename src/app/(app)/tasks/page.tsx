// src/app/tasks/page.tsx

import { prisma } from '@/lib/prisma'
import { formatDate, isOverdue, cn } from '@/lib/utils'

async function getTasks() {
  const now = new Date()

  // Auto-update overdue tasks
  await prisma.task.updateMany({
    where: { status: { in: ['PENDING'] }, dueDate: { lt: now } },
    data: { status: 'OVERDUE' },
  })

  return prisma.task.findMany({
    include: {
      patient: { select: { name: true, riskScore: true } },
      doctor: { select: { name: true } },
    },
    orderBy: [{ dueDate: 'asc' }],
  })
}

const typeColors: Record<string, string> = {
  PRE_OP: 'bg-blue-500/15 text-blue-400',
  FOLLOW_UP: 'bg-teal-500/15 text-teal-400',
  BILLING: 'bg-yellow-500/15 text-yellow-400',
  REVIEW: 'bg-purple-500/15 text-purple-400',
  COMMUNICATION: 'bg-pink-500/15 text-pink-400',
}

const priorityDot: Record<string, string> = {
  URGENT: 'bg-red-400',
  HIGH: 'bg-orange-400',
  MEDIUM: 'bg-yellow-400',
  LOW: 'bg-green-400',
}

const statusColors: Record<string, string> = {
  PENDING: 'text-white/50',
  IN_PROGRESS: 'text-blue-400',
  COMPLETED: 'text-green-400',
  OVERDUE: 'text-red-400',
  CANCELLED: 'text-white/20',
}

export default async function TasksPage() {
  const tasks = await getTasks()

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
    overdue: tasks.filter((t) => t.status === 'OVERDUE').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    aiGenerated: tasks.filter((t) => t.aiGenerated).length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Tasks</h1>
          <p className="text-sm text-white/40 mt-0.5">{stats.total} total · {stats.overdue} overdue</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          + Add Task
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: stats.pending, color: 'text-white/60' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-400' },
          { label: 'Completed', value: stats.completed, color: 'text-green-400' },
          { label: 'AI Generated', value: stats.aiGenerated, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
            <div className="text-[10px] text-white/35 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="glass-card divide-y divide-white/[0.04]">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityDot[task.priority] ?? 'bg-white/20')} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/85">{task.title}</span>
                {task.aiGenerated && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/25">
                    AI
                  </span>
                )}
              </div>
              <div className="text-[10px] text-white/35 mt-0.5">
                {task.patient.name}
                {task.doctor && ` · Assigned: ${task.doctor.name}`}
              </div>
            </div>

            <span className={cn('text-[10px] font-semibold px-2 py-1 rounded', typeColors[task.type] ?? 'bg-white/10 text-white/40')}>
              {task.type.replace('_', ' ')}
            </span>

            <span className={cn('text-xs font-medium min-w-[72px] text-right', statusColors[task.status] ?? '')}>
              {task.status === 'OVERDUE' ? '⚠ Overdue' : task.status}
            </span>

            <span className="text-xs text-white/30 min-w-[80px] text-right">
              {task.dueDate ? formatDate(task.dueDate) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
