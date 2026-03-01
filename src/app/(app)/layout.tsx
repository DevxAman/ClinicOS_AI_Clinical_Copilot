export const dynamic = "force-dynamic";
// src/app/(app)/layout.tsx  ← NEW FILE
// All dashboard pages live under (app)/ — this gives them the sidebar
// Move: dashboard/, patients/, procedures/, tasks/, billing/, agent-log/, settings/
// INTO: (app)/dashboard/, (app)/patients/, etc.
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0f] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}

