// src/lib/agent.ts
// ClinicOS Graph – AI Agent Core Logic
// Handles: DB queries → AI prompt → parse response → execute actions → log

import { prisma } from './prisma'
import OpenAI from 'openai'
import { differenceInDays, addDays, isAfter, isBefore } from 'date-fns'
import type {
  AgentQueryPayload,
  AgentAIResponse,
  AgentExecutionResult,
} from '@/types'

export interface OverdueFollowUpItem {
  patientId: string
  name: string
  procedure: string
  surgeryDate: string
  daysSinceSurgery: number
  riskScore: number
  hasScheduledReview: boolean
  isHighRisk: boolean
}

export interface MissingPreOpItem {
  patientId: string
  name: string
  procedure: string
  surgeryDate: string
  daysUntilSurgery: number
  missingRequirements: string[]
  completedRequirements: string[]
}

export interface PendingPaymentItem {
  patientId: string
  name: string
  totalOverdueAmount: number
  overdueInvoices: {
    invoiceRef: string
    description: string
    amount: number
    overdueDays: number
  }[]
}

export interface RecentSurgeryItem {
  patientId: string
  name: string
  procedure: string
  surgeryDate: string
  currentStatus: string
  riskScore: number
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// ─── STEP 1: QUERY DATABASE ──────────────────────────────────────────────────

async function queryOperationalGaps(clinicId: string): Promise<AgentQueryPayload> {
  const now = new Date()

  // 1a. POST_OP patients with no follow-up task in the next 7 days
  const postOpPatients = await prisma.patient.findMany({
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
  })

  const overdueFollowUps: OverdueFollowUpItem[] = postOpPatients
    .filter((p) => p.surgeryDate && (!p.tasks || p.tasks.length === 0))
    .map((p) => ({
      patientId: p.id,
      name: p.name,
      procedure: p.procedure?.name || 'Unknown',
      surgeryDate: p.surgeryDate!.toISOString(),
      daysSinceSurgery: differenceInDays(now, p.surgeryDate!),
      riskScore: p.riskScore,
      hasScheduledReview: false,
      isHighRisk: p.riskScore >= 60,
    }))

  // 1b. SCHEDULED/PRE_OP patients with missing pre-op tasks
  const preOpPatients = await prisma.patient.findMany({
    where: {
      clinicId,
      status: { in: ['PRE_OP', 'SCHEDULED'] },
      surgeryDate: { gte: now, lte: addDays(now, 14) }, // Surgery within 14 days
    },
    include: {
      procedure: true,
      tasks: {
        where: {
          type: 'PRE_OP',
        },
      },
    },
  })

  const missingPreOps: MissingPreOpItem[] = preOpPatients
    .map((p) => {
      const requirements = (p.procedure?.preOpRequirements as string[]) || []
      const completedTitles = p.tasks
        ? p.tasks.filter((t) => t.status === 'COMPLETED').map((t) => t.title)
        : []
      const pendingTitles = p.tasks
        ? p.tasks.filter((t) => t.status !== 'COMPLETED').map((t) => t.title)
        : []

      // Identify requirements not yet covered by any task
      const missing = requirements.filter(
        (req) => !p.tasks || !p.tasks.some((t) => t.title.toLowerCase().includes(req.toLowerCase().substring(0, 10)))
      )

      return {
        patientId: p.id,
        name: p.name,
        procedure: p.procedure?.name || 'Unknown',
        surgeryDate: p.surgeryDate!.toISOString(),
        daysUntilSurgery: differenceInDays(p.surgeryDate!, now),
        missingRequirements: missing,
        completedRequirements: completedTitles,
      }
    })
    .filter((p) => p.missingRequirements.length > 0)

  // 1c. Overdue billing (> 7 days past due date)
  const overdueBilling = await prisma.billingEvent.findMany({
    where: {
      clinicId,
      status: { in: ['PENDING', 'OVERDUE'] },
      dueDate: { lt: addDays(now, -7) }, // More than 7 days overdue
    },
    include: { patient: true },
  })

  // Group by patient
  const billingByPatient = overdueBilling.reduce<Record<string, PendingPaymentItem>>(
    (acc, event) => {
      if (!acc[event.patientId]) {
        acc[event.patientId] = {
          patientId: event.patientId,
          name: event.patient.name,
          totalOverdueAmount: 0,
          overdueInvoices: [],
        }
      }
      acc[event.patientId].totalOverdueAmount += event.amount
      acc[event.patientId].overdueInvoices.push({
        invoiceRef: event.invoiceRef ?? 'N/A',
        description: event.description,
        amount: event.amount,
        overdueDays: differenceInDays(now, new Date(event.dueDate!)),
      })
      return acc
    },
    {}
  )
  const pendingPayments: PendingPaymentItem[] = Object.values(billingByPatient)

  // 1d. Recent surgeries (last 7 days) without post-op review
  const recentSurgeries = await prisma.patient.findMany({
    where: {
      clinicId,
      surgeryDate: { gte: addDays(now, -7), lte: now },
      status: { in: ['POST_OP', 'FOLLOW_UP'] },
    },
    include: {
      procedure: true,
      tasks: {
        where: {
          type: 'FOLLOW_UP'
        }
      }
    },
  })

  const recentSurgeriesMapped: RecentSurgeryItem[] = recentSurgeries.map((p) => ({
    patientId: p.id,
    name: p.name,
    procedure: p.procedure?.name || 'Unknown',
    surgeryDate: p.surgeryDate!.toISOString(),
    currentStatus: p.status,
    riskScore: p.riskScore,
  }))

  return {
    overdueFollowUps,
    missingPreOps,
    pendingPayments,
    recentSurgeries: recentSurgeriesMapped,
  }
}

// ─── STEP 2: BUILD STRUCTURED AI PROMPT ──────────────────────────────────────

function buildAgentPrompt(payload: AgentQueryPayload): string {
  const now = new Date()
  return `You are ClinicOS AI — an intelligent clinical operations assistant for a surgical specialty clinic.

Analyze the following operational data and return a structured JSON response identifying priority issues, recommending tasks, updating risk scores, and drafting patient communications.

## CURRENT DATE
${now.toISOString()}

## OPERATIONAL DATA

### Patients with Overdue Follow-ups (Post-Op, No Review Scheduled)
${JSON.stringify(payload.overdueFollowUps, null, 2)}

### Patients Missing Pre-Op Requirements (Surgery Within 14 Days)
${JSON.stringify(payload.missingPreOps, null, 2)}

### Overdue Billing (> 7 Days Past Due)
${JSON.stringify(payload.pendingPayments, null, 2)}

### Recent Surgeries (Last 7 Days)
${JSON.stringify(payload.recentSurgeries, null, 2)}

## INSTRUCTIONS
1. Identify the top priority clinical and operational issues
2. Recommend specific, actionable tasks to resolve each gap
3. Update risk scores for patients based on clinical evidence (0-100)
4. Draft short patient communication messages where appropriate
5. Provide a concise 2-3 sentence operational summary

## RESPONSE FORMAT
Respond ONLY with valid JSON matching this exact structure. No markdown, no preamble:

{
  "priorityIssues": [
    {
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "patientId": "string",
      "patientName": "string",
      "issue": "string",
      "recommendedAction": "string"
    }
  ],
  "recommendedTasks": [
    {
      "patientId": "string",
      "patientName": "string",
      "title": "string",
      "description": "string",
      "type": "PRE_OP|FOLLOW_UP|BILLING|REVIEW|COMMUNICATION",
      "priority": "URGENT|HIGH|MEDIUM|LOW",
      "dueInDays": 0
    }
  ],
  "riskUpdates": [
    {
      "patientId": "string",
      "patientName": "string",
      "currentRiskScore": 0,
      "newRiskScore": 0,
      "reason": "string"
    }
  ],
  "communicationDrafts": [
    {
      "patientId": "string",
      "patientName": "string",
      "channel": "SMS|EMAIL|CALL",
      "subject": "string or null",
      "message": "string"
    }
  ],
  "summary": "string"
}`
}

// ─── STEP 3: CALL AI MODEL ────────────────────────────────────────────────────

async function callAIModel(prompt: string): Promise<AgentAIResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const text = response.choices[0].message.content || '{}'

