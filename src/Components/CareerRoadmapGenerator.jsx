import React, { useState, useEffect } from 'react';
import {
  FaRoad,
  FaRedoAlt,
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'models/gemini-2.5-flash-preview-05-20';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const steps = [
  'Analyzing your current role...',
  'Mapping skills to target role...',
  'Designing career milestones...',
  'Estimating timeframes...',
  'Finalizing roadmap...'
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
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
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

function CareerRoadmapGenerator() {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setTimeline([]);
    if (!currentRole.trim() || !targetRole.trim()) {
      setError('Please enter both your current role and target role.');
      return;
    }
    setLoading(true);
    try {
      if (!API_KEY) {
        throw new Error('Missing API key. Set VITE_GEMINI_API_KEY in your environment.');
      }
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const prompt = `You are an expert career advisor. Generate a comprehensive, actionable career path timeline in JSON format to guide a person from their current role to their target role. Each step should include:

- step number
- clear role or milestone title
- detailed description with actionable advice
- typical duration (e.g., 6 months - 1 year)

Return ONLY a JSON object in this exact format:

{
  "careerPath": [
    {
      "step": 1,
      "title": "Role or Milestone Title",
      "description": "Detailed, actionable advice about this step.",
      "duration": "Approximate duration (e.g., 1-2 years)"
    }
  ]
}

DO NOT include any markdown, explanations, or extra text.

Input:
Current Role: ${currentRole}
Target Role: ${targetRole}
Skills or Interests: ${skills.trim() ? skills : 'N/A'}
`;
      const result = await model.generateContent(prompt);
      const text = (await result.response.text()).trim();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found in response');
      const jsonString = text.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);
      if (!parsed.careerPath || !Array.isArray(parsed.careerPath)) throw new Error('Invalid JSON format');
      setTimeline(parsed.careerPath);

      // ✅ stop loader, show success, then reveal result
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1500);
      }, steps.length * 1200);
    } catch (err) {
      console.error(err);
      setError('Failed to generate career path. Please try again.');
      setLoading(false);
    }
  };

  const resetAll = () => {
    setCurrentRole('');
    setTargetRole('');
    setSkills('');
    setTimeline([]);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-50 px-6 py-10 max-w-5xl mx-auto"
    >
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
          <FaRoad className="text-blue-500" /> AI Career Path Generator
        </h1>
      </header>

      <section className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Your Current Role"
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          placeholder="Your Target Role"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <textarea
          rows={3}
          placeholder="Skills or interests (optional)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
        />
      </section>

      <section className="mb-10 flex flex-wrap items-center gap-4">
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={loading}
          className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-white shadow-lg transition ${
            loading ? 'bg-white/10 text-neutral-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin text-lg" /> Generating...
            </>
          ) : (
            <>
              <FaRoad className="text-lg" /> Generate Career Path
            </>
          )}
        </motion.button>
        {timeline.length > 0 && (
          <button
            onClick={resetAll}
            className="ml-auto flex items-center gap-3 border border-white/20 text-white hover:bg-white/10 px-5 py-3 rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaRedoAlt className="text-lg" /> New Path
          </button>
        )}
      </section>

      {error && (
        <p className="text-center bg-red-500/15 text-red-400 rounded-full px-4 py-2 font-semibold mb-6 text-base" role="alert">
          {error}
        </p>
      )}

      {loading && <LoadingSteps />}

      {success && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FaCheckCircle className="text-emerald-400 text-6xl mb-4" />
          <p className="text-2xl font-semibold tracking-tight text-white">Career Roadmap Ready!</p>
        </div>
      )}

      {!loading && !success && timeline.length > 0 && (
        <section
          id="career-path-result"
          className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <h2 className="text-2xl font-semibold tracking-tight mb-6 flex items-center gap-3 text-white">
            <FaCalendarAlt className="text-blue-500" /> Career Path Timeline
          </h2>
          <div className="relative before:absolute before:w-1 before:bg-blue-500/40 before:rounded-full before:h-full before:left-10 before:top-0">
            {timeline.map(({ step, title, description, duration }) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ delay: step * 0.1, duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
                className="relative mb-10 pl-24 pr-6 py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:border-white/20 transition"
                style={{ borderLeft: '4px solid #3b82f6' }}
              >
                <div className="absolute left-0 top-8 flex items-center justify-center w-10 h-10 rounded-full border-4 border-blue-500 bg-blue-500/15 text-blue-400 font-bold text-lg select-none">
                  {step}
                </div>
                <h3 className="text-xl font-semibold mb-1 text-white">{title}</h3>
                <p className="text-sm italic text-blue-400 font-medium mb-3">{duration}</p>
                <p className="text-base leading-relaxed text-neutral-300">{description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default CareerRoadmapGenerator;
