import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUpload,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaThumbsDown,
  FaThumbsUp,
  FaLightbulb,
  FaArrowUp,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
} from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";

GlobalWorkerOptions.workerSrc = workerSrc;

const MODEL_NAME = "models/gemini-2.5-flash-preview-05-20";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const steps = [
  "Uploading resume...",
  "Extracting text from PDF...",
  "Parsing education and experience...",
  "Scanning keywords and skills...",
  "Analyzing ATS compatibility...",
  "Generating insights...",
];

function LoadingSteps() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="text-blue-500 text-5xl mb-4"
      >
        <FaSpinner />
      </motion.div>
      <motion.p
        key={stepIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-lg font-semibold text-neutral-300"
      >
        {steps[stepIndex]}
      </motion.p>
    </div>
  );
}

function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [responseJSON, setResponseJSON] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [accordionOpen, setAccordionOpen] = useState({
    improvements: true,
    suggestions: true,
    weaknesses: true,
    strengths: true,
  });

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n\n";
    }
    return text.trim();
  };

  const handleFileUpload = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;

    try {
      if (fileType === "application/pdf") {
        const text = await extractTextFromPDF(file);
        setResumeText(text);
      } else if (
        fileType === "text/plain" ||
        fileType === "application/msword" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const text = await file.text();
        setResumeText(text);
      } else {
        setError("Unsupported file format. Please upload PDF or TXT files.");
      }
    } catch (err) {
      setError("Failed to extract text from the uploaded file.");
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText?.trim()) {
      setError("Please upload a resume before analyzing.");
      return;
    }

    setError("");
    setLoading(true);
    setResponseJSON(null);
    setSuccess(false);

    try {
      if (!API_KEY) {
        throw new Error(
          "Missing API key. Set VITE_GEMINI_API_KEY in your environment."
        );
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `You are an AI resume reviewer. Analyze the following resume text and respond ONLY with a JSON array containing one object exactly in this format:

[
  {
    "resumeScore": number (0 to 100),
    "atsCompatibility": number (0 to 100),
    "improvements": [array of plain strings],
    "suggestions": [array of plain strings],
    "weaknesses": [array of plain strings],
    "strengths": [array of plain strings],
    "recommendedRoles": [exactly 3 job role strings]
  }
]

Resume:
${resumeText}`;

      const result = await model.generateContent(prompt);
      const raw = (await result.response.text()).trim();

      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        const jsonStart = raw.indexOf("[");
        const jsonEnd = raw.lastIndexOf("]");
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonString = raw.slice(jsonStart, jsonEnd + 1);
          parsed = JSON.parse(jsonString);
        } else {
          console.error("Raw model response (not JSON):", raw);
          throw new Error("Model did not return valid JSON.");
        }
      }

      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setResponseJSON(parsed);
        setTimeout(() => setSuccess(false), 1500);
      }, steps.length * 2000);
    } catch (err) {
      console.error("Analyze error:", err);
      setError(err.message || "Error analyzing resume.");
      setLoading(false);
    }
  };

  const resetAll = () => {
    setResumeText("");
    setResponseJSON(null);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-50 px-6 py-10 max-w-6xl mx-auto"
    >
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-white font-semibold tracking-tight">
          AI Resume Analyzer
        </h1>
      </header>

      <section className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <label
          htmlFor="file-upload"
          className={`flex items-center gap-2 cursor-pointer py-3 px-6 rounded-full font-semibold transition select-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            resumeText.trim()
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "border-2 border-dashed border-white/15 hover:border-blue-500/50 bg-white/5 text-white"
          }`}
        >
          {resumeText.trim() ? (
            <>
              <FaCheckCircle />
              Resume Uploaded
            </>
          ) : (
            <>
              <FaUpload className="text-blue-500" />
              Upload Resume (PDF or TXT)
            </>
          )}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileUpload}
          ref={fileInputRef}
        />

        <motion.button
          whileHover={{ scale: loading || !resumeText.trim() ? 1 : 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAnalyze}
          disabled={loading || !resumeText.trim()}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition shadow-lg ${
            loading
              ? "bg-white/10 text-neutral-400 cursor-not-allowed"
              : resumeText.trim()
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
              : "bg-blue-600/30 cursor-not-allowed text-white/60"
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <FaFileAlt /> Analyze Resume
            </>
          )}
        </motion.button>

        {responseJSON && !loading && !success && (
          <button
            onClick={resetAll}
            className="flex items-center gap-2 ml-auto border border-white/20 text-white hover:bg-white/10 px-5 py-3 rounded-full font-semibold transition"
          >
            <FaArrowUp /> Upload Another Resume
          </button>
        )}
      </section>

      {error && (
        <p
          className="bg-red-500/15 text-red-400 rounded-xl px-4 py-3 font-semibold mb-4"
          role="alert"
        >
          {error}
        </p>
      )}

      {loading && <LoadingSteps />}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center py-10"
        >
          <FaCheckCircle className="text-emerald-400 text-6xl mb-4" />
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Resume Analysis Ready!
          </h2>
        </motion.div>
      )}

      {!loading && !success && responseJSON && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {responseJSON.map((result, idx) => (
            <React.Fragment key={idx}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition"
              >
                <h3 className="text-xl font-semibold mb-4 text-center flex justify-center items-center gap-2 text-white">
                  <FaCheckCircle className="text-blue-500" /> Resume Score
                </h3>
                <p
                  className={`text-5xl font-bold text-center ${
                    result.resumeScore >= 80
                      ? "text-emerald-400"
                      : result.resumeScore >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {result.resumeScore}%
                </p>
                <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${result.resumeScore}%` }}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition"
              >
                <h3 className="text-xl font-semibold mb-4 text-center flex justify-center items-center gap-2 text-white">
                  <FaLightbulb className="text-blue-500" /> ATS Compatibility
                </h3>
                <p
                  className={`text-5xl font-bold text-center ${
                    result.atsCompatibility >= 80
                      ? "text-emerald-400"
                      : result.atsCompatibility >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {result.atsCompatibility}%
                </p>
                <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${result.atsCompatibility}%` }}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl col-span-full bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition"
              >
                <h3 className="text-xl font-semibold mb-4 text-center flex justify-center items-center gap-2 text-white">
                  <FaLightbulb className="text-blue-500" /> Recommended Job
                  Roles
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {result.recommendedRoles && result.recommendedRoles.length ? (
                    result.recommendedRoles.map((role, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          window.open(
                            `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
                              role
                            )}`,
                            "_blank"
                          )
                        }
                        className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition"
                      >
                        {role}
                      </button>
                    ))
                  ) : (
                    <p className="text-neutral-400">No roles suggested.</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl col-span-full bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition cursor-pointer select-none"
                onClick={() => toggleAccordion("improvements")}
              >
                <h3 className="text-xl font-semibold border-b border-white/10 pb-3 mb-4 flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <FaThumbsDown className="text-blue-500" /> Improvements
                  </span>
                  {accordionOpen.improvements ? (
                    <FaChevronUp className="text-neutral-400" />
                  ) : (
                    <FaChevronDown className="text-neutral-400" />
                  )}
                </h3>
                {accordionOpen.improvements && (
                  <ul className="list-disc list-inside space-y-1 text-base text-neutral-300 max-h-60 overflow-y-auto">
                    {result.improvements.length ? (
                      result.improvements.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                      <li>No improvements noted.</li>
                    )}
                  </ul>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl col-span-full bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition cursor-pointer select-none"
                onClick={() => toggleAccordion("suggestions")}
              >
                <h3 className="text-xl font-semibold border-b border-white/10 pb-3 mb-4 flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-amber-400" /> Suggestions
                  </span>
                  {accordionOpen.suggestions ? (
                    <FaChevronUp className="text-neutral-400" />
                  ) : (
                    <FaChevronDown className="text-neutral-400" />
                  )}
                </h3>
                {accordionOpen.suggestions && (
                  <ul className="list-disc list-inside space-y-1 text-base text-neutral-300 max-h-60 overflow-y-auto">
                    {result.suggestions.length ? (
                      result.suggestions.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                      <li>No suggestions noted.</li>
                    )}
                  </ul>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl col-span-full bg-red-500/10 border border-red-500/20 backdrop-blur-xl hover:border-red-500/40 transition cursor-pointer select-none"
                onClick={() => toggleAccordion("weaknesses")}
              >
                <h3 className="text-xl font-semibold border-b border-red-500/20 pb-3 mb-4 flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <FaThumbsDown className="text-red-400" /> Weaknesses
                  </span>
                  {accordionOpen.weaknesses ? (
                    <FaChevronUp className="text-neutral-400" />
                  ) : (
                    <FaChevronDown className="text-neutral-400" />
                  )}
                </h3>
                {accordionOpen.weaknesses && (
                  <ul className="list-disc list-inside space-y-1 text-base text-neutral-300 max-h-60 overflow-y-auto">
                    {result.weaknesses.length ? (
                      result.weaknesses.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                      <li>No weaknesses noted.</li>
                    )}
                  </ul>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl col-span-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl hover:border-emerald-500/40 transition cursor-pointer select-none"
                onClick={() => toggleAccordion("strengths")}
              >
                <h3 className="text-xl font-semibold border-b border-emerald-500/20 pb-3 mb-4 flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <FaThumbsUp className="text-emerald-400" /> Strengths
                  </span>
                  {accordionOpen.strengths ? (
                    <FaChevronUp className="text-neutral-400" />
                  ) : (
                    <FaChevronDown className="text-neutral-400" />
                  )}
                </h3>
                {accordionOpen.strengths && (
                  <ul className="list-disc list-inside space-y-1 text-base text-neutral-300 max-h-60 overflow-y-auto">
                    {result.strengths.length ? (
                      result.strengths.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                      <li>No strengths noted.</li>
                    )}
                  </ul>
                )}
              </motion.div>
            </React.Fragment>
          ))}
        </section>
      )}
    </motion.div>
  );
}

export default ResumeAnalyzer;
