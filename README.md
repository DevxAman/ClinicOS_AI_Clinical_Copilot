# ClinicOS Graph — AI-Powered Clinical Operations Copilot

A production-grade, database-driven, AI-agent-powered clinical workflow system for surgeons and specialty clinics.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| AI | Anthropic Claude (claude-sonnet-4) |
| Styling | TailwindCSS |
| Deployment | Vercel |

---

## Project Structure

```
clinicos/
├── prisma/
│   ├── schema.prisma          # Full relational schema (6 models)
│   └── seed.ts                # Comprehensive seed data
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Sidebar
│   │   ├── page.tsx           # → redirects to /dashboard
│   │   ├── globals.css        # Dark theme + glassmorphism utilities
│   │   │
│   │   ├── dashboard/page.tsx # Dynamic server component
│   │   ├── patients/page.tsx  # Patient list with risk scores
│   │   ├── procedures/page.tsx# Procedure template cards
│   │   ├── tasks/page.tsx     # Task board with filters
│   │   ├── billing/page.tsx   # Billing intelligence view
│   │   ├── agent-log/page.tsx # Full AI transparency log
│   │   └── settings/page.tsx  # Settings (placeholder)
│   │
│   │   └── api/
│   │       ├── dashboard/route.ts    # GET  aggregated metrics
│   │       ├── patients/route.ts     # GET list, POST create
│   │       ├── tasks/route.ts        # GET filtered, POST create
│   │       ├── billing/route.ts      # GET with summary
│   │       └── run-agent/route.ts    # POST trigger AI agent
│   │
│   ├── components/
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   └── dashboard/
│   │       ├── RunAgentButton.tsx    # Client: triggers agent API
│   │       ├── MetricCard.tsx        # Metric display card
│   │       ├── AIPanel.tsx           # AI summary panel
│   │       └── PriorityTaskList.tsx  # Priority task list
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma singleton client
│   │   ├── agent.ts           # AI agent core logic
│   │   └── utils.ts           # Helpers (dates, currency, API responses)
│   │
│   └── types/
│       └── index.ts           # All TypeScript type definitions
```

---

## Database Models

```
Patient ──────── Procedure
    │                │
    ├── Task         │ (preOpRequirements, followUpSchedule, billingMilestones as JSON)
    └── BillingEvent

Staff ─── Task (assignedTo)
Staff ─── Patient (attendingDoctor)

AgentLog (standalone — stores every AI execution)
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd clinicos
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in DATABASE_URL and ANTHROPIC_API_KEY
```

### 3. Setup Database

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## AI Agent Workflow

The agent at `POST /api/run-agent` executes a 4-step pipeline:

```
STEP 1: DB QUERIES (src/lib/agent.ts → queryOperationalGaps)
  ├── POST_OP patients with no follow-up in next 7 days
  ├── SCHEDULED patients with missing pre-op tasks
  ├── Billing events overdue > 7 days
  └── Recent surgeries (last 7 days)

STEP 2: AI ANALYSIS (buildAgentPrompt → callAIModel)
  ├── Structured JSON prompt sent to Claude Sonnet
  └── Returns: priorityIssues, recommendedTasks, riskUpdates, communicationDrafts

STEP 3: EXECUTE ACTIONS (executeAgentActions)
  ├── Auto-create recommended tasks (deduplication check)
  ├── Update patient risk scores (0-100)
  └── Mark overdue billing events

STEP 4: LOG (logAgentRun → AgentLog table)
  ├── rawQueryResults (what DB returned)
  ├── aiOutput (full AI response)
  └── actionsExecuted (what system did)
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard` | Aggregated metrics + priority tasks |
| GET | `/api/patients` | Paginated patient list (filters: status, search, riskMin) |
| POST | `/api/patients` | Create patient + auto-generate tasks/billing |
| GET | `/api/tasks` | Task list (filters: status, type, priority, overdue) |
| POST | `/api/tasks` | Create task manually |
| GET | `/api/billing` | Billing events with summary |
| POST | `/api/run-agent` | Execute AI Operations Agent |
| GET | `/api/run-agent` | Fetch agent log history |

All routes return:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-28T09:00:00.000Z"
}
```

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "initial"
git remote add origin <your-repo>
git push -u origin main
```

### 2. Create Vercel Project

```bash
npm install -g vercel
vercel
```

### 3. Add Environment Variables in Vercel Dashboard

```
DATABASE_URL          → Your PostgreSQL connection string (Neon/Supabase recommended)
ANTHROPIC_API_KEY     → sk-ant-api...
```

### 4. Recommended Databases for Vercel

- **Neon** (serverless Postgres) — best for Vercel, use connection pooling URL
- **Supabase** — full Postgres with dashboard
- **Railway** — simple deployment

### 5. Run migrations after deploy

```bash
# In Vercel project settings → Functions → Shell
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

---

## Extending the Agent

To add new analysis logic to the agent:

1. Add a new query in `queryOperationalGaps()` in `src/lib/agent.ts`
2. Add the field to `AgentQueryPayload` in `src/types/index.ts`
3. Update `buildAgentPrompt()` to include the new data
4. Add handling in `executeAgentActions()` if new action types are needed

---

## Key Design Decisions

- **Server Components first** — dashboard, patients, tasks all fetch data server-side (no client loading states)
- **Prisma singleton** — prevents connection pool exhaustion in Next.js dev hot reload
- **Deduplication in agent** — tasks check for existing records before creating
- **Structured JSON throughout** — AI prompt explicitly requests JSON, response is validated before use
- **Auto-billing status updates** — `PENDING` billing events are auto-marked `OVERDUE` on read
