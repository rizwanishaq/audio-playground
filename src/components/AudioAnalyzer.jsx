'use client'
import { useState, useEffect, useRef } from "react";
import Meyda from "meyda";
import * as d3 from "d3";
import { scaleLinear } from 'd3-scale';

const AudioAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [features, setFeatures] = useState([]);
  const [chromaValues, setChromaValues] = useState(new Array(12).fill(0));
  const [mfccValues, setMfccValues] = useState(new Array(13).fill(0));
  const svgRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const meydaAnalyzerRef = useRef(null);
  const depth = 40;  // Depth of the grid

  // Define a color scale for MFCC bands
  const colorScale = scaleLinear()
    .domain([0, 50])  // Adjust domain as needed based on your value range
    .range(["#d4edda", "#c3e6cb"]);  // Color gradient from light green (low) to dark green (high)

    useEffect(() => {
      const svg = d3.select(svgRef.current);
      const width = 600;
      const height = 300;
      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    
      svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
      const xScale = d3.scaleLinear().domain([0, depth]).range([0, width]);
    
      // Paths for each feature
      const pathRMS = g.append("path").attr("fill", "none").attr("stroke", "magenta").attr("stroke-width", 2);
      const pathCentroid = g.append("path").attr("fill", "none").attr("stroke", "yellow").attr("stroke-width", 2);
      const pathRolloff = g.append("path").attr("fill", "none").attr("stroke", "blue").attr("stroke-width", 2);
    
      const legend = svg.append("g").attr("transform", `translate(${width - 120},${margin.top})`);
    
      const legends = [
        { color: "magenta", label: "RMS" },
        { color: "yellow", label: "Spectral Centroid" },
        { color: "blue", label: "Spectral Rolloff" },
      ];
    
      legends.forEach((d, i) => {
        const legendGroup = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    
        legendGroup.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", d.color);
    
        legendGroup.append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .style("text-anchor", "start")
          .style("font-size", "12px")
          .text(d.label);
      });
    
      // Dynamic scaling based on actual data range
      const spectralCentroidValues = features.map(f => f.spectralCentroid);
      const minCentroid = d3.min(spectralCentroidValues);
      const maxCentroid = d3.max(spectralCentroidValues);
    
      // Scaling factors for better visibility
      const scaleFactor = {
        rms: 2,
        spectralCentroid: 1 / (maxCentroid || 1), // Dynamic scaling based on range
        spectralRolloff: 0.2,
      };
    
      // Y scale for general feature values
      const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);
    
      // Dynamic Y scale for spectralCentroid
      const yScaleCentroid = d3.scaleLinear()
        .domain([minCentroid, maxCentroid])
        .range([height, 0]);
    
      const updateChart = () => {
        const lineRMS = d3.line()
          .x((d, i) => xScale(i))
          .y((d) => yScale(d.rms * scaleFactor.rms))
          .curve(d3.curveMonotoneX);
    
        const lineCentroid = d3.line()
          .x((d, i) => xScale(i))
          .y((d) => yScaleCentroid(d.spectralCentroid)) // Use dynamic yScale for Centroid
          .curve(d3.curveMonotoneX);
    
        const lineRolloff = d3.line()
          .x((d, i) => xScale(i))
          .y((d) => yScale(d.spectralRolloff * scaleFactor.spectralRolloff))
          .curve(d3.curveMonotoneX);
    
        pathRMS.datum(features).attr("d", lineRMS);
        pathCentroid.datum(features).attr("d", lineCentroid);
        pathRolloff.datum(features).attr("d", lineRolloff);
      };
    
      const animate = () => {
        updateChart();
        requestAnimationFrame(animate);
      };
    
      animate();
    
      return () => {
        svg.selectAll("*").remove();
      };
    }, [features]);
    
    
  const startRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

        meydaAnalyzerRef.current = Meyda.createMeydaAnalyzer({
          audioContext: audioContextRef.current,
          source: sourceRef.current,
          bufferSize: 256,  // Smaller buffer for faster updates
          featureExtractors: ["rms", "spectralCentroid", "spectralRolloff", "chroma", "mfcc"],
          callback: (features) => {
            setFeatures((prev) => [
              ...prev.slice(-depth),  // Keep only the most recent data points
              {
                rms: features.rms,
                spectralCentroid: features.spectralCentroid / 10000, // Normalized
                spectralRolloff: features.spectralRolloff / 10000,   // Normalized
              }
            ]);

            // Update Chroma and MFCC values
            setChromaValues(features.chroma);
            setMfccValues(features.mfcc);
          },
        });

        meydaAnalyzerRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing the microphone:", error);
      }
    }
  };

  const stopRecording = () => {
    if (isRecording && audioContextRef.current) {
      meydaAnalyzerRef.current.stop();
      audioContextRef.current.close();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Real-time Audio Analysis</h2>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className="mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <svg ref={svgRef}></svg>

      <div className="mt-4">
        <div>Chroma bands:</div>
        <div className="flex">
          {chromaValues.map((value, index) => (
            <button
              key={index}
              className={`w-8 h-8 ${value > 0.5 ? "bg-green-600" : "bg-green-300"} text-white m-1 rounded`}
              style={{ opacity: value }}
            >
              {["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"][index]}
            </button>
          ))}
        </div>

        <div>MFCC bands:</div>
        <div className="flex">
          {mfccValues.map((value, index) => (
            <button
              key={index}
              className={`w-8 h-8`}  // Remove previous color classes
              style={{
                backgroundColor: colorScale(value),  // Apply the color scale
                opacity: value > 0 ? value / 100 : 0.2,  // Ensure visibility for zero values
              }}
            >
              {index}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioAnalyzer;
