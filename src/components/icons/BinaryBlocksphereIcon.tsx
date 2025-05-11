import type { SVGProps } from 'react';

export function BinaryBlocksphereIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="1em"
      height="1em"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#grad1)" stroke="hsl(var(--foreground))" strokeWidth="2" filter="url(#glow)" />
      <text x="50" y="58" fontFamily="var(--font-geist-mono)" fontSize="30" fill="hsl(var(--foreground))" textAnchor="middle" fontWeight="bold">
        B
      </text>
      <text x="50" y="58" fontFamily="var(--font-geist-mono)" fontSize="30" fill="hsl(var(--primary-foreground))" textAnchor="middle" fontWeight="bold" style={{transform: 'translateY(1px) translateX(0.5px)'}}>
        B
      </text>
    </svg>
  );
}
