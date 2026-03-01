// src/app/dashboard/page.tsx
// Server Component — fetches data server-side, no loading flicker

import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateTime, timeAgo, isOverdue } from '@/lib/utils'
import { addDays, startOfWeek, endOfWeek } from 'date-fns'
import RunAgentButton from '@/components/dashboard/RunAgentButton'
import MetricCard from '@/components/dashboard/MetricCard'
import PriorityTaskList from '@/components/dashboard/PriorityTaskList'
import AIPanel from '@/components/dashboard/AIPanel'

// Fetch all dashboard data server-side
async function getDashboardData() {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const [
    activePatients,
    surgeriesThisWeek,
    revenuePending,
    highRiskPatients,
    postOpWithNoFollowUp,
    overdueTasks,
    priorityTasks,
    latestAgentLog,
  ] = await Promise.all([
    prisma.patient.count({
      where: { status: { notIn: ['DISCHARGED'] } },
    }),
    prisma.patient.count({
      where: { surgeryDate: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.billingEvent.aggregate({
      where: { status: { in: ['PENDING', 'OVERDUE'] } },
      _sum: { amount: true },
    }),
    prisma.patient.count({
      where: {
        riskScore: { gte: 60 },
        status: { notIn: ['DISCHARGED'] },
      },
    }),
    // POST_OP patients with no follow-up in the next 7 days
    prisma.patient.count({
      where: {
        status: { in: ['POST_OP', 'FOLLOW_UP'] },
        tasks: {
          none: {
            type: 'FOLLOW_UP',
            status: { not: 'COMPLETED' },
            dueDate: { gte: now, lte: addDays(now, 7) },
          },
        },
      },
    }),
    prisma.task.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
    }),
    prisma.task.findMany({
      where: { status: { in: ['PENDING', 'OVERDUE', 'IN_PROGRESS'] } },
      include: { patient: { select: { name: true } } },
      orderBy: [{ dueDate: 'asc' }],
      take: 8,
    }),
    prisma.agentLog.findFirst({
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    metrics: {
      activePatients,
      surgeriesThisWeek,
      revenuePending: revenuePending._sum.amount ?? 0,
      highRiskPatients,
      overdueFollowUps: postOpWithNoFollowUp,
      overdueTasks,
    },
    priorityTasks: priorityTasks.map((t) => ({
      id: t.id,
      title: t.title,
      patientName: t.patient.name,
      type: t.type,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString() : '',
      isOverdue: t.dueDate ? isOverdue(t.dueDate) : false,
      aiGenerated: t.aiGenerated,
    })),
    latestAgentLog: latestAgentLog
      ? {
        id: latestAgentLog.id,
        timestamp: latestAgentLog.createdAt.toISOString(),
        tasksCreated: latestAgentLog.tasksCreated,
        riskUpdates: latestAgentLog.riskUpdated,
        patientsAffected: 0,
          summary: (latestAgentLog.aiOutput as any)?.summary ?? 'Awaiting first agent run.',
        durationMs: latestAgentLog.durationMs,
      }
      : null,
  }
}

const priorityColors = {
  URGENT: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const taskTypeLabels: Record<string, string> = {
  PRE_OP: 'Pre-Op',
  FOLLOW_UP: 'Follow-Up',
  BILLING: 'Billing',
  REVIEW: 'Review',
  COMMUNICATION: 'Comms',
}

export default async function DashboardPage() {
  const { metrics, priorityTasks, latestAgentLog } = await getDashboardData()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Good morning, Dr. Sharma</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {latestAgentLog
              ? `Last AI scan: ${timeAgo(latestAgentLog.timestamp)} · ${latestAgentLog.tasksCreated} tasks created`
              : 'No agent run yet'}
          </p>
        </div>
        <RunAgentButton />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label="Active Patients"
          value={metrics.activePatients}
          change="+3 this week"
          color="blue"
        />
        <MetricCard
          label="Surgeries This Week"
          value={metrics.surgeriesThisWeek}
          change="2 upcoming"
          color="green"
        />
        <MetricCard
          label="Overdue Follow-ups"
          value={metrics.overdueFollowUps}
          change="needs attention"
          color={metrics.overdueFollowUps > 0 ? 'red' : 'green'}
        />
        <MetricCard
          label="Revenue Pending"
          value={formatCurrency(metrics.revenuePending)}
          change="unpaid invoices"
          color="yellow"
          isString
        />
        <MetricCard
          label="Risk Alerts"
          value={metrics.highRiskPatients}
          change="score ≥ 60"
          color={metrics.highRiskPatients > 0 ? 'orange' : 'green'}
        />
        <MetricCard
          label="Overdue Tasks"
          value={metrics.overdueTasks}
          change="past due date"
          color={metrics.overdueTasks > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Main Content: AI Panel + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Daily Summary */}
        <AIPanel
          agentLog={latestAgentLog}
          metrics={metrics}
        />

        {/* Priority Task List */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">
              Priority Tasks
            </h3>
            <a href="/tasks" className="text-xs text-blue-400 hover:text-blue-300">
              View all →
            </a>
          </div>
          <PriorityTaskList tasks={priorityTasks} />
        </div>
      </div>
    </div>
  )
}
