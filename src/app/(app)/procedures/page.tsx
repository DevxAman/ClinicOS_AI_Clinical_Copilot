// src/app/procedures/page.tsx

import { prisma } from '@/lib/prisma'

async function getProcedures() {
  return prisma.procedure.findMany({
    include: { _count: { select: { patients: true } } },
    orderBy: { name: 'asc' },
  })
}

const categoryColors: Record<string, string> = {
  ORTHOPAEDICS: 'text-blue-400 bg-blue-500/15',
  GENERAL_SURGERY: 'text-teal-400 bg-teal-500/15',
  CARDIOLOGY: 'text-red-400 bg-red-500/15',
  OPHTHALMOLOGY: 'text-yellow-400 bg-yellow-500/15',
  NEUROSURGERY: 'text-purple-400 bg-purple-500/15',
  GYNAECOLOGY: 'text-pink-400 bg-pink-500/15',
  ENT: 'text-orange-400 bg-orange-500/15',
  UROLOGY: 'text-indigo-400 bg-indigo-500/15',
  OTHER: 'text-white/40 bg-white/10',
}

export default async function ProceduresPage() {
  const procedures = await getProcedures()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Procedures</h1>
          <p className="text-sm text-white/40 mt-0.5">{procedures.length} procedure templates</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
          + Add Procedure
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {procedures.map((p) => {
          const preOpReqs = p.preOpRequirements as string[]
          const followUps = p.followUpSchedule as any[]
          const billing = p.billingMilestones as any[]
          const totalBilling = billing.reduce((sum: number, b: any) => sum + (b.amount ?? 0), 0)

          return (
            <div key={p.id} className="glass-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">{p.description}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded flex-shrink-0 ${categoryColors[p.category] ?? 'bg-white/10 text-white/40'}`}>
                  {p.category.replace('_', ' ')}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{preOpReqs.length}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wide">Pre-Op</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{followUps.length}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wide">Follow-Ups</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{p._count.patients}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wide">Patients</div>
                </div>
              </div>

              {/* Billing total */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-[10px] text-white/35">Avg. billing package</span>
                <span className="text-sm font-bold text-yellow-400">
                  ₹{(totalBilling / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Pre-op requirements preview */}
              <div className="space-y-1">
                {preOpReqs.slice(0, 3).map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-white/40">
                    <span className="w-3 h-3 rounded-sm bg-blue-500/20 flex items-center justify-center text-blue-400">✓</span>
                    {req}
                  </div>
                ))}
                {preOpReqs.length > 3 && (
                  <div className="text-[10px] text-white/25">+{preOpReqs.length - 3} more requirements</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
