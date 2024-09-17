'use client';
import React, { useRef, useEffect } from 'react';

const TimeDomainVisualizer = ({ data }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null); // Reference to manage animation frame

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Padding for axes and text
    const padding = 50;

    // Create a gradient for the waveform
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#00C6FF');
    gradient.addColorStop(1, '#0072ff');

    // Variables to manage animation timing
    let lastTime = 0;

    // Function to draw the waveform
    const draw = (time) => {
      if (!data) return;

      // Clear the canvas for new frame
      ctx.clearRect(0, 0, width, height);

      // Draw waveform with a glow effect
      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 200, 255, 0.5)';
      ctx.beginPath();

      const sliceWidth = (width - padding * 2) / data.length; // Adjust width for padding
      let x = padding;

      // Draw waveform
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] / 128.0) - 1; // Normalize amplitude (0-255) to (-1 to 1)
        const y = (height / 2) + (v * (height - padding * 2)) / 2; // Invert the y-axis

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Add animated vertical bars to represent amplitude
        const barHeight = Math.abs(v) * (height - padding * 2) / 2;
        ctx.fillStyle = `rgba(0, 200, 255, ${Math.abs(v)})`;
        ctx.fillRect(x, height / 2 - barHeight, sliceWidth, barHeight);

        x += sliceWidth;
      }

      ctx.lineTo(width - padding, height / 2); // Complete the waveform
      ctx.stroke();
      ctx.closePath();

      // Draw X-axis (time)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'gray';
      ctx.beginPath();
      ctx.moveTo(padding, height / 2);
      ctx.lineTo(width - padding, height / 2);
      ctx.stroke();

      // Draw Y-axis (amplitude)
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.stroke();

      // Label X-axis (Time)
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Time (s)`, width / 2, height - 20);
      ctx.fillText(`0`, padding, height - 20); // Starting time
      ctx.fillText(`${(data.length / 44100).toFixed(3)} s`, width - padding, height - 20); // Total time for the buffer

      // Label Y-axis (Amplitude)
      ctx.save();
      ctx.textAlign = 'right';
      ctx.fillText('1', padding - 10, padding); // Max amplitude
      ctx.fillText('-1', padding - 10, height - padding); // Min amplitude
      ctx.translate(padding - 40, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('Amplitude', 0, 0);
      ctx.restore();

      // Request the next frame to maintain real-time updates
      animationRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(draw);

    // Cleanup on component unmount
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

export default TimeDomainVisualizer;
