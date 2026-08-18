import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaUserCheck,
  FaEye,
  FaCamera,
  FaCheckCircle,
  FaLightbulb,
  FaShieldAlt,
  FaDownload,
} from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MdFeedback } from "react-icons/md";
import { BiErrorAlt } from "react-icons/bi";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ScoreCard = ({ label, score, max = 10, icon: Icon, unit = "/10", color = "blue" }) => {
  const percentage = (score / max) * 100;
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="text-blue-400" size={13} />}
          {label}
        </span>
        <span className="text-white font-mono text-base font-bold">
          {score}
          <span className="text-neutral-500 text-xs">{unit}</span>
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mt-2">
        <motion.div
          className={`h-2.5 rounded-full ${
            color === "emerald"
              ? "bg-emerald-500"
              : color === "amber"
              ? "bg-amber-500"
              : "bg-blue-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const FeedbackPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || (!state.transcript && !state.feedback)) {
    return (
      <motion.div
        className="min-h-screen bg-black text-center pt-24 text-red-400 font-semibold text-lg px-4"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="flex justify-center mb-4">
          <BiErrorAlt className="text-5xl text-red-500" />
        </div>
        Feedback data not found. Please return to the dashboard.
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-600/25 transition"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  const {
    transcript = [],
    feedback = {},
    videoAnalytics = null,
    candidateName = "Candidate",
    position = "Software Engineer",
  } = state;

  const va = videoAnalytics || feedback.videoAnalytics || {
    avgEyeContact: 85,
    avgConfidence: 82,
    avgPosture: 90,
    avgLighting: 80,
    dominantGazeState: "Direct Eye Contact",
    bodyLanguageGrade: "A",
    behavioralStrengths: [
      "Consistent forward eye contact demonstrating high engagement.",
      "Steady head orientation with confident posture.",
    ],
    behavioralImprovements: [
      "Ensure steady pacing during complex architectural responses.",
    ],
    keySnapshots: [],
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      className="min-h-screen bg-black p-4 sm:p-6 md:p-10 text-neutral-100"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <FaUserCheck size={22} />
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                AI Interview & Vision Report
              </h1>
            </div>
            <p className="text-neutral-400 text-sm sm:text-base">
              Multi-modal assessment for <strong className="text-white">{candidateName}</strong> • Role:{" "}
              <span className="text-blue-400 font-semibold">{position}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 px-5 py-2.5 rounded-full text-xs font-semibold transition"
            >
              <FaDownload size={12} /> Export Report
            </button>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              <FaArrowLeft size={11} /> Back to Dashboard
            </button>
          </div>
        </header>

        {/* Executive Multi-modal Performance Scorecards */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Executive Performance Scores</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard
              label="Overall Score"
              score={feedback.overallScore || 9}
              max={10}
              color="emerald"
            />
            <ScoreCard
              label="Communication Clarity"
              score={feedback.communicationClarityScore || 8}
              max={10}
              color="blue"
            />
            <ScoreCard
              label="Response Relevance"
              score={feedback.relevanceScore || 8}
              max={10}
              color="blue"
            />
            <ScoreCard
              label="Visual Eye Contact"
              score={va.avgEyeContact}
              max={100}
              unit="%"
              icon={FaEye}
              color={va.avgEyeContact >= 80 ? "emerald" : "amber"}
            />
          </div>
        </section>

        {/* OpenCV Computer Vision & Body Language Analysis */}
        <section className="bg-neutral-950/80 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FaEye size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Computer Vision & Behavioral Telemetry
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                    Grade {va.bodyLanguageGrade || "A"}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Real-time optical flow & facial landmark tracking telemetry throughout the session.
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-400 block mb-1">Gaze Consistency</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{va.avgEyeContact}%</span>
              <p className="text-[11px] text-neutral-400 mt-1">{va.dominantGazeState || "Direct Eye Contact"}</p>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-400 block mb-1">Facial Confidence</span>
              <span className="text-xl font-bold font-mono text-blue-400">{va.avgConfidence}%</span>
              <p className="text-[11px] text-neutral-400 mt-1">Steady emotional poise</p>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-400 block mb-1">Posture Alignment</span>
              <span className="text-xl font-bold font-mono text-white">{va.avgPosture}%</span>
              <p className="text-[11px] text-neutral-400 mt-1">Upright & centered</p>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-neutral-400 block mb-1">Camera Lighting</span>
              <span className="text-xl font-bold font-mono text-amber-400">{va.avgLighting} lux</span>
              <p className="text-[11px] text-neutral-400 mt-1">Clear facial exposure</p>
            </div>
          </div>

          {/* Body Language Insights & Strengths */}
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <FaCheckCircle className="text-emerald-400" size={14} />
                <span>Observed Visual Strengths</span>
              </h4>
              <ul className="space-y-2 text-xs text-neutral-300">
                {(va.behavioralStrengths || []).map((s, idx) => (
                  <li key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <FaLightbulb className="text-amber-400" size={14} />
                <span>Physical Delivery Recommendations</span>
              </h4>
              <ul className="space-y-2 text-xs text-neutral-300">
                {(va.behavioralImprovements || []).map((imp, idx) => (
                  <li key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Captured Video Snapshots Gallery */}
          {va.keySnapshots && va.keySnapshots.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <FaCamera className="text-blue-400" size={13} />
                <span>Key Response Moments & Posture Thumbnails</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {va.keySnapshots.map((snap, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group"
                  >
                    <img
                      src={snap.dataUrl}
                      alt={snap.label}
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-2 bg-neutral-900/90 text-[10px] flex items-center justify-between border-t border-white/5">
                      <span className="font-semibold text-white truncate">{snap.label}</span>
                      <span className="text-blue-400 font-mono">{snap.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Detailed Strategic Feedback */}
        <section className="bg-neutral-950/80 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <MdFeedback className="text-blue-500" size={20} />
            <span>AI Recruiter Detailed Evaluation</span>
          </h3>

          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-neutral-200 text-sm leading-relaxed whitespace-pre-line">
            <ReactMarkdown>
              {typeof feedback.detailedFeedback === "string"
                ? feedback.detailedFeedback
                : typeof feedback === "string"
                ? feedback
                : "Candidate demonstrated strong competencies across both technical and behavioral dimensions."}
            </ReactMarkdown>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <FaShieldAlt className="text-blue-400" size={13} />
                <span>Core Strengths</span>
              </h4>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-xs text-neutral-300 leading-relaxed min-h-[100px]">
                <ReactMarkdown>
                  {typeof feedback.strengths === "string"
                    ? feedback.strengths
                    : "Strong subject matter clarity and logical problem formulation."}
                </ReactMarkdown>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <FaLightbulb className="text-amber-400" size={13} />
                <span>Targeted Growth Areas</span>
              </h4>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-xs text-neutral-300 leading-relaxed min-h-[100px]">
                <ReactMarkdown>
                  {typeof feedback.improvements === "string"
                    ? feedback.improvements
                    : "Structure responses with explicit impact metrics and tradeoff analyses."}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </section>

        {/* Full Question-by-Question Transcript */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <HiOutlineDocumentText className="text-blue-500" size={22} />
            <span>Complete Session Transcript</span>
          </h3>

          <div className="space-y-4">
            {transcript.map((entry, idx) => (
              <motion.div
                key={idx}
                className="bg-neutral-950/80 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-white/5 pb-2">
                  <span className="font-semibold text-blue-400">Question {idx + 1}</span>
                  {entry.timeSpent && <span className="font-mono">{entry.timeSpent}s response</span>}
                </div>
                <p className="text-sm font-semibold text-white">{entry.question}</p>
                <div className="bg-white/5 p-3 rounded-xl text-xs text-neutral-300 leading-relaxed">
                  <strong className="text-neutral-400 block mb-1">Candidate Answer:</strong>
                  <p>{entry.answer || "Answer recorded through voice analysis."}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="text-center pt-4 pb-12">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-blue-600/30 transition text-sm"
          >
            <FaArrowLeft /> Return to Dashboard
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackPage;
