'use client';
import React, { useRef, useEffect } from 'react';

const CircularFrequencyDomainVisualizer = ({ data }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null); // Reference to manage animation frame

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 50; // Define the radius for the circle, leaving padding

    // Function to draw the frequency data in a circular pattern
    const draw = () => {
      if (!data) return;

      // Clear canvas for new frame
      ctx.clearRect(0, 0, width, height);

      // Number of frequency bars and angle between them
      const numBars = data.length;
      const angleStep = (2 * Math.PI) / numBars; // Full circle divided by number of bars

      for (let i = 0; i < numBars; i++) {
        const amplitude = data[i];
        const barHeight = (amplitude / 255) * radius; // Normalize height based on amplitude

        // Calculate angle for this bar
        const angle = i * angleStep;

        // Calculate start and end points of the bar
        const xStart = centerX + radius * Math.cos(angle);
        const yStart = centerY + radius * Math.sin(angle);
        const xEnd = centerX + (radius - barHeight) * Math.cos(angle);
        const yEnd = centerY + (radius - barHeight) * Math.sin(angle);

        // Dynamic color gradient based on amplitude
        const normalized = amplitude / 255;
        const r = Math.min(255, Math.max(0, Math.round(255 * (1 - normalized))));
        const g = Math.min(255, Math.max(0, Math.round(255 * normalized * 2)));
        const b = Math.min(255, Math.max(0, Math.round(255 * normalized * 0.5)));
        const color = `rgb(${r}, ${g}, ${b})`;

        // Apply glow and fill radial bars
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        // Draw the radial bar
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      // Request the next frame for continuous animation
      animationRef.current = requestAnimationFrame(draw);
    };

    // Start drawing once the component is mounted
    animationRef.current = requestAnimationFrame(draw);

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth / 2}
      height={window.innerHeight / 2}
      style={{ border: 'none', backgroundColor: 'transparent', display: 'block', margin: '0 auto' }}
    ></canvas>
  );
};

export default CircularFrequencyDomainVisualizer;
