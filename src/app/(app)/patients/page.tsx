// src/app/patients/page.tsx

import { prisma } from '@/lib/prisma'
import { formatDate, getRiskLevel, cn } from '@/lib/utils'
import Link from 'next/link'

async function getPatients() {
  return prisma.patient.findMany({
    include: {
      procedure: { select: { name: true, category: true } },
      _count: { select: { tasks: true, billingEvents: true } },
    },
    orderBy: [{ riskScore: 'desc' }, { updatedAt: 'desc' }],
  })
}

const statusColors: Record<string, string> = {
  PRE_OP: 'bg-blue-500/20 text-blue-400',
  SCHEDULED: 'bg-purple-500/20 text-purple-400',
  IN_SURGERY: 'bg-orange-500/20 text-orange-400',
  POST_OP: 'bg-yellow-500/20 text-yellow-400',
  FOLLOW_UP: 'bg-teal-500/20 text-teal-400',
  DISCHARGED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

const riskColors: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
}

export default async function PatientsPage() {
  const patients = await getPatients()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Patients</h1>
          <p className="text-sm text-white/40 mt-0.5">{patients.length} total patients</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          + Add Patient
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Patient', 'Procedure', 'Surgery Date', 'Status', 'Risk', 'Doctor', 'Tasks'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const risk = getRiskLevel(p.riskScore)
              return (
                <tr
                  key={p.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{p.name}</div>
                        <div className="text-[10px] text-white/35">{p.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white/70">{p.procedure?.name ?? '—'}</div>
                    <div className="text-[10px] text-white/35">{p.procedure?.category ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {p.surgeryDate ? formatDate(p.surgeryDate) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full', statusColors[p.status] ?? 'bg-white/10 text-white/50')}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={cn('text-sm font-bold', riskColors[risk])}>
                      {p.riskScore}
                    </div>
                    <div className="text-[10px] text-white/25 capitalize">{risk}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {p.doctorId ? 'Assigned' : 'Unassigned'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/40">{p._count?.tasks ?? 0} tasks</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
