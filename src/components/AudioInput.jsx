'use client';
import { useState, useEffect, useRef } from 'react';
import TimeDomainVisualizer from './TimeDomainVisualizer';
import FrequencyDomainVisualizer from './FrequencyDomainVisualizer';
import CircularFrequencyDomainVisualizer from './CircularFrequencyDomainVisualizer';
import AudioAnalyzer from './AudioAnalyzer';
import { Tooltip } from 'react-tooltip';

const AudioInput = () => {
  const [timeDomainData, setTimeDomainData] = useState(null);
  const [frequencyDomainData, setFrequencyDomainData] = useState(null);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [loading, setLoading] = useState(false); // For loading animation
  const [activeTab, setActiveTab] = useState('time'); // State for main tabs
  const [subTab, setSubTab] = useState('frequency'); // State for sub-tabs
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
        <div className="w-full flex flex-col items-center">
          <div className="flex mb-4">
            <button
              onClick={() => setActiveTab('time')}
              className={`px-4 py-2 text-lg font-semibold ${activeTab === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} rounded-l-md`}
            >
              Time Domain
            </button>
            <button
              onClick={() => setActiveTab('frequency')}
              className={`px-4 py-2 text-lg font-semibold ${activeTab === 'frequency' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              Frequency & Circular Frequency Domain
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 text-lg font-semibold ${activeTab === 'features' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} rounded-r-md`}
            >
              Features
            </button>
          </div>

          {activeTab === 'time' ? (
            <div className="w-full flex-1 flex items-center justify-center mb-4">
              <TimeDomainVisualizer data={timeDomainData} />
              <Tooltip id="time-domain-tip" content="Displays the time-domain waveform of the input audio signal." />
              <span className="text-sm text-gray-500 mt-2" data-tooltip-id="time-domain-tip">
                Time Domain
              </span>
            </div>
          ) : activeTab === 'frequency' ? (
            <>
              <div className="flex mb-4">
                <button
                  onClick={() => setSubTab('frequency')}
                  className={`px-4 py-2 text-lg font-semibold ${subTab === 'frequency' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} rounded-l-md`}
                >
                  Frequency Domain
                </button>
                <button
                  onClick={() => setSubTab('circular')}
                  className={`px-4 py-2 text-lg font-semibold ${subTab === 'circular' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} rounded-r-md`}
                >
                  Circular Frequency Domain
                </button>
              </div>
              {subTab === 'frequency' ? (
                <div className="w-full flex-1 flex items-center justify-center">
                  <FrequencyDomainVisualizer data={frequencyDomainData} />
                  <Tooltip id="frequency-domain-tip" content="Shows the frequency-domain analysis (spectrum) of the audio." />
                  <span className="text-sm text-gray-500 mt-2" data-tooltip-id="frequency-domain-tip">
                    Frequency Domain
                  </span>
                </div>
              ) : (
                <div className="w-full flex-1 flex items-center justify-center">
                  <CircularFrequencyDomainVisualizer data={frequencyDomainData}  />
                  <Tooltip id="circular-frequency-domain-tip" content="Shows the circular frequency-domain analysis of the audio." />
                  <span className="text-sm text-gray-500 mt-2" data-tooltip-id="circular-frequency-domain-tip">
                    Circular Frequency Domain
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              <AudioAnalyzer />
              <Tooltip id="features-tip" content="Displays real-time audio analysis features like Chroma and MFCC." />
              <span className="text-sm text-gray-500 mt-2" data-tooltip-id="features-tip">
                Features
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioInput;
