import { cn } from "@/lib/utils";
import React from "react";

export function ScanalyzLogo({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="150"
      height="48"
      viewBox="0 0 150 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
      <g clipPath="url(#clip0_101_2)">
        {/* Icon */}
        <path d="M8 8H16V12H12V16H8V8Z" fill="#EA4335" /> {/* Red */}
        <path d="M32 8H40V16H36V12H32V8Z" fill="#FBBC05" /> {/* Yellow */}
        <path d="M8 32H12V36H16V40H8V32Z" fill="#34A853" /> {/* Green */}
        <path d="M32 40V32H36V36H40V40H32Z" fill="#4285F4" /> {/* Blue */}
        <path
          d="M18 12 H30 V32 L28 30 L30 32 L28 34 L30 36 L28 38 L18 38 V12 Z"
          fill="#E8EAED"
        />
        <rect x="20" y="16" width="8" height="2" fill="#4285F4" />
        <rect x="20" y="22" width="8" height="2" fill="#34A853" />
        <rect x="20" y="28" width="6" height="2" fill="#FBBC05" />
      </g>
      {/* Text */}
      <text
        x="48"
        y="32"
        fontFamily="Inter, sans-serif"
        fontSize="22"
        fontWeight="bold"
      >
        <tspan fill="#4285F4">S</tspan>
        <tspan fill="#EA4335">c</tspan>
        <tspan fill="#FBBC05">a</tspan>
        <tspan fill="#34A853">n</tspan>
        <tspan fill="#4285F4">a</tspan>
        <tspan fill="#FBBC05">l</tspan>
        <tspan fill="#34A853">y</tspan>
        <tspan fill="#EA4335">z</tspan>
      </text>
      <defs>
        <clipPath id="clip0_101_2">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
