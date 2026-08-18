/**
 * Asynchronous OpenCV.js Loader with Fallback Support
 * Loads OpenCV.js (WebAssembly / JavaScript) dynamically from CDN.
 */

let opencvPromise = null;

export const loadOpenCV = () => {
  if (opencvPromise) return opencvPromise;

  opencvPromise = new Promise((resolve) => {
    // If cv is already defined and initialized on window
    if (window.cv && window.cv.Mat) {
      console.log("⚡ OpenCV.js is already loaded.");
      return resolve({ loaded: true, cv: window.cv });
    }

    // Callback when OpenCV runtime is initialized
    window.Module = {
      onRuntimeInitialized: () => {
        console.log("🚀 OpenCV.js WebAssembly runtime initialized successfully.");
        resolve({ loaded: true, cv: window.cv });
      },
    };

    const existingScript = document.getElementById("opencv-script");
    if (existingScript) {
      // Script already added, wait for initialization
      let timeoutCounter = 0;
      const checkInterval = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          clearInterval(checkInterval);
          resolve({ loaded: true, cv: window.cv });
        }
        timeoutCounter += 100;
        if (timeoutCounter > 8000) {
          clearInterval(checkInterval);
          console.warn("⚠️ OpenCV.js load timeout. Falling back to native canvas vision algorithms.");
          resolve({ loaded: false, cv: null, fallback: true });
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "opencv-script";
    script.async = true;
    script.src = "https://docs.opencv.org/4.8.0/opencv.js";

    script.onerror = () => {
      console.warn("⚠️ Failed to load OpenCV.js from CDN. Using high-performance Canvas Computer Vision engine.");
      resolve({ loaded: false, cv: null, fallback: true });
    };

    // Timeout safety (5 seconds) so app is never blocked
    const fallbackTimeout = setTimeout(() => {
      if (!window.cv || !window.cv.Mat) {
        console.info("ℹ️ OpenCV CDN took >5s; initializing parallel Canvas Vision Engine.");
        resolve({ loaded: false, cv: window.cv || null, fallback: true });
      }
    }, 5000);

    script.onload = () => {
      if (window.cv && window.cv.Mat) {
        clearTimeout(fallbackTimeout);
        resolve({ loaded: true, cv: window.cv });
      }
    };

    document.head.appendChild(script);
  });

  return opencvPromise;
};
