"use client";
// src/components/landing/ScrollToTop.tsx
// Forces page to scroll to top on every mount/refresh
// Also disables browser scroll restoration
import { useEffect } from "react";

export default function ScrollToTop() {
    useEffect(() => {
        // Prevent browser from restoring scroll position on refresh
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
        // Immediately scroll to top
        window.scrollTo(0, 0);
    }, []);

    return null;
}
