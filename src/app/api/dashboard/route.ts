// src/app/api/dashboard/route.ts
// GET /api/dashboard — Returns aggregated metrics, priority tasks, and latest agent log

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, isOverdue } from '@/lib/utils'
import { addDays, startOfWeek, endOfWeek } from 'date-fns'
import type { DashboardResponse } from '@/types'
import { requireRole, checkSubscription } from '@/lib/auth/middleware-helpers'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireRole(req, ['OWNER', 'DOCTOR', 'STAFF'])
    if (auth.error) return auth.error
    const { clinicId } = auth.context!

    const subError = await checkSubscription(clinicId)
    if (subError) return subError

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    // Run all queries in parallel for performance
    const [
      activePatients,
      surgeriesThisWeek,
      overdueFollowUpPatients,
      revenuePending,
      highRiskPatients,
      priorityTasks,
      overdueTasks,
      latestAgentLog,
    ] = await Promise.all([
      // Active patients (not discharged)
      prisma.patient.count({
        where: {
          clinicId,
          status: { notIn: ['DISCHARGED'] },
        },
      }),

      // Surgeries this week
      prisma.patient.count({
        where: {
          clinicId,
          surgeryDate: { gte: weekStart, lte: weekEnd },
        },
      }),

      // POST_OP patients with no upcoming follow-up task
      prisma.patient.findMany({
        where: {
          clinicId,
          status: { in: ['POST_OP', 'FOLLOW_UP'] },
        },
        include: {
          procedure: true,
          tasks: {
            where: {
              type: 'FOLLOW_UP',
              dueDate: { gte: now, lte: addDays(now, 7) },
            },
          },
        },
      }),

      // Revenue pending (sum of PENDING + OVERDUE billing events)
      prisma.billingEvent.aggregate({
        where: {
          clinicId,
          status: { in: ['PENDING', 'OVERDUE'] },
        },
        _sum: { amount: true },
      }),

      // High risk patients (score >= 60)
      prisma.patient.count({
        where: {
          clinicId,
          riskScore: { gte: 60 },
          status: { notIn: ['DISCHARGED'] },
        },
      }),

      // Top priority pending/overdue tasks
      prisma.task.findMany({
        where: {
          clinicId,
          status: { in: ['PENDING', 'OVERDUE', 'IN_PROGRESS'] },
        },
        include: {
          patient: { select: { name: true } },
        },
        orderBy: [
          // Sort: URGENT first, then by due date
          { priority: 'asc' },  // URGENT sorts first alphabetically with this workaround
          { dueDate: 'asc' },
        ],
        take: 10,
      }),

      // Count overdue tasks
      prisma.task.count({
        where: {
          clinicId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: now },
        },
      }),

      // Latest agent log entry
      prisma.agentLog.findFirst({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Derive overdue follow-ups count from patients with no follow-up tasks
    const overdueFollowUpsCount = overdueFollowUpPatients.filter(
      (p) => !p.tasks || p.tasks.length === 0
    ).length

    const priorityTaskItems = priorityTasks.map((task) => ({
      id: task.id,
      title: task.title,
      patientName: task.patient?.name || 'Unknown',
      type: task.type,
      priority: task.priority,
      dueDate: task.dueDate?.toISOString() || '',
      isOverdue: task.dueDate ? isOverdue(task.dueDate) : false,
    }))

    // Build latest agent log summary
    const recentAgentLog = latestAgentLog
      ? {
        id: latestAgentLog.id,
        timestamp: latestAgentLog.createdAt.toISOString(),
        tasksCreated: latestAgentLog.tasksCreated,
        riskUpdates: latestAgentLog.riskUpdated,
        summary:
          (latestAgentLog.aiOutput as any)?.summary ??
          'AI agent analysis complete.',
      }
      : null

    const response: DashboardResponse = {
      metrics: {
        activePatients,
        surgeriesThisWeek,
        overdueFollowUps: overdueFollowUpsCount,
        revenuePending: revenuePending._sum?.amount ?? 0,
        riskAlerts: highRiskPatients,
        pendingTasks: priorityTasks.length,
        overdueTasks,
      },
      priorityTasks: priorityTaskItems,
      recentAgentLog,
    }

    return apiSuccess(response)
  } catch (error) {
    console.error('[GET /api/dashboard]', error)
    return apiError('Failed to load dashboard data')
  }
}
