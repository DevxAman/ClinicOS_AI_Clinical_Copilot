// src/components/dashboard/PriorityTaskList.tsx

import { cn, formatDate } from '@/lib/utils'

interface Task {
  id: string
  title: string
  patientName: string
  type: string
  priority: string
  dueDate: string
  isOverdue: boolean
  aiGenerated: boolean
}

const priorityDotColor: Record<string, string> = {
  URGENT: 'bg-red-400 animate-pulse-urgent',
  HIGH: 'bg-orange-400',
  MEDIUM: 'bg-yellow-400',
  LOW: 'bg-green-400',
}

const typeLabel: Record<string, string> = {
  PRE_OP: 'Pre-Op',
  FOLLOW_UP: 'Follow-Up',
  BILLING: 'Billing',
  REVIEW: 'Review',
  COMMUNICATION: 'Comms',
}

export default function PriorityTaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-white/25 text-sm">
        No pending tasks 🎉
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors"
        >
          <div
            className={cn(
              'w-2 h-2 rounded-full flex-shrink-0',
              priorityDotColor[task.priority] ?? 'bg-white/20'
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white/80 truncate">
              {task.title}
              {task.aiGenerated && (
                <span className="ml-1.5 text-[9px] text-blue-400 font-bold">AI</span>
              )}
            </div>
            <div className="text-[10px] text-white/35 mt-0.5">
              {task.patientName} · {typeLabel[task.type] ?? task.type}
            </div>
          </div>
          <div
            className={cn(
              'text-[10px] font-medium flex-shrink-0',
              task.isOverdue ? 'text-red-400' : 'text-white/30'
            )}
          >
            {task.isOverdue ? 'Overdue' : formatDate(task.dueDate)}
          </div>
        </div>
      ))}
    </div>
  )
}
