"use client";
// src/components/ui/interactive-globe.tsx
// Interactive 3D globe — Canvas 2D, drag to rotate, auto-rotates
// Shows city markers + arc connections for ClinicOS global presence

import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback } from "react";

interface GlobeProps {
    className?: string;
    size?: number;
    dotColor?: string;
    arcColor?: string;
    markerColor?: string;
    autoRotateSpeed?: number;
    connections?: { from: [number, number]; to: [number, number] }[];
    markers?: { lat: number; lng: number; label?: string }[];
}

// ── Default markers — medical/clinical cities for ClinicOS context ──────────
const DEFAULT_MARKERS = [
    { lat: 28.61, lng: 77.21, label: "Delhi" },
    { lat: 19.08, lng: 72.88, label: "Mumbai" },
    { lat: 12.97, lng: 77.59, label: "Bangalore" },
    { lat: 37.78, lng: -122.42, label: "San Francisco" },
    { lat: 51.51, lng: -0.13, label: "London" },
    { lat: 35.68, lng: 139.69, label: "Tokyo" },
    { lat: -33.87, lng: 151.21, label: "Sydney" },
    { lat: 1.35, lng: 103.82, label: "Singapore" },
    { lat: 25.20, lng: 55.27, label: "Dubai" },
    { lat: 55.76, lng: 37.62, label: "Moscow" },
];

const DEFAULT_CONNECTIONS: { from: [number, number]; to: [number, number] }[] = [
    { from: [28.61, 77.21], to: [51.51, -0.13] },
    { from: [28.61, 77.21], to: [1.35, 103.82] },
    { from: [28.61, 77.21], to: [25.20, 55.27] },
    { from: [51.51, -0.13], to: [37.78, -122.42] },
    { from: [51.51, -0.13], to: [35.68, 139.69] },
    { from: [37.78, -122.42], to: [1.35, 103.82] },
    { from: [1.35, 103.82], to: [-33.87, 151.21] },
    { from: [35.68, 139.69], to: [-33.87, 151.21] },
    { from: [19.08, 72.88], to: [25.20, 55.27] },
    { from: [12.97, 77.59], to: [1.35, 103.82] },
];

// ── Math helpers ──────────────────────────────────────────────────────────────
function latLngToXYZ(lat: number, lng: number, radius: number): [number, number, number] {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + 180) * Math.PI) / 180;
    return [
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
    ];
}

function rotateY(x: number, y: number, z: number, angle: number): [number, number, number] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x * cos + z * sin, y, -x * sin + z * cos];
}

function rotateX(x: number, y: number, z: number, angle: number): [number, number, number] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x, y * cos - z * sin, y * sin + z * cos];
}

function project(x: number, y: number, z: number, cx: number, cy: number, fov: number): [number, number, number] {
    const scale = fov / (fov + z);
    return [x * scale + cx, y * scale + cy, z];
}

