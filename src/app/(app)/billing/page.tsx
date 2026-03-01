// src/app/billing/page.tsx

import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

async function getBillingData() {
  const now = new Date()

  await prisma.billingEvent.updateMany({
    where: { status: 'PENDING', dueDate: { lt: now } },
    data: { status: 'OVERDUE' },
  })

  const [events, summary] = await Promise.all([
    prisma.billingEvent.findMany({
      include: { patient: { select: { name: true } } },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    }),
    prisma.billingEvent.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: true,
    }),
  ])

  const summaryMap = summary.reduce<Record<string, { total: number; count: number }>>(
    (acc, s) => {
      acc[s.status] = { total: s._sum.amount ?? 0, count: s._count }
      return acc
    }, {}
  )

  return { events, summary: summaryMap }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  PAID: 'bg-green-500/20 text-green-400',
  OVERDUE: 'bg-red-500/20 text-red-400',
  WAIVED: 'bg-white/10 text-white/30',
  DISPUTED: 'bg-orange-500/20 text-orange-400',
}

export default async function BillingPage() {
  const { events, summary } = await getBillingData()

  const totalPending = (summary['PENDING']?.total ?? 0) + (summary['OVERDUE']?.total ?? 0)
  const totalPaid = summary['PAID']?.total ?? 0
  const totalOverdue = summary['OVERDUE']?.total ?? 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Billing</h1>
        <p className="text-sm text-white/40 mt-0.5">{events.length} billing events</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Total Pending</div>
          <div className="text-xl font-bold text-yellow-400">{formatCurrency(totalPending)}</div>
          <div className="text-[10px] text-white/25 mt-1">
            {(summary['PENDING']?.count ?? 0) + (summary['OVERDUE']?.count ?? 0)} invoices
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Overdue</div>
          <div className="text-xl font-bold text-red-400">{formatCurrency(totalOverdue)}</div>
          <div className="text-[10px] text-white/25 mt-1">
            {summary['OVERDUE']?.count ?? 0} invoices
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Total Collected</div>
          <div className="text-xl font-bold text-green-400">{formatCurrency(totalPaid)}</div>
          <div className="text-[10px] text-white/25 mt-1">
            {summary['PAID']?.count ?? 0} invoices paid
          </div>
        </div>
      </div>

      {/* Billing table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Invoice', 'Patient', 'Description', 'Amount', 'Due Date', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/35">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-white/35">
                  {event.invoiceRef ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-white/70">{event.patient.name}</td>
                <td className="px-4 py-3 text-xs text-white/55">{event.description}</td>
                <td className="px-4 py-3 text-sm font-semibold text-white/85">
                  {formatCurrency(event.amount)}
                </td>
                <td className="px-4 py-3 text-xs text-white/40">{event.dueDate ? formatDate(event.dueDate) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full', statusColors[event.status] ?? 'bg-white/10 text-white/40')}>
                    {event.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
