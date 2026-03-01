// src/components/dashboard/MetricCard.tsx
// Server-safe component — no client state needed

import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: number | string
  change?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange'
  isString?: boolean
}

const colorMap = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  red: 'text-red-400',
  yellow: 'text-yellow-400',
  orange: 'text-orange-400',
}

export default function MetricCard({
  label,
  value,
  change,
  color = 'blue',
  isString = false,
}: MetricCardProps) {
  return (
    <div className="glass-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{label}</div>
      <div className={cn('font-bold', isString ? 'text-lg' : 'text-2xl', colorMap[color])}>
        {value}
      </div>
      {change && (
        <div className="text-[10px] text-white/30 mt-1">{change}</div>
      )}
    </div>
  )
}
