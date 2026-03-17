'use client'

import { useEffect } from 'react'

export default function ClientSideCleanup() {
  useEffect(() => {
    const hideDevTools = () => {
      const selectors = [
        '.preact-border-shadow-host', 
        '[aria-label="Next.js development indicator"]', 
        '#nextjs-dev-overlay',
        '.mapboxgl-ctrl-compass',
        '.mapboxgl-ctrl-logo',
        '.mapboxgl-ctrl-attrib',
        // Be very specific: only hide Mapbox-generated control containers if they don't house our panel
        '.mapboxgl-ctrl-bottom-left:not(:has(.custom-map-panel))',
        '.mapboxgl-ctrl-bottom-right:not(:has(.custom-map-panel))',
        '.mapboxgl-ctrl-top-left:not(:has(.custom-map-panel))',
        '.mapboxgl-ctrl-top-right:not(:has(.custom-map-panel))'
      ];
      selectors.forEach(s => {
        const elements = document.querySelectorAll(s);
        elements.forEach(el => {
          if (el.classList.contains('custom-map-panel') || el.querySelector('.custom-map-panel')) return;
          el.remove();
        });
      });
    };

    hideDevTools();
    const interval = setInterval(hideDevTools, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <style jsx global>{`
      .mapboxgl-ctrl-logo,
      .mapboxgl-ctrl-attrib,
      .mapboxgl-ctrl-compass,
      .mapboxgl-ctrl-group,
      .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl:not(.custom-map-panel) {
        display: none !important;
      }
    `}</style>
  );
}