  // Strip any accidental markdown fences
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as AgentAIResponse
    return validateAIResponse(parsed)
  } catch (err) {
    console.error('Failed to parse AI response:', cleaned)
    throw new Error(`AI response was not valid JSON: ${err}`)
  }
}

// Validate and sanitize the AI response shape
function validateAIResponse(raw: Partial<AgentAIResponse>): AgentAIResponse {
  return {
    priorityIssues: Array.isArray(raw.priorityIssues) ? raw.priorityIssues : [],
    recommendedTasks: Array.isArray(raw.recommendedTasks) ? raw.recommendedTasks : [],
    riskUpdates: Array.isArray(raw.riskUpdates) ? raw.riskUpdates : [],
    communicationDrafts: Array.isArray(raw.communicationDrafts) ? raw.communicationDrafts : [],
  }
}

// ─── STEP 4: EXECUTE ACTIONS ──────────────────────────────────────────────────

async function executeAgentActions(
  clinicId: string,
  aiResponse: AgentAIResponse
): Promise<{ tasksCreated: number; riskUpdates: number; patientsAffected: Set<string> }> {
  let tasksCreated = 0
  let riskUpdates = 0
  const patientsAffected = new Set<string>()

  const now = new Date()

  // 4a. Auto-create recommended tasks
  for (const rec of aiResponse.recommendedTasks) {
    // Check if an identical task already exists to avoid duplicates
    const existing = await prisma.task.findFirst({
      where: {
        clinicId,
        patientId: rec.patientId,
        title: rec.title,
      },
    })

    if (!existing) {
      await prisma.task.create({
        data: {
          clinicId,
          title: rec.title,
          description: '', // description not typed
          type: rec.type as any,
          priority: rec.priority as any,
          dueDate: rec.dueDate ? new Date(rec.dueDate) : addDays(now, 7),
          status: 'PENDING',
          patientId: rec.patientId,
          aiGenerated: true,
        },
      })
      tasksCreated++
      patientsAffected.add(rec.patientId)
    }
  }

  // 4b. Update patient risk scores
  for (const update of aiResponse.riskUpdates) {
    if (update.newRiskScore) {
      await prisma.patient.update({
        where: { id: update.patientId },
        data: { riskScore: Math.min(100, Math.max(0, update.newRiskScore)) },
      })
      riskUpdates++
      patientsAffected.add(update.patientId)
    }
  }

  // 4c. Also mark billing events as OVERDUE where they should be
  await prisma.billingEvent.updateMany({
    where: {
      clinicId,
      status: 'PENDING',
      dueDate: { lt: now },
    },
    data: { status: 'OVERDUE' },
  })

  return { tasksCreated, riskUpdates, patientsAffected }
}

