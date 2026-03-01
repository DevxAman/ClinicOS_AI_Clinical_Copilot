"use client";
// src/components/landing/ParticlesBackground.tsx
// Full-page fixed particle background for the landing page
import { Particles } from "@/components/ui/particles";

export default function ParticlesBackground() {
    return (
        <Particles
            className="fixed inset-0 z-0"
            quantity={100}
            ease={80}
            color="#60a5fa"
            size={0.4}
            staticity={50}
        />
    );
}
