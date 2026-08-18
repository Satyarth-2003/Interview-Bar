import React, { useState, useEffect } from 'react';
import {
  FaFileAlt,
  FaLightbulb,
  FaArrowUp,
  FaPenFancy,
  FaSpinner,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion } from 'framer-motion';

const MODEL_NAME = 'models/gemini-2.5-flash-preview-05-20';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const steps = [
  'Understanding job details...',
  'Matching skills and experience...',
  'Drafting introduction...',
  'Writing body paragraphs...',
  'Finalizing cover letter...',
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

const CoverLetterGenerator = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setError('');
    setCoverLetter('');
    setCopied(false);
    setSuccess(false);

    if (!jobTitle.trim() || !companyName.trim()) {
      setError('Please enter both Job Title and Company Name.');
      return;
    }

    setLoading(true);

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are an AI cover letter writer. Generate a professional, concise, and personalized cover letter for the following job application details. Format it with proper paragraph spacing. Return ONLY a JSON object in this format:

{
  "coverLetter": "full text with paragraphs and clean line breaks, no markdown"
}

Job Title: ${jobTitle}
Company Name: ${companyName}
Additional Information: ${additionalInfo.trim() || 'N/A'}
`;

    try {
      const result = await model.generateContent(prompt);
      const text = (await result.response.text()).trim();

      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const jsonString = text.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);

      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          setCoverLetter(parsed.coverLetter);
          setSuccess(false);
        }, 1500);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Error generating cover letter.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setJobTitle('');
    setCompanyName('');
    setAdditionalInfo('');
    setCoverLetter('');
    setError('');
    setCopied(false);
    setSuccess(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-50 px-6 py-10 max-w-5xl mx-auto"
    >
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3 text-white">
          <FaPenFancy className="text-blue-500" /> AI Cover Letter Generator
        </h1>
      </header>

      <section className="mb-8 space-y-5">
        <input
          type="text"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          rows={5}
          placeholder="Additional information (skills, experience, achievements)"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      <section className="mb-8 flex flex-wrap items-center gap-4">
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition shadow-lg ${
            loading
              ? 'bg-white/10 text-neutral-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <FaFileAlt /> Generate Cover Letter
            </>
          )}
        </motion.button>

        {coverLetter && (
          <button
            onClick={resetAll}
            className="flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-5 py-3 rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaArrowUp /> New Letter
          </button>
        )}
      </section>

      {error && (
        <p className="bg-red-500/15 text-red-400 rounded-xl px-4 py-3 font-semibold mb-4 text-lg" role="alert">
          {error}
        </p>
      )}

      {loading && <LoadingSteps />}

      {success && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center py-10"
        >
          <FaCheck className="text-emerald-400 text-6xl mb-4" />
          <p className="text-2xl font-semibold tracking-tight text-white">Cover Letter Ready!</p>
        </motion.div>
      )}

      {coverLetter && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.005 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          id="cover-letter-result"
          className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition whitespace-pre-line"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
              <FaLightbulb className="text-blue-500" /> Generated Cover Letter
            </h2>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 text-sm border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-full transition"
            >
              {copied ? (
                <>
                  <FaCheck className="text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <FaCopy /> Copy
                </>
              )}
            </button>
          </div>
          <p className="text-lg leading-relaxed whitespace-pre-wrap text-neutral-300">{coverLetter}</p>
        </motion.section>
      )}
    </motion.div>
  );
};

export default CoverLetterGenerator;
