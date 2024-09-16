'use client'
import { useEffect, useRef, useState } from 'react';
import TimeDomainVisualizer from './TimeDomainVisualizer';
import FrequencyDomainVisualizer from './FrequencyDomainVisualizer';

const AudioInput = () => {
  const [timeDomainData, setTimeDomainData] = useState(null);
  const [frequencyDomainData, setFrequencyDomainData] = useState(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;

        const analyserNode = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyserNode);

        analyserNode.fftSize = 2048;
        const bufferLength = analyserNode.frequencyBinCount;
        const timeDomainArray = new Uint8Array(bufferLength);
        const frequencyArray = new Uint8Array(bufferLength);

        const worker = new Worker('/workers/audioWorker.js');

        worker.onmessage = function (e) {
          const { type, data } = e.data;
          if (type === 'time-domain') {
            setTimeDomainData(data);
          } else if (type === 'frequency-domain') {
            setFrequencyDomainData(data);
          }
        };

        const sendDataToWorker = () => {
          analyserNode.getByteTimeDomainData(timeDomainArray);
          analyserNode.getByteFrequencyData(frequencyArray);
          worker.postMessage({ type: 'data', timeDomainArray, frequencyArray });
        };

        const drawVisualization = () => {
          const draw = () => {
            requestAnimationFrame(draw);
            sendDataToWorker();
          };

          draw();
        };

        drawVisualization();
      });
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center">
      <div className="w-full flex-1 flex items-center justify-center mb-4">
        <TimeDomainVisualizer data={timeDomainData} />
      </div>
      <div className="w-full flex-1 flex items-center justify-center">
        <FrequencyDomainVisualizer data={frequencyDomainData} />
      </div>
    </div>
  );
};

export default AudioInput;
