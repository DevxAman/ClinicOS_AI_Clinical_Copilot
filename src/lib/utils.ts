// src/lib/utils.ts
// Shared utility functions

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns'
import type { ApiResponse } from '@/types'
import { NextResponse } from 'next/server'

// ── Tailwind class merger ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── API response helpers ─────────────────────────────────────────────────────
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
  return NextResponse.json(body, { status })
}

export function apiError(message: string, status = 500): NextResponse {
  const body: ApiResponse<never> = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }
  return NextResponse.json(body, { status })
}

// ── Date helpers ──────────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy, h:mm a')
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isOverdue(date: Date | string): boolean {
  return isPast(new Date(date)) && !isToday(new Date(date))
}

// ── Risk score helper ─────────────────────────────────────────────────────────
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export function getRiskColor(score: number): string {
  const level = getRiskLevel(score)
  const map = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  }
  return map[level]
}

// ── Currency formatter ────────────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
