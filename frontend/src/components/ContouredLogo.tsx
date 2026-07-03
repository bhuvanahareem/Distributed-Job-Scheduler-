import React from 'react';

export const ContouredLogo = () => {
  // Generate concentric array loops to match the wireframe topological mesh effect
  const contourLinesCount = 14; 
  
  return (
    <div className="relative flex items-center justify-center w-64 h-64 bg-transparent group z-10">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full transition-transform duration-700 ease-out transform group-hover:scale-105"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Render overlapping contour layers with progressive offsets and opacity shifts */}
        {Array.from({ length: contourLinesCount }).map((_, index) => {
          const step = index / contourLinesCount;
          // Creates a subtle 3D parallax warping effect mimicking the brackets
          const scale = 1 - step * 0.12;
          const shiftX = Math.sin(step * Math.PI) * 6;
          const shiftY = Math.cos(step * Math.PI) * 4;
          const opacity = 1.0 - step * 0.75;
          const strokeWidth = 0.5 + (1 - step) * 0.8;

          return (
            <g
              key={index}
              transform={`translate(${100 + shiftX}, ${100 + shiftY}) scale(${scale}) translate(-100, -100)`}
              opacity={opacity}
              className="transition-all duration-500 ease-in-out"
            >
              {/* Layered Outer Rounded Squircle Frame Container */}
              <rect
                x="30"
                y="30"
                width="140"
                height="140"
                rx="42"
                fill="none"
                stroke={index === 0 ? "#004FE2" : "rgba(255, 255, 255, 0.15)"}
                strokeWidth={strokeWidth}
                strokeDasharray={index % 3 === 0 ? "none" : "3, 1"}
                className="opacity-80"
              />
              
              {/* Layered Embedded Checkmark path, distorted smoothly across layers */}
              <path
                d={`M 75 ${105 + index * 0.4} L ${98 + index * 0.2} ${128 - index * 0.2} L 142 75`}
                fill="none"
                stroke={index === 0 ? "#004FE2" : "rgba(255, 255, 255, 0.15)"}
                strokeWidth={strokeWidth + 0.3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
