import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaEye,
  FaUserCheck,
  FaSlidersH,
  FaSun,
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { loadOpenCV } from "../utils/opencvLoader";
import { VisionAnalyzer } from "../utils/visionAnalyzer";

const ProVideoPanel = ({
  onTelemetryUpdate,
  onCaptureSnapshotRef,
  isUserSpeaking = false,
}) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameId = useRef(null);

  const [isOpenCvReady, setIsOpenCvReady] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [hudOpen, setHudOpen] = useState(false);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showGazeVector, setShowGazeVector] = useState(true);
  const [showHUD, setShowHUD] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [liveMetrics, setLiveMetrics] = useState({
    faceDetected: false,
    eyeContact: 85,
    confidence: 82,
    postureStatus: "Optimal",
    lightingQuality: "Optimal",
    lightingLux: 75,
    gazeState: "Direct Eye Contact",
    fps: 30,
  });

  // Load OpenCV and enumerate video devices
  useEffect(() => {
    loadOpenCV().then((res) => {
      if (res.loaded) {
        setIsOpenCvReady(true);
      }
    });

    navigator.mediaDevices?.enumerateDevices().then((deviceInfos) => {
      const videoInputs = deviceInfos.filter((d) => d.kind === "videoinput");
      setDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    }).catch((e) => console.warn("Failed to enumerate devices:", e));
  }, []);

  // Initialize Vision Analyzer
  useEffect(() => {
    if (!canvasRef.current) return;
    analyzerRef.current = new VisionAnalyzer(canvasRef.current, {
      showBoundingBox,
      showLandmarks,
      showGazeVector,
      showHUD,
    });

    if (onCaptureSnapshotRef) {
      onCaptureSnapshotRef.current = (label) => {
        const video = webcamRef.current?.video;
        if (video && analyzerRef.current) {
          return analyzerRef.current.captureSnapshot(video, label);
        }
        return null;
      };
    }
  }, []);

  // Sync options with analyzer
  useEffect(() => {
    if (analyzerRef.current) {
      analyzerRef.current.setOptions({
        showBoundingBox,
        showLandmarks,
        showGazeVector,
        showHUD,
      });
    }
  }, [showBoundingBox, showLandmarks, showGazeVector, showHUD]);

  // Main Computer Vision Processing Loop
  useEffect(() => {
    let active = true;

    const processLoop = () => {
      if (!active) return;
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2 && cameraEnabled) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        if (analyzerRef.current) {
          const metrics = analyzerRef.current.processFrame(
            video,
            isOpenCvReady,
            window.cv || null
          );

          setLiveMetrics({ ...metrics });
          if (onTelemetryUpdate) {
            onTelemetryUpdate({ ...metrics, analyzer: analyzerRef.current });
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(processLoop);
    };

    animationFrameId.current = requestAnimationFrame(processLoop);

    return () => {
      active = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraEnabled, isOpenCvReady]);

  // Expose session summary extractor
  useEffect(() => {
    return () => {
      if (analyzerRef.current && onTelemetryUpdate) {
        onTelemetryUpdate({
          ...liveMetrics,
          sessionSummary: analyzerRef.current.getSessionSummary(),
        });
      }
    };
  }, []);

  const getEyeContactColor = (val) => {
    if (val >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (val >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  const getPostureBadge = (status) => {
    if (status === "Optimal") {
      return (
        <span className="flex items-center gap-1 text-emerald-400 text-xs">
          <FaCheckCircle size={11} /> Upright
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-amber-400 text-xs">
        <FaExclamationTriangle size={11} /> {status}
      </span>
    );
  };

  return (
    <div className="relative w-full h-full min-h-[380px] md:min-h-[420px] rounded-3xl bg-neutral-950 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col justify-between group">
      {/* Top Pro Status Header */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
        {/* CV Engine & FPS Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-black/75 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-neutral-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>{isOpenCvReady ? "OpenCV.js WASM" : "Vision Engine"}</span>
          <span className="text-white/30">•</span>
          <span className="text-blue-400 font-semibold">{liveMetrics.fps} FPS</span>
        </div>

        {/* Live Speaking Indicator */}
        {isUserSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 bg-blue-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-blue-600/40"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Speaking...</span>
          </motion.div>
        )}

        {/* HUD Customizer Trigger */}
        <button
          onClick={() => setHudOpen(!hudOpen)}
          className="pointer-events-auto w-8 h-8 rounded-full bg-black/75 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-md flex items-center justify-center transition shadow-lg"
          title="Computer Vision HUD Settings"
        >
          <FaSlidersH size={13} />
        </button>
      </div>

      {/* HUD Settings Popover */}
      <AnimatePresence>
        {hudOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-14 right-3 z-40 w-64 bg-neutral-900/95 border border-white/15 backdrop-blur-xl p-4 rounded-2xl shadow-2xl text-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-white">OpenCV HUD Controls</span>
              <span className="text-[10px] text-blue-400 font-mono">LIVE CV</span>
            </div>

            <label className="flex items-center justify-between text-neutral-300 cursor-pointer">
              <span>Face Target Box</span>
              <input
                type="checkbox"
                checked={showBoundingBox}
                onChange={(e) => setShowBoundingBox(e.target.checked)}
                className="rounded accent-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-neutral-300 cursor-pointer">
              <span>Facial Landmarks</span>
              <input
                type="checkbox"
                checked={showLandmarks}
                onChange={(e) => setShowLandmarks(e.target.checked)}
                className="rounded accent-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-neutral-300 cursor-pointer">
              <span>Eye Gaze Reticle</span>
              <input
                type="checkbox"
                checked={showGazeVector}
                onChange={(e) => setShowGazeVector(e.target.checked)}
                className="rounded accent-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-neutral-300 cursor-pointer">
              <span>Telemetry Badges</span>
              <input
                type="checkbox"
                checked={showHUD}
                onChange={(e) => setShowHUD(e.target.checked)}
                className="rounded accent-blue-500"
              />
            </label>

            {devices.length > 1 && (
              <div className="pt-2 border-t border-white/10">
                <label className="text-[11px] text-neutral-400 block mb-1">Camera Input</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-white text-[11px] outline-none"
                >
                  {devices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video & CV Canvas Overlay Container */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {cameraEnabled ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              videoConstraints={{
                deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user",
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Computer Vision Real-Time Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-500 gap-3">
            <FaVideoSlash size={48} className="text-neutral-600" />
            <span className="text-sm font-medium">Camera is turned off</span>
          </div>
        )}
      </div>

      {/* Bottom Pro Telemetry & Control Bar */}
      <div className="relative z-30 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent border-t border-white/5 flex flex-col gap-2">
        {/* Real-Time Metrics Row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* Eye Contact */}
          <div className={`border rounded-xl px-2 py-1.5 backdrop-blur-md transition ${getEyeContactColor(liveMetrics.eyeContact)}`}>
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold opacity-80 mb-0.5">
              <FaEye size={10} /> Eye Contact
            </div>
            <div className="text-base font-bold font-mono">
              {liveMetrics.eyeContact}%
            </div>
          </div>

          {/* Confidence */}
          <div className="border border-blue-500/30 bg-blue-500/10 text-blue-400 rounded-xl px-2 py-1.5 backdrop-blur-md">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold opacity-80 mb-0.5">
              <FaUserCheck size={10} /> Confidence
            </div>
            <div className="text-base font-bold font-mono">
              {liveMetrics.confidence}%
            </div>
          </div>

          {/* Posture */}
          <div className="border border-white/10 bg-white/5 text-neutral-300 rounded-xl px-2 py-1.5 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">
              Posture
            </div>
            <div className="font-semibold text-xs truncate">
              {getPostureBadge(liveMetrics.postureStatus)}
            </div>
          </div>

          {/* Lighting */}
          <div className="border border-white/10 bg-white/5 text-neutral-300 rounded-xl px-2 py-1.5 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">
              <FaSun size={9} /> Light
            </div>
            <div className="text-xs font-semibold text-neutral-200">
              {liveMetrics.lightingQuality}
            </div>
          </div>
        </div>

        {/* Media Controls Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition ${
                cameraEnabled
                  ? "bg-white/10 border-white/15 text-white hover:bg-white/20"
                  : "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
              }`}
            >
              {cameraEnabled ? <FaVideo size={12} /> : <FaVideoSlash size={12} />}
              <span>{cameraEnabled ? "Cam On" : "Cam Off"}</span>
            </button>

            <button
              onClick={() => setMicEnabled(!micEnabled)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition ${
                micEnabled
                  ? "bg-white/10 border-white/15 text-white hover:bg-white/20"
                  : "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
              }`}
            >
              {micEnabled ? <FaMicrophone size={12} /> : <FaMicrophoneSlash size={12} />}
              <span>{micEnabled ? "Mic Active" : "Muted"}</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-mono">
            {liveMetrics.gazeState}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProVideoPanel;
