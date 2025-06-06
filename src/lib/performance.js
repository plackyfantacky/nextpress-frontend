'use client';

import { useEffect } from 'react';

export function PerformanceMarker() {
    useEffect(() => {
        if (typeof performance === 'undefined') return;

        performance.mark('json-to-dom-end');
        performance.measure('json-to-dom', 'json-to-dom-start', 'json-to-dom-end');

        const measures = performance.getEntriesByName('json-to-dom');
        console.log(`🕓 JSON → DOM render: ${measures[0]?.duration.toFixed(2)} ms`);

        console.timeEnd('Hydration');
    }, []);

    if (typeof window !== 'undefined') {
        // Start timers only in the browser
        performance.mark('json-to-dom-start');
        console.time('Hydration');
    }

    return null;
}