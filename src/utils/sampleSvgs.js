export const SAMPLE_SVGS = [
  {
    id: 'cyber-shield',
    name: 'Cyber Shield',
    description: 'Vibrant gradient security emblem',
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.1" />
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Outer Glow Aura -->
  <path d="M250 50 L420 120 C420 280 250 430 250 430 C250 430 80 280 80 120 Z" 
        fill="url(#glowGrad)" filter="url(#neonGlow)" opacity="0.6"/>

  <!-- Main Shield Body -->
  <path d="M250 65 L400 130 C400 270 250 410 250 410 C250 410 100 270 100 130 Z" 
        fill="url(#shieldGrad)" stroke="#ffffff" stroke-width="4" stroke-opacity="0.3"/>

  <!-- Inner Tech Geometric Ring -->
  <circle cx="250" cy="240" r="90" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="8 6" opacity="0.6"/>
  <circle cx="250" cy="240" r="65" fill="#0f172a" fill-opacity="0.7" stroke="#38bdf8" stroke-width="3"/>

  <!-- Center Thunderbolt -->
  <path d="M260 190 L220 250 L255 250 L240 290 L285 230 L250 230 Z" 
        fill="#38bdf8" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
</svg>`
  },
  {
    id: 'donut-chart',
    name: 'Analytics Chart',
    description: 'Multi-color modern statistics wheel',
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background Base Card -->
  <rect x="25" y="25" width="350" height="350" rx="30" fill="#1e293b" filter="url(#cardShadow)"/>

  <!-- Donut Chart Segments (using stroke-dasharray) -->
  <g transform="rotate(-90 200 200)">
    <!-- Segment 1: Cyan 40% -->
    <circle cx="200" cy="200" r="100" fill="transparent" stroke="#06b6d4" stroke-width="38" 
            stroke-dasharray="251.3 628.3" stroke-dashoffset="0" stroke-linecap="round"/>
    <!-- Segment 2: Violet 30% -->
    <circle cx="200" cy="200" r="100" fill="transparent" stroke="#8b5cf6" stroke-width="38" 
            stroke-dasharray="188.5 628.3" stroke-dashoffset="-265" stroke-linecap="round"/>
    <!-- Segment 3: Emerald 20% -->
    <circle cx="200" cy="200" r="100" fill="transparent" stroke="#10b981" stroke-width="38" 
            stroke-dasharray="125.6 628.3" stroke-dashoffset="-468" stroke-linecap="round"/>
    <!-- Segment 4: Amber 10% -->
    <circle cx="200" cy="200" r="100" fill="transparent" stroke="#f59e0b" stroke-width="38" 
            stroke-dasharray="62.8 628.3" stroke-dashoffset="-606" stroke-linecap="round"/>
  </g>

  <!-- Center Metrics Display -->
  <circle cx="200" cy="200" r="62" fill="#0f172a"/>
  <text x="200" y="195" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">85%</text>
  <text x="200" y="220" font-family="sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">EFFICIENCY</text>
</svg>`
  },
  {
    id: 'golden-badge',
    name: 'Award Badge',
    description: 'Gold medal with decorative ribbon',
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#eab308"/>
      <stop offset="70%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
  </defs>

  <!-- Ribbons Behind -->
  <polygon points="140,250 110,360 160,330 200,360 180,250" fill="url(#ribbonGrad)"/>
  <polygon points="260,250 290,360 240,330 200,360 220,250" fill="url(#ribbonGrad)" opacity="0.9"/>

  <!-- Star Rays -->
  <g fill="#fde047" opacity="0.3">
    <circle cx="200" cy="180" r="120" stroke="#facc15" stroke-width="4" stroke-dasharray="10 8" fill="none"/>
  </g>

  <!-- Medal Outer Ring -->
  <circle cx="200" cy="180" r="100" fill="url(#goldGrad)" stroke="#fef08a" stroke-width="4"/>
  <circle cx="200" cy="180" r="82" fill="#713f12" stroke="#fde047" stroke-width="3"/>
  <circle cx="200" cy="180" r="74" fill="url(#goldGrad)"/>

  <!-- Star in Center -->
  <polygon points="200,130 213,165 250,165 220,187 232,222 200,200 168,222 180,187 150,165 187,165" 
           fill="#fef9c3" stroke="#854d0e" stroke-width="2" stroke-linejoin="round"/>
</svg>`
  },
  {
    id: 'sunset-landscape',
    name: 'Minimal Sunset',
    description: 'Clean aesthetic mountain landscape',
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="500" height="350">
  <defs>
    <clipPath id="frameClip">
      <rect x="0" y="0" width="500" height="350" rx="20"/>
    </clipPath>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="40%" stop-color="#4c1d95"/>
      <stop offset="70%" stop-color="#db2777"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>

  <g clip-path="url(#frameClip)">
    <!-- Sky -->
    <rect width="500" height="350" fill="url(#skyGrad)"/>

    <!-- Glowing Sun -->
    <circle cx="250" cy="210" r="75" fill="#fef08a" opacity="0.9"/>

    <!-- Distant Mountains -->
    <polygon points="-50,350 150,210 320,350" fill="#4a044e" opacity="0.7"/>
    <polygon points="180,350 350,190 520,350" fill="#3b0764" opacity="0.8"/>

    <!-- Foreground Mountains -->
    <polygon points="50,350 250,240 450,350" fill="#18181b"/>
    <polygon points="-30,350 100,270 280,350" fill="#09090b"/>
    <polygon points="260,350 400,260 540,350" fill="#09090b"/>
  </g>
</svg>`
  }
];
