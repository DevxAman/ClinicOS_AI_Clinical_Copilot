// src/app/(landing)/page.tsx
// Landing page — statically generated, lazy-loads below-fold sections
import dynamic from 'next/dynamic'
import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import ScrollToTop from '@/components/landing/ScrollToTop'
import ParticlesBackground from '@/components/landing/ParticlesBackground'

// Lazy-load below-fold sections to reduce initial JS bundle and TBT
const SocialProofBand = dynamic(() => import('@/components/landing/SocialProofBand'))
const DashboardShowcase = dynamic(() => import('@/components/landing/DashboardShowcase'))
const FeatureSections = dynamic(() => import('@/components/landing/FeatureSections'))
const SecuritySection = dynamic(() => import('@/components/landing/SecuritySection'))
const UseCasesGrid = dynamic(() => import('@/components/landing/UseCasesGrid'))
const FeaturesGrid = dynamic(() => import('@/components/landing/FeaturesGrid'))
const CTASection = dynamic(() => import('@/components/landing/CTASection'))
const LandingFooter = dynamic(() => import('@/components/landing/LandingFooter'))

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Scroll to top on mount/refresh */}
      <ScrollToTop />

      {/* Fixed particle background covering the entire page */}
      <ParticlesBackground />

      {/* All page content sits above the particles */}
      <div className="relative z-[1]">
        <LandingNav />
        <HeroSection />
        <SocialProofBand />
        <DashboardShowcase />
        <FeatureSections />
        <SecuritySection />
        <UseCasesGrid />
        <FeaturesGrid />
        <CTASection />
        <LandingFooter />
      </div>
    </div>
  )
}
