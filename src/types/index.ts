// src/types/index.ts
// ClinicOS — Shared TypeScript types

// ─── JWT Payloads ────────────────────────────────────────────────────────────

export interface DoctorJWTPayload {
  userId: string     // doctorId
  clinicId: string
  role: 'OWNER' | 'DOCTOR' | 'STAFF'
  userType: 'DOCTOR'
  iat?: number
  exp?: number
}

export interface PatientJWTPayload {
  patientId: string
  clinicId: string
  role: 'PATIENT'
  userType: 'PATIENT'
  iat?: number
  exp?: number
}

export type JWTPayload = DoctorJWTPayload | PatientJWTPayload

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// ─── Auth Context (attached to req by middleware) ─────────────────────────────

export interface AuthContext {
  userId: string       // doctorId or patientId
  clinicId: string
  role: 'OWNER' | 'DOCTOR' | 'STAFF' | 'PATIENT'
  userType: 'DOCTOR' | 'PATIENT'
}

// ─── Subscription ─────────────────────────────────────────────────────────────

// ─── Agent Payload Types ──────────────────────────────────────────────────
export interface AgentQueryPayload {
  overdueFollowUps: any[]
  missingPreOps: any[]
  pendingPayments: any[]
  recentSurgeries: any[]
}

export interface AgentAIResponse {
  priorityIssues: Array<{ severity: string; issue: string }>
  recommendedTasks: Array<{ patientId: string; title: string; type: string; priority: string; dueDate?: string }>
  riskUpdates: Array<{ patientId: string; newRiskScore: number; reason: string }>
  communicationDrafts: Array<{ patientId: string; channel: string; message: string }>
}

export interface AgentExecutionResult {
  tasksCreated: number
  riskUpdates: number
  patientsAffected: number
}

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED'
export type PlanType = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
export interface PriorityTask {
  id: string
  title: string
  patientName: string
  type: string
  priority: string
  dueDate: string
  isOverdue: boolean
}

export interface AgentLogSummary {
  id: string
  timestamp: string
  tasksCreated: number
  riskUpdates: number
  summary: string
}

export interface DashboardMetrics {
  activePatients: number
  surgeriesThisWeek: number
  overdueFollowUps: number
  revenuePending: number
  riskAlerts: number
  pendingTasks: number
  overdueTasks: number
}

export interface DashboardResponse {
  metrics: DashboardMetrics
  priorityTasks: PriorityTask[]
  recentAgentLog: AgentLogSummary | null
}
