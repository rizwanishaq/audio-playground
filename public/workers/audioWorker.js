// audioWorker.js

self.onmessage = function (e) {
  const { type, timeDomainArray, frequencyArray } = e.data;
  

  if (type === 'data') {
    if (timeDomainArray && frequencyArray) {
      // Send time-domain data
      self.postMessage({
        type: 'time-domain',
        data: timeDomainArray
      });

      // Send frequency-domain data
      self.postMessage({
        type: 'frequency-domain',
        data: frequencyArray
      });
    }
  }
};