// ── Globe component ───────────────────────────────────────────────────────────
export function InteractiveGlobe({
    className,
    size = 600,
    dotColor = "rgba(96, 165, 250, ALPHA)",
    arcColor = "rgba(96, 165, 250, 0.4)",
    markerColor = "rgba(34, 211, 238, 1)",
    autoRotateSpeed = 0.0018,
    connections = DEFAULT_CONNECTIONS,
    markers = DEFAULT_MARKERS,
}: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotYRef = useRef(0.4);
    const rotXRef = useRef(0.25);
    const dragRef = useRef<{
        active: boolean; startX: number; startY: number;
        startRotY: number; startRotX: number;
    }>({ active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 });
    const animRef = useRef<number>(0);
    const timeRef = useRef(0);
    const dotsRef = useRef<[number, number, number][]>([]);

    // Generate fibonacci sphere dots
    useEffect(() => {
        const dots: [number, number, number][] = [];
        const numDots = 1400;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        for (let i = 0; i < numDots; i++) {
            const theta = (2 * Math.PI * i) / goldenRatio;
            const phi = Math.acos(1 - (2 * (i + 0.5)) / numDots);
            dots.push([
                Math.cos(theta) * Math.sin(phi),
                Math.cos(phi),
                Math.sin(theta) * Math.sin(phi),
            ]);
        }
        dotsRef.current = dots;
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.42;
        const fov = 650;

        // Auto-rotate
        if (!dragRef.current.active) rotYRef.current += autoRotateSpeed;

        timeRef.current += 0.012;
        const time = timeRef.current;

        ctx.clearRect(0, 0, w, h);

        // Outer ambient glow
        const glow = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.6);
        glow.addColorStop(0, "rgba(26, 108, 246, 0.05)");
        glow.addColorStop(0.5, "rgba(26, 108, 246, 0.02)");
        glow.addColorStop(1, "rgba(26, 108, 246, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // Globe ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(96, 165, 250, 0.08)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const ry = rotYRef.current;
        const rx = rotXRef.current;

        // ── Draw globe dots ──────────────────────────────────────────────────────
        const dots = dotsRef.current;
        for (let i = 0; i < dots.length; i++) {
            let [x, y, z] = dots[i];
            x *= radius; y *= radius; z *= radius;
            [x, y, z] = rotateX(x, y, z, rx);
            [x, y, z] = rotateY(x, y, z, ry);
            if (z > 0) continue;
            const [sx, sy] = project(x, y, z, cx, cy, fov);
            const depth = Math.max(0.08, 1 - (z + radius) / (2 * radius));
            const dotR = 0.9 + depth * 0.9;
            ctx.beginPath();
            ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = dotColor.replace("ALPHA", depth.toFixed(2));
            ctx.fill();
        }

        // ── Draw arc connections ─────────────────────────────────────────────────
        for (const conn of connections) {
            const [lat1, lng1] = conn.from;
            const [lat2, lng2] = conn.to;

            let [x1, y1, z1] = latLngToXYZ(lat1, lng1, radius);
            let [x2, y2, z2] = latLngToXYZ(lat2, lng2, radius);
            [x1, y1, z1] = rotateX(x1, y1, z1, rx);
            [x1, y1, z1] = rotateY(x1, y1, z1, ry);
            [x2, y2, z2] = rotateX(x2, y2, z2, rx);
            [x2, y2, z2] = rotateY(x2, y2, z2, ry);

            if (z1 > radius * 0.35 && z2 > radius * 0.35) continue;

            const [sx1, sy1] = project(x1, y1, z1, cx, cy, fov);
            const [sx2, sy2] = project(x2, y2, z2, cx, cy, fov);

            // Arc control point (elevated midpoint)
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const midZ = (z1 + z2) / 2;
            const midLen = Math.sqrt(midX ** 2 + midY ** 2 + midZ ** 2);
            const arcH = radius * 1.22;
            const [scx, scy] = project(
                (midX / midLen) * arcH, (midY / midLen) * arcH, (midZ / midLen) * arcH,
                cx, cy, fov
            );

            // Arc line
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.quadraticCurveTo(scx, scy, sx2, sy2);
            ctx.strokeStyle = arcColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Animated traveling dot
            const t = (Math.sin(time * 1.1 + lat1 * 0.08) + 1) / 2;
            const tx = (1 - t) ** 2 * sx1 + 2 * (1 - t) * t * scx + t ** 2 * sx2;
            const ty = (1 - t) ** 2 * sy1 + 2 * (1 - t) * t * scy + t ** 2 * sy2;
            ctx.beginPath();
            ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = markerColor;
            ctx.fill();
        }

        // ── Draw city markers ────────────────────────────────────────────────────
        for (const marker of markers) {
            let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
            [x, y, z] = rotateX(x, y, z, rx);
            [x, y, z] = rotateY(x, y, z, ry);
            if (z > radius * 0.12) continue;

            const [sx, sy] = project(x, y, z, cx, cy, fov);

            // Pulse ring
            const pulse = Math.sin(time * 1.8 + marker.lat * 0.5) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(sx, sy, 5 + pulse * 5, 0, Math.PI * 2);
            ctx.strokeStyle = markerColor.replace("1)", `${0.15 + pulse * 0.12})`);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Core dot
            ctx.beginPath();
            ctx.arc(sx, sy, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = markerColor;
            ctx.fill();

            // Label
            if (marker.label) {
                ctx.font = "10px system-ui, -apple-system, sans-serif";
                ctx.fillStyle = markerColor.replace("1)", "0.65)");
                ctx.fillText(marker.label, sx + 9, sy + 3.5);
            }
        }

        animRef.current = requestAnimationFrame(draw);
    }, [dotColor, arcColor, markerColor, autoRotateSpeed, connections, markers]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [draw]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        dragRef.current = {
            active: true, startX: e.clientX, startY: e.clientY,
            startRotY: rotYRef.current, startRotX: rotXRef.current,
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        rotYRef.current = dragRef.current.startRotY + dx * 0.005;
        rotXRef.current = Math.max(-1, Math.min(1, dragRef.current.startRotX + dy * 0.005));
    }, []);

    const onPointerUp = useCallback(() => { dragRef.current.active = false; }, []);

    return (
        <canvas
            ref={canvasRef}
            className={cn("cursor-grab active:cursor-grabbing", className)}
            style={{ width: size, height: size, maxWidth: '100%', touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        />
    );
}
