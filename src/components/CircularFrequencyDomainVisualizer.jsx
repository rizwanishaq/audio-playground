'use client';
import React, { useRef, useEffect } from 'react';

const CircularFrequencyDomainVisualizer = ({ data }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 50; // Define maximum radius with padding

    const numBars = data.length;
    const angleStep = (2 * Math.PI) / numBars; // Angle between each bar

    const draw = () => {
      if (!data) return;

      // Clear canvas for each frame
      ctx.clearRect(0, 0, width, height);

      // Make the background transparent
      ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Fully transparent background
      ctx.fillRect(0, 0, width, height);

      // Draw the frequency bars
      for (let i = 0; i < numBars; i++) {
        const amplitude = data[i];
        const barLength = (amplitude / 255) * maxRadius * 0.9; // Bar length based on amplitude

        const angle = i * angleStep - Math.PI / 2; // Start from top

        // Start bars from the center of the circle
        const xStart = centerX;
        const yStart = centerY;
        const xEnd = centerX + barLength * Math.cos(angle);
        const yEnd = centerY + barLength * Math.sin(angle);

        // Adjusted color scheme (cooler tones)
        const normalized = amplitude / 255;
        const r = Math.round(150 * (1 - normalized));
        const g = Math.round(255 * normalized);
        const b = Math.round(255 * normalized * 0.75);
        const color = `rgb(${r}, ${g}, ${b})`;

        // Dynamic glow effect for each bar
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        // Draw each bar extending from the center
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      // Continuously animate
      animationRef.current = requestAnimationFrame(draw);
    };

    // Start the drawing when the component is mounted
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth / 2}
      height={window.innerHeight / 2}
      style={{
        border: 'none',
        backgroundColor: 'transparent', // Transparent canvas background
        display: 'block',
        margin: '0 auto',
      }}
    ></canvas>
  );
};

export default CircularFrequencyDomainVisualizer;