// ─── STEP 5: LOG TO AGENT LOG TABLE ──────────────────────────────────────────

async function logAgentRun(
  clinicId: string,
  queryPayload: AgentQueryPayload,
  aiResponse: AgentAIResponse,
  actions: { tasksCreated: number; riskUpdates: number; patientsAffected: Set<string> },
  durationMs: number,
  triggerType: string
) {
  return prisma.agentLog.create({
    data: {
      clinicId,
      rawQueryResults: queryPayload as any,
      aiOutput: aiResponse as any,
      actionsExecuted: {
        tasksCreated: actions.tasksCreated,
        riskScoresUpdated: actions.riskUpdates,
        patientsAffected: Array.from(actions.patientsAffected),
        billingStatusesUpdated: true,
      } as any,
      tasksCreated: actions.tasksCreated,
      riskUpdated: actions.riskUpdates,
      durationMs,
    },
  })
}

// ─── MAIN AGENT RUNNER ────────────────────────────────────────────────────────

export async function runAgent(
  clinicId: string,
  triggerType: string = 'MANUAL'
): Promise<AgentExecutionResult> {
  const startTime = Date.now()

  // Step 1: Query DB for operational gaps
  const queryPayload = await queryOperationalGaps(clinicId)

  // Step 2: Build prompt and call AI
  const prompt = buildAgentPrompt(queryPayload)
  const aiResponse = await callAIModel(prompt)

  // Step 3: Execute actions (create tasks, update risks)
  const actions = await executeAgentActions(clinicId, aiResponse)

  const durationMs = Date.now() - startTime

  // Step 4: Log everything to AgentLog
  const logEntry = await logAgentRun(
    clinicId,
    queryPayload,
    aiResponse,
    actions,
    durationMs,
    triggerType
  )

  return {
    tasksCreated: actions.tasksCreated,
    riskUpdates: actions.riskUpdates,
    patientsAffected: actions.patientsAffected.size,
  }
}
