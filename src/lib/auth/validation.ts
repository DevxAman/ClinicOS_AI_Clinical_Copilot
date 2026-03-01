// src/lib/auth/validation.ts
// Zod validation schemas for all auth and subscription endpoints
// Install: npm install zod

import { z } from 'zod'

// ── Phone validation (E.164 international format) ─────────────────────────────
const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in international format e.g. +919876543210')

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export const doctorRegisterSchema = z.object({
  // Clinic details
  clinicName: z.string().min(2, 'Clinic name must be at least 2 characters').max(100),
  clinicSlug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),

  // Doctor details
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional(),
  phone: phoneSchema.optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  googleId: z.string().optional(),

  specialty: z.string().optional(),
}).refine(
  (data: any) => data.email || data.phone,
  { message: 'Either email or phone number is required' }
).refine(
  (data: any) => data.googleId || data.password,
  { message: 'Either Google OAuth or a password is required' }
)

export const doctorLoginEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  clinicSlug: z.string().optional(), // Optional: scoped login
})

export const doctorLoginPhoneSchema = z.object({
  phone: phoneSchema,
  clinicId: z.string().min(1, 'Clinic ID is required'),
})

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export const patientLoginSchema = z.object({
  phone: phoneSchema,
  accessToken: z.string().uuid('Invalid access token format'),
  clinicId: z.string().min(1, 'Clinic ID is required'),
})

// ─────────────────────────────────────────────────────────────────────────────
// OTP ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export const sendOTPSchema = z.object({
  phone: phoneSchema,
  clinicId: z.string().min(1),
  userType: z.enum(['DOCTOR', 'PATIENT']),
  channel: z.enum(['sms', 'whatsapp']).default('sms'),
})

export const verifyOTPSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/),
  clinicId: z.string().min(1),
  userType: z.enum(['DOCTOR', 'PATIENT']),
})

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION ROUTES
// ─────────────────────────────────────────────────────────────────────────────

export const createCheckoutSchema = z.object({
  planType: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  provider: z.enum(['stripe', 'razorpay']),
})
