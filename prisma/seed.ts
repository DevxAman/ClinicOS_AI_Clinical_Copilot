// prisma/seed.ts
// ClinicOS Graph – Comprehensive Seed Data

import { PrismaClient, DoctorRole, PatientStatus, TaskType, TaskStatus, Priority, BillingStatus, ProcedureCategory, SubscriptionStatus, PlanType } from '@prisma/client'
import { addDays, subDays } from 'date-fns'

const prisma = new PrismaClient()
const now = new Date()

async function main() {
  console.log('🌱 Starting seed...')

  // ── Cleanup ──────────────────────────────────────────────────────────────
  await prisma.agentLog.deleteMany()
  await prisma.billingEvent.deleteMany()
  await prisma.task.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.procedure.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.clinic.deleteMany()

  // ── Clinic ───────────────────────────────────────────────────────────────
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Apollo Hospital Delhi',
      slug: 'apollo-delhi',
      phone: '+91-11-20003000',
      email: 'contact@apollodelhi.com',
      city: 'Delhi',
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      planType: PlanType.ENTERPRISE,
      trialEndsAt: now,
    }
  })

  // ── Doctors (formerly Staff) ─────────────────────────────────────────────
  const drSharma = await prisma.doctor.create({
    data: {
      clinicId: clinic.id,
      name: 'Dr. Arjun Sharma',
      role: DoctorRole.OWNER,
      email: 'arjun.sharma@clinicos.app',
      phone: '+919800001111',
      specialty: 'Orthopaedics',
    },
  })

  const drSingh = await prisma.doctor.create({
    data: {
      clinicId: clinic.id,
      name: 'Dr. Priya Singh',
      role: DoctorRole.DOCTOR,
      email: 'priya.singh@clinicos.app',
      phone: '+919800002222',
      specialty: 'General Surgery',
    },
  })

  const nurseAnita = await prisma.doctor.create({
    data: {
      clinicId: clinic.id,
      name: 'Anita Rao',
      role: DoctorRole.STAFF,
      email: 'anita.rao@clinicos.app',
      phone: '+919800003333',
    },
  })

  const billingRohan = await prisma.doctor.create({
    data: {
      clinicId: clinic.id,
      name: 'Rohan Verma',
      role: DoctorRole.STAFF,
      email: 'rohan.verma@clinicos.app',
      phone: '+919800004444',
    },
  })

  console.log('✅ Clinic & Doctors seeded')

  // ── Procedures ───────────────────────────────────────────────────────────
  const kneeReplacement = await prisma.procedure.create({
    data: {
      clinicId: clinic.id,
      name: 'Total Knee Replacement',
      description: 'Surgical procedure to replace the weight-bearing surfaces of the knee joint',
      category: ProcedureCategory.ORTHOPAEDICS,
      durationMinutes: 120,
      preOpRequirements: [
        'Complete Blood Count (CBC)',
        'Electrocardiogram (ECG)',
        'Chest X-Ray',
        'Anaesthesia consultation',
        'Pre-op physiotherapy assessment',
        'Discontinue blood thinners 5 days prior',
      ],
      followUpSchedule: [
        { day: 1, description: 'Post-op wound check & drain removal assessment' },
        { day: 3, description: 'Wound dressing change & mobility assessment' },
        { day: 7, description: 'Suture check & physiotherapy commencement' },
        { day: 14, description: 'Wound review & ROM assessment' },
        { day: 30, description: 'One-month clinical review & X-ray' },
        { day: 90, description: 'Three-month functional assessment' },
      ],
      billingMilestones: [
        { name: 'Pre-op Consultation', amount: 4500, triggerEvent: 'PRE_OP_COMPLETE' },
        { name: 'Surgical Procedure', amount: 120000, triggerEvent: 'SURGERY_COMPLETE' },
        { name: 'Hospital Stay (3d)', amount: 45000, triggerEvent: 'DISCHARGE' },
        { name: 'Physiotherapy (10x)', amount: 12000, triggerEvent: 'FOLLOW_UP_START' },
        { name: 'Final Review', amount: 2500, triggerEvent: 'DISCHARGE_COMPLETE' },
      ],
    },
  })

  const lapChole = await prisma.procedure.create({
    data: {
      clinicId: clinic.id,
      name: 'Laparoscopic Cholecystectomy',
      description: 'Minimally invasive removal of the gallbladder using laparoscopic technique',
      category: ProcedureCategory.GENERAL_SURGERY,
      durationMinutes: 60,
      preOpRequirements: [
        'Ultrasound abdomen',
        'Liver function tests (LFT)',
        'Fasting 8 hours prior',
        'Anaesthesia fitness clearance',
      ],
      followUpSchedule: [
        { day: 1, description: 'Post-op vitals and diet progression check' },
        { day: 7, description: 'Port site wound review' },
        { day: 21, description: 'Final clinical review & diet normalization' },
      ],
      billingMilestones: [
        { name: 'Consultation Fee', amount: 2000, triggerEvent: 'PRE_OP_COMPLETE' },
        { name: 'Surgical Procedure', amount: 55000, triggerEvent: 'SURGERY_COMPLETE' },
        { name: 'Hospital Stay (1d)', amount: 12000, triggerEvent: 'DISCHARGE' },
      ],
    },
  })

  const cataract = await prisma.procedure.create({
    data: {
      clinicId: clinic.id,
      name: 'Phacoemulsification Cataract Surgery',
      description: 'Ultrasound emulsification and aspiration of the cataractous lens',
      category: ProcedureCategory.OPHTHALMOLOGY,
      durationMinutes: 30,
      preOpRequirements: [
        'Biometry (IOL power calculation)',
        'Keratometry',
        'Blood pressure check',
        'Pupil dilation drops (1 hour pre-op)',
      ],
      followUpSchedule: [
        { day: 1, description: 'Day-1 post-op IOP and vision check' },
        { day: 7, description: 'Week-1 slit lamp examination' },
        { day: 30, description: 'Final refraction and glasses prescription' },
      ],
      billingMilestones: [
        { name: 'Pre-op Assessment', amount: 1500, triggerEvent: 'PRE_OP_COMPLETE' },
        { name: 'Surgical Procedure + IOL', amount: 45000, triggerEvent: 'SURGERY_COMPLETE' },
        { name: 'Post-op Drops Kit', amount: 800, triggerEvent: 'DISCHARGE' },
      ],
    },
  })

  console.log('✅ Procedures seeded')

  // ── Patients ─────────────────────────────────────────────────────────────
  const aarav = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      name: 'Aarav Mehta',
      phone: '+919900001001',
      email: 'aarav.mehta@email.com',
      dateOfBirth: new Date('1972-04-15'),
      surgeryDate: subDays(now, 5),     // Surgery was 5 days ago → POST_OP
      status: PatientStatus.POST_OP,
      riskScore: 72,
      procedureId: kneeReplacement.id,
      doctorId: drSharma.id,
      notes: 'Diabetic. Monitor wound healing closely. No follow-up scheduled yet.',
    },
  })

  const priya = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      name: 'Priya Rajan',
      phone: '+919900001002',
      email: 'priya.rajan@email.com',
      dateOfBirth: new Date('1986-09-22'),
      surgeryDate: addDays(now, 3),     // Surgery in 3 days → SCHEDULED
      status: PatientStatus.SCHEDULED,
      riskScore: 35,
      procedureId: lapChole.id,
      doctorId: drSingh.id,
    },
  })

  const rekha = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      name: 'Rekha Kapoor',
      phone: '+919900001003',
      email: 'rekha.kapoor@email.com',
      dateOfBirth: new Date('1958-12-03'),
      surgeryDate: subDays(now, 14),    // Surgery 14 days ago → FOLLOW_UP
      status: PatientStatus.FOLLOW_UP,
      riskScore: 58,
      procedureId: kneeReplacement.id,
      doctorId: drSharma.id,
    },
  })

  const suresh = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      name: 'Suresh Nair',
      phone: '+919900001004',
      dateOfBirth: new Date('1945-07-11'),
      surgeryDate: subDays(now, 1),     // Surgery was yesterday → POST_OP
      status: PatientStatus.POST_OP,
      riskScore: 45,
      procedureId: cataract.id,
      doctorId: drSingh.id,
    },
  })

  const kavita = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      name: 'Kavita Iyer',
      phone: '+919900001005',
      email: 'kavita.iyer@email.com',
      dateOfBirth: new Date('1993-03-28'),
      surgeryDate: addDays(now, 10),    // Surgery in 10 days → PRE_OP
      status: PatientStatus.PRE_OP,
      riskScore: 20,
      procedureId: lapChole.id,
      doctorId: drSingh.id,
    },
  })

  const mohan = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      name: 'Mohan Das',
      phone: '+919900001006',
      dateOfBirth: new Date('1955-11-19'),
      surgeryDate: subDays(now, 30),    // 30 days ago → DISCHARGED
      status: PatientStatus.DISCHARGED,
      riskScore: 15,
      procedureId: cataract.id,
      doctorId: drSingh.id,
    },
  })

  console.log('✅ Patients seeded')

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const tasks = await prisma.task.createMany({
    data: [
      // ── Aarav Mehta (POST_OP - HIGH RISK) ──
      {
        clinicId: clinic.id,
        title: 'Schedule Day-5 post-op wound review',
        description: 'Patient is 5 days post Total Knee Replacement. No review scheduled. Diabetic — wound healing critical.',
        type: TaskType.FOLLOW_UP,
        dueDate: now,   // TODAY – overdue effectively
        status: TaskStatus.PENDING,
        priority: Priority.URGENT,
        patientId: aarav.id,
        assignedTo: nurseAnita.id,
        aiGenerated: false,
      },
      {
        clinicId: clinic.id,
        title: 'Physiotherapy commencement referral',
        description: 'Issue physiotherapy referral for TKR post-op rehabilitation',
        type: TaskType.FOLLOW_UP,
        dueDate: addDays(now, 2),
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        patientId: aarav.id,
        assignedTo: drSharma.id,
        aiGenerated: false,
      },
      {
        clinicId: clinic.id,
        title: 'Raise surgical procedure invoice',
        description: 'Invoice for Total Knee Replacement surgical fee: ₹1,20,000',
        type: TaskType.BILLING,
        dueDate: subDays(now, 3),   // OVERDUE
        status: TaskStatus.OVERDUE,
        priority: Priority.HIGH,
        patientId: aarav.id,
        assignedTo: billingRohan.id,
        aiGenerated: false,
      },

      // ── Priya Rajan (SCHEDULED) ──
      {
        clinicId: clinic.id,
        title: 'Confirm ultrasound abdomen report received',
        description: 'Pre-op requirement: USG abdomen must be available before surgery',
        type: TaskType.PRE_OP,
        dueDate: subDays(now, 1),   // Should have been done yesterday
        status: TaskStatus.PENDING,
        priority: Priority.URGENT,
        patientId: priya.id,
        assignedTo: nurseAnita.id,
        aiGenerated: false,
      },
      {
        clinicId: clinic.id,
        title: 'Anaesthesia fitness clearance',
        description: 'Pre-op anaesthesia consultation mandatory before laparoscopic procedure',
        type: TaskType.PRE_OP,
        dueDate: now,
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        patientId: priya.id,
        assignedTo: drSingh.id,
        aiGenerated: false,
      },

      // ── Rekha Kapoor (FOLLOW_UP) ──
      {
        clinicId: clinic.id,
        title: '2-week post-op clinical review',
        description: 'Routine 14-day suture review and ROM assessment',
        type: TaskType.FOLLOW_UP,
        dueDate: subDays(now, 2),   // OVERDUE
        status: TaskStatus.OVERDUE,
        priority: Priority.HIGH,
        patientId: rekha.id,
        assignedTo: drSharma.id,
        aiGenerated: false,
      },
      {
        clinicId: clinic.id,
        title: 'Chase overdue physiotherapy invoice',
        description: 'Physiotherapy billing of ₹12,000 overdue by 8 days',
        type: TaskType.BILLING,
        dueDate: subDays(now, 8),   // OVERDUE
        status: TaskStatus.OVERDUE,
        priority: Priority.MEDIUM,
        patientId: rekha.id,
        assignedTo: billingRohan.id,
        aiGenerated: false,
      },

      // ── Kavita Iyer (PRE_OP) ──
      {
        clinicId: clinic.id,
        title: 'Confirm LFT results',
        description: 'Liver function tests required before laparoscopic cholecystectomy',
        type: TaskType.PRE_OP,
        dueDate: addDays(now, 5),
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        patientId: kavita.id,
        assignedTo: nurseAnita.id,
        aiGenerated: false,
      },
    ],
  })

  console.log('✅ Tasks seeded')

  // ── Billing Events ────────────────────────────────────────────────────────
  await prisma.billingEvent.createMany({
    data: [
      // Aarav Mehta
      {
        clinicId: clinic.id,
        description: 'Pre-op Consultation Fee',
        amount: 4500,
        status: BillingStatus.PAID,
        dueDate: subDays(now, 8),
        paidAt: subDays(now, 7),
        patientId: aarav.id,
        invoiceRef: 'INV-2026-001',
      },
      {
        clinicId: clinic.id,
        description: 'Total Knee Replacement – Surgical Fee',
        amount: 120000,
        status: BillingStatus.PENDING,
        dueDate: now,
        patientId: aarav.id,
        invoiceRef: 'INV-2026-002',
      },
      {
        clinicId: clinic.id,
        description: 'Hospital Stay (3 days)',
        amount: 45000,
        status: BillingStatus.PENDING,
        dueDate: addDays(now, 3),
        patientId: aarav.id,
        invoiceRef: 'INV-2026-003',
      },

      // Rekha Kapoor
      {
        clinicId: clinic.id,
        description: 'Total Knee Replacement – Surgical Fee',
        amount: 120000,
        status: BillingStatus.PAID,
        dueDate: subDays(now, 12),
        paidAt: subDays(now, 10),
        patientId: rekha.id,
        invoiceRef: 'INV-2026-004',
      },
      {
        clinicId: clinic.id,
        description: 'Physiotherapy Programme (10 sessions)',
        amount: 12000,
        status: BillingStatus.OVERDUE,
        dueDate: subDays(now, 8),
        patientId: rekha.id,
        invoiceRef: 'INV-2026-005',
      },
      {
        clinicId: clinic.id,
        description: 'Post-op Medications',
        amount: 3200,
        status: BillingStatus.OVERDUE,
        dueDate: subDays(now, 5),
        patientId: rekha.id,
        invoiceRef: 'INV-2026-006',
      },

      // Suresh Nair
      {
        clinicId: clinic.id,
        description: 'Cataract Surgery + Premium IOL',
        amount: 45000,
        status: BillingStatus.PENDING,
        dueDate: addDays(now, 7),
        patientId: suresh.id,
        invoiceRef: 'INV-2026-007',
      },

      // Priya Rajan
      {
        clinicId: clinic.id,
        description: 'Pre-op Consultation',
        amount: 2000,
        status: BillingStatus.PAID,
        dueDate: subDays(now, 5),
        paidAt: subDays(now, 4),
        patientId: priya.id,
        invoiceRef: 'INV-2026-008',
      },
    ],
  })

  console.log('✅ Billing events seeded')

  // ── Agent Log (sample historical run) ────────────────────────────────────
  await prisma.agentLog.create({
    data: {
      clinicId: clinic.id,
      rawQueryResults: {
        overdueFollowUps: [
          { patientId: aarav.id, name: 'Aarav Mehta', daysSinceSurgery: 5, hasFollowUp: false },
        ],
        missingPreOps: [
          { patientId: priya.id, name: 'Priya Rajan', missingRequirements: ['Ultrasound abdomen', 'Anaesthesia clearance'] },
        ],
        pendingPayments: [
          { patientId: rekha.id, name: 'Rekha Kapoor', totalOverdue: 15200, overdueByDays: 8 },
        ],
      },
      aiOutput: {
        priorityIssues: [
          { severity: 'HIGH', issue: 'Post-op patient Aarav Mehta (Day 5 TKR) has no follow-up scheduled. Diabetic — elevated wound complication risk.' },
          { severity: 'HIGH', issue: 'Priya Rajan surgery in 3 days but missing critical pre-op requirements.' },
          { severity: 'MEDIUM', issue: 'Rekha Kapoor has ₹15,200 in overdue billing across 2 invoices.' },
        ],
        recommendedTasks: [
          { patientId: aarav.id, title: 'Immediate post-op wound review – A. Mehta', type: 'FOLLOW_UP', priority: 'URGENT', dueDate: 'today' },
          { patientId: priya.id, title: 'Confirm USG abdomen report – P. Rajan', type: 'PRE_OP', priority: 'URGENT', dueDate: 'today' },
        ],
        riskUpdated: [
          { patientId: aarav.id, newRiskScore: 72, reason: 'Day 5 post-op TKR, diabetic, no follow-up scheduled' },
        ],
        communicationDrafts: [
          { patientId: rekha.id, channel: 'SMS', message: 'Dear Rekha, you have a pending invoice. Please contact our billing team at 1800-CLINICOS.' },
        ],
      },
      actionsExecuted: {
        tasksCreated: 0,
        riskScoresUpdated: ['aarav.id'],
        agentLogStored: true,
      },
      tasksCreated: 0,
      riskUpdated: 1,
      
      durationMs: 2840,
    },
  })

  console.log('✅ Agent log seeded')
  console.log('\n🎉 Seed complete!')
  console.log(`   Staff: 4 | Procedures: 3 | Patients: 6 | Tasks: 8 | Billing Events: 8`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
