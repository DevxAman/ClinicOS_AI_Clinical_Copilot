"use client";
// src/components/landing/DashboardShowcase.tsx
// Scroll-animated dashboard panel section — placed after SocialProofBand
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

function DashboardMockup() {
    return (
        <div style={{ width: '100%', height: '100%', background: '#0a0b14', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Browser chrome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#111318', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                </div>
                <div style={{ flex: 1, marginLeft: 12, padding: '5px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    clinicos.app/dashboard
                </div>
            </div>

            {/* App content */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{ width: 180, flexShrink: 0, padding: '16px 12px', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '4px 0' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1a6cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>C</div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>ClinicOS</span>
                    </div>
                    {[
                        { icon: '📊', label: 'Dashboard', active: true },
                        { icon: '👥', label: 'Patients', active: false },
                        { icon: '🔧', label: 'Procedures', active: false },
                        { icon: '✓', label: 'Tasks', active: false },
                        { icon: '💳', label: 'Billing', active: false },
                        { icon: '📋', label: 'Agent Log', active: false },
                        { icon: '⚙️', label: 'Settings', active: false },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: item.active ? '#1a6cf6' : 'transparent', fontSize: 12, fontWeight: item.active ? 700 : 500, color: item.active ? 'white' : 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
                            <span style={{ fontSize: 14 }}>{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>Good morning, Dr. Sharma</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Last AI scan: 14 min ago · 4 actions taken</div>
                        </div>
                        <div style={{ padding: '8px 16px', borderRadius: 100, background: '#1a6cf6', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#fbbf24' }}>✦</span> Run AI Agent
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 18 }}>
                        {[
                            { label: 'ACTIVE PATIENTS', value: '48', color: '#60a5fa' },
                            { label: 'SURGERIES WK', value: '6', color: 'white' },
                            { label: 'OVERDUE F/U', value: '7', color: 'white' },
                            { label: 'REVENUE PEND.', value: '₹24.8k', color: '#4ade80' },
                            { label: 'RISK ALERTS', value: '3', color: '#f87171' },
                            { label: 'OVERDUE TASKS', value: '4', color: '#fbbf24' },
                        ].map(s => (
                            <div key={s.label} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 700 }}>{s.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom panels */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                        {/* AI Summary */}
                        <div style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)' }}>AI Daily Summary</span>
                            </div>
                            <div style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.55)' }}>
                                <span style={{ color: '#60a5fa', fontWeight: 700 }}>3 high-risk patients</span> require follow-up. <span style={{ fontWeight: 700, color: 'white' }}>Aarav Mehta</span> (TKR) is 5 days post-op with no review scheduled. <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹8,400</span> billing overdue. Auto-created <span style={{ color: '#60a5fa', fontWeight: 700 }}>4 tasks</span>.
                            </div>
                        </div>
                        {/* Tasks */}
                        <div style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Priority Tasks</div>
                            {[
                                { dot: '#f87171', task: 'Schedule post-op review – A. Mehta', time: 'Overdue', timeColor: '#f87171' },
                                { dot: '#fb923c', task: 'Pre-op blood work – P. Rajan', time: 'Tomorrow', timeColor: 'rgba(255,255,255,0.3)' },
                                { dot: '#f87171', task: 'Chase overdue invoice – R. Kapoor', time: 'Overdue', timeColor: '#f87171' },
                                { dot: '#4ade80', task: 'Send discharge summary – S. Nair', time: 'Mar 2', timeColor: 'rgba(255,255,255,0.3)' },
                            ].map(t => (
                                <div key={t.task} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{t.task}</span>
                                    <span style={{ fontSize: 10, color: t.timeColor, fontWeight: 600, flexShrink: 0 }}>{t.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DashboardShowcase() {
    return (
        <section style={{ background: 'transparent' }}>
            <ContainerScroll
                titleComponent={
                    <div style={{ paddingBottom: 16 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(26,108,246,0.1)', border: '1px solid rgba(26,108,246,0.22)', color: '#93c5fd', fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
                            AI-Powered Dashboard
                        </div>
                        <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'white', margin: '0 0 12px', lineHeight: 1.1 }}>
                            Your entire clinic,{' '}
                            <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                one dashboard
                            </span>
                        </h2>
                        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                            Real-time visibility into patients, tasks, billing, and AI actions — all from a single command center.
                        </p>
                    </div>
                }
            >
                <DashboardMockup />
            </ContainerScroll>
        </section>
    )
}
