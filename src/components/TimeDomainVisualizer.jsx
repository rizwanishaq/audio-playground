'use client'
import React, { useRef, useEffect } from 'react';

const TimeDomainVisualizer = ({ data }) => {
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

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 200, 255)'; // Color of the waveform
      ctx.beginPath();

      const sliceWidth = (width - padding * 2) / data.length; // Adjust width for padding
      let x = padding;

      for (let i = 0; i < data.length; i++) {
        const v = (data[i] / 128.0) - 1; // Normalize amplitude (0-255) to (-1 to 1)
        const y = (height / 2) + (v * (height - padding * 2)) / 2; // Invert the y-axis

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width - padding, height / 2); // Finish the waveform path
      ctx.stroke();

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
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Time (s)`, width / 2, height - 10);
      ctx.fillText(`0`, padding, height - 10); // Starting time
      ctx.fillText(`${(data.length / 44100).toFixed(3)} s`, width - padding, height - 10); // Total time for the buffer

      // Label Y-axis (Amplitude)
      ctx.save();
      ctx.textAlign = 'right';
      ctx.fillText('1', padding - 10, padding); // Max amplitude
      ctx.fillText('-1', padding - 10, height - padding); // Min amplitude
      ctx.translate(padding - 30, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('Amplitude', 0, 0);
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

export default TimeDomainVisualizer;
