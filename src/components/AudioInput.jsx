'use client';
import { useEffect, useRef, useState } from 'react';
import TimeDomainVisualizer from './TimeDomainVisualizer';
import FrequencyDomainVisualizer from './FrequencyDomainVisualizer';
import { Tooltip } from 'react-tooltip';
import CircularFrequencyDomainVisualizer from './CircularFrequencyDomainVisualizer';

const AudioInput = () => {
  const [timeDomainData, setTimeDomainData] = useState(null);
  const [frequencyDomainData, setFrequencyDomainData] = useState(null);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [loading, setLoading] = useState(false); // For loading animation
  const audioCtxRef = useRef(null);

  const startAudio = () => {
    if (typeof window !== 'undefined') {
      setLoading(true); // Start loading
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
        setLoading(false); // Stop loading when audio starts
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-700 my-4 animate-bounce">Real-time Audio Visualization</h1>
      {!isAudioStarted ? (
        <div className="flex flex-col items-center justify-center h-3/4">
          {loading ? (
            <div className="spinner-border text-blue-500 animate-spin w-16 h-16"></div>
          ) : (
            <button
              onClick={() => {
                setIsAudioStarted(true);
                startAudio();
              }}
              className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-indigo-500 hover:to-blue-400 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Start Audio
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="w-full flex-1 flex items-center justify-center mb-4">
            <TimeDomainVisualizer data={timeDomainData} />
            <Tooltip id="time-domain-tip" content="Displays the time-domain waveform of the input audio signal." />
            <span className="text-sm text-gray-500 mt-2" data-tooltip-id="time-domain-tip">
              Time Domain
            </span>
          </div>
          <div className="w-full flex-1 flex items-center justify-center">
            {/* <FrequencyDomainVisualizer data={frequencyDomainData} /> */}
            <CircularFrequencyDomainVisualizer data={frequencyDomainData} />
            <Tooltip id="frequency-domain-tip" content="Shows the frequency-domain analysis (spectrum) of the audio." />
            <span className="text-sm text-gray-500 mt-2" data-tooltip-id="frequency-domain-tip">
              Frequency Domain
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioInput;
