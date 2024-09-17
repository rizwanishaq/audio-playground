/**
 * Applies a Finite Impulse Response (FIR) filter to the input signal.
 * @param {Float32Array} input - The audio buffer to filter.
 * @param {Float32Array} coefficients - The FIR filter coefficients.
 * @returns {Float32Array} - The filtered audio buffer.
 */
const applyFIRFilter = (input, coefficients) => {
    const output = new Float32Array(input.length);
    const filterLength = coefficients.length;
  
    // Loop through each sample of the input buffer
    for (let i = 0; i < input.length; i++) {
      let sum = 0;
  
      // Convolve input signal with FIR filter coefficients
      for (let j = 0; j < filterLength; j++) {
        if (i - j >= 0) {
          sum += input[i - j] * coefficients[j];
        }
      }
  
      output[i] = sum;
    }
  
    return output;
  };
  
  /**
   * Generates low-pass FIR filter coefficients using the windowed-sinc method.
   * @param {number} cutoffFrequency - The cutoff frequency of the filter in Hz.
   * @param {number} sampleRate - The sample rate of the input signal in Hz.
   * @returns {Float32Array} - The FIR filter coefficients.
   */
  const getLowPassFIRCoefficients = (cutoffFrequency, sampleRate) => {
    const filterLength = 101; // More taps (longer filter) = better filtering, but more computation
    const coefficients = new Float32Array(filterLength);
  
    // Normalized cutoff frequency (in range [0, 1] where 1 is Nyquist frequency)
    const normalizedCutoff = cutoffFrequency / (sampleRate / 2);
    
    // Sinc function
    const sinc = (x) => (x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x));
  
    // Hamming window function to reduce spectral leakage
    const window = (i, N) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
  
    // Calculate the filter coefficients using the windowed-sinc method
    for (let i = 0; i < filterLength; i++) {
      const x = i - (filterLength - 1) / 2; // Center the filter around 0
      coefficients[i] = sinc(x * normalizedCutoff) * window(i, filterLength);
    }
  
    return coefficients;
  };
  
  /**
   * Downsamples an audio buffer from a higher sample rate to a lower one.
   * The function applies an anti-aliasing filter before downsampling to prevent aliasing artifacts.
   * 
   * @param {Float32Array} buffer - The audio buffer to be downsampled.
   * @param {number} recordSampleRate - The original sample rate of the audio buffer.
   * @param {number} targetSampleRate - The target sample rate to downsample to.
   * @returns {Float32Array} - The downsampled audio buffer.
   * @throws Will throw an error if the target sample rate is greater than the recorded sample rate.
   */
  export const downsampleBuffer = (buffer, recordSampleRate, targetSampleRate) => {
    // Ensure target sample rate is lower than original sample rate
    if (targetSampleRate === recordSampleRate) return buffer;
    if (targetSampleRate > recordSampleRate)
      throw new Error("Target sample rate must be lower than recorded sample rate");
  
    const sampleRateRatio = recordSampleRate / targetSampleRate;
  
    // Step 1: Apply a low-pass filter (anti-aliasing) to avoid aliasing
    const nyquistFrequency = targetSampleRate / 2;
    const firCoefficients = getLowPassFIRCoefficients(nyquistFrequency, recordSampleRate);
    const filteredBuffer = applyFIRFilter(buffer, firCoefficients);
  
    // Step 2: Decimate (downsample) by the sample rate ratio
    const newLength = Math.floor(filteredBuffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
  
    // Efficiently select every nth sample based on the ratio
    for (let i = 0; i < newLength; i++) {
      result[i] = filteredBuffer[Math.floor(i * sampleRateRatio)];
    }
  
    return result;
  };
  