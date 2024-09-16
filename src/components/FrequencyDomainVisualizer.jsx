'use client';
import React, { useRef, useEffect } from 'react';

const FrequencyDomainVisualizer = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas for new frame
      ctx.clearRect(0, 0, width, height);

      // Padding for axes
      const padding = 40;

      // Draw frequency bars with color gradient
      const sliceWidth = (width - padding * 2) / data.length; // Adjust width for padding

      for (let i = 0; i < data.length; i++) {
        const x = padding + i * sliceWidth;
        const barHeight = ((data[i] / 255) * (height - padding * 2)); // Scale to height
        
        // Color gradient based on amplitude, using a typical spectrogram color map
        const normalized = data[i] / 255;
        const r = Math.min(255, Math.max(0, Math.round(255 * (1 - normalized))));
        const g = Math.min(255, Math.max(0, Math.round(255 * (normalized * 2))));
        const b = Math.min(255, Math.max(0, Math.round(255 * (normalized * 0.5))));
        const color = `rgb(${r}, ${g}, ${b})`;

        ctx.fillStyle = color;
        ctx.fillRect(x, height - padding - barHeight, sliceWidth, barHeight);
      }

      // Draw X-axis (frequency)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'gray';
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Draw Y-axis (amplitude)
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.stroke();

      // Label X-axis (Frequency)
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Frequency (Hz)`, width / 2, height - 10);
      ctx.fillText(`0`, padding, height - 10); // Starting frequency
      ctx.fillText(`${(data.length * 44100 / 2048).toFixed(0)} Hz`, width - padding, height - 10); // Total frequency range

      // Label Y-axis (Amplitude in dB)
      ctx.save();
      ctx.textAlign = 'right';
      ctx.fillText('0 dB', padding - 10, padding); // Max amplitude
      ctx.fillText('-80 dB', padding - 10, height - padding); // Min amplitude
      ctx.translate(padding - 30, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('Amplitude (dB)', 0, 0);
      ctx.restore();
    }
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

export default FrequencyDomainVisualizer;
