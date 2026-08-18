import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaBriefcase } from "react-icons/fa";

import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAnonymousUserId } from "../utils/anonymousUser";

const MODEL_NAME = 'models/gemini-2.5-flash-preview-05-20';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const interviewTypes = [
  { id: "behavioral", label: "Behavioral" },
  { id: "technical", label: "Technical" },
  { id: "hr", label: "HR" },
  { id: "aptitude", label: "Aptitude" },
  { id: "coding", label: "Coding" },
];

const InterviewFormPage = () => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [selectedInterviewTypes, setSelectedInterviewTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const toggleInterviewType = (id) => {
    setSelectedInterviewTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!position.trim()) newErrors.position = "Position is required";
    if (!skills.trim()) newErrors.skills = "Please enter your skills";
    if (!experience.trim()) newErrors.experience = "Experience is required";
    if (selectedInterviewTypes.length === 0)
      newErrors.interviewTypes = "Please select at least one interview type";
    return newErrors;
  };

  const buildPrompt = () => {
    const typesText = selectedInterviewTypes
      .map((typeId) => {
        const typeObj = interviewTypes.find((t) => t.id === typeId);
        if (!typeObj) return "";
        switch (typeObj.id) {
          case "behavioral":
            return "- Behavioral questions (e.g., teamwork, communication)";
          case "technical":
            return "- Technical questions related to the position";
          case "hr":
            return "- HR questions (e.g., motivation, company culture)";
          case "aptitude":
            return "- Aptitude questions (logical reasoning, quantitative)";
          case "coding":
            return "- Coding or programming problems";
          default:
            return "";
        }
      })
      .filter(Boolean)
      .join("\n");

    return `
My name is ${name}. I want to prepare for a ${position} interview.
My skills are: ${skills}. I have ${experience} years of experience.
The interview types I want to focus on are:
${typesText}

Generate 5 interview questions and answers in JSON format like this:
[
  {
    "question": "Your question?",
    "answer": "Your answer."
  }
]
Only return valid JSON.
    `;
  };

  const generateFallbackQuestions = () => {
    const list = [];
    if (selectedInterviewTypes.includes("technical") || selectedInterviewTypes.length === 0) {
      list.push({
        question: `Can you explain a key technical challenge you encountered while working with ${skills || position} and how you solved it?`,
        answer: `Demonstrate structured problem-solving, architectural considerations, and measurable outcome.`,
      });
      list.push({
        question: `How do you approach system design, scalability, and performance optimization for a ${position} role?`,
        answer: `Discuss caching strategies, load balancing, database indexing, and asynchronous processing.`,
      });
    }
    if (selectedInterviewTypes.includes("behavioral")) {
      list.push({
        question: `Tell me about a time you had a technical disagreement with a team member. How did you resolve it?`,
        answer: `Focus on objective benchmarking, empathetic communication, and team alignment.`,
      });
    }
    if (selectedInterviewTypes.includes("coding")) {
      list.push({
        question: `How do you write clean, maintainable code and ensure test coverage in production environments?`,
        answer: `Mention unit/integration testing, CI/CD pipelines, modular design, and refactoring practices.`,
      });
    }
    if (selectedInterviewTypes.includes("hr") || list.length < 4) {
      list.push({
        question: `Why are you interested in this ${position} role, and where do you see your technical leadership growing?`,
        answer: `Highlight alignment with company vision, continuous learning, and mentorship.`,
      });
    }
    return list.slice(0, 5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      const field = document.querySelector(`[name="${firstErrorField}"]`);
      if (field) field.focus();
      return;
    }

    setLoading(true);

    try {
      let parsed = null;
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY" && apiKey.trim() !== "") {
        try {
          const prompt = buildPrompt();
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: MODEL_NAME });
          const result = await model.generateContent(prompt);
          const rawText = (await result.response.text()).trim();
          const cleanJson = rawText.replace(/^```json|```$/g, "").trim();
          const match = cleanJson.match(/\[[\s\S]*\]/);
          if (match) {
            parsed = JSON.parse(match[0]);
          }
        } catch (aiErr) {
          console.warn("⚠️ Gemini API call did not succeed, using smart role-based generator:", aiErr);
        }
      }

      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
        parsed = generateFallbackQuestions();
      }

      const submissionData = {
        userId: getAnonymousUserId(),
        name,
        position,
        skills,
        experience,
        portfolio,
        selectedInterviewTypes,
        questions: parsed,
        timestamp: new Date(),
      };

      try {
        await addDoc(collection(db, "interview_submissions"), submissionData);
      } catch (dbErr) {
        console.info("Firestore logging skipped (offline/unconfigured mode):", dbErr);
      }

      navigate("/start-interview", {
        state: { name, position, skills, experience, portfolio, Question: parsed },
      });
    } catch (error) {
      console.error("Submission handling exception:", error);
      const fallback = generateFallbackQuestions();
      navigate("/start-interview", {
        state: { name, position, skills, experience, portfolio, Question: fallback },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setName("");
      setPosition("");
      setSkills("");
      setExperience("");
      setPortfolio("");
      setSelectedInterviewTypes([]);
      setErrors({});
    }
  };

  const progress =
    [name, position, skills, experience].filter(Boolean).length / 4 +
    (selectedInterviewTypes.length > 0 ? 1 : 0);
  const progressPercent = (progress / 5) * 100;

  return (
    <div className="min-h-screen bg-black px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <h1 className="text-3xl font-semibold mb-6 text-white text-center flex items-center justify-center gap-3 tracking-tight">
          <FaBriefcase className="text-blue-500" /> Prepare for Your Interview
        </h1>

        <div className="h-2 w-full bg-white/10 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-3 text-neutral-300">Select Interview Types (choose one or more):</label>
          <div className="flex flex-wrap gap-3">
            {interviewTypes.map(({ id, label }) => {
              const selected = selectedInterviewTypes.includes(id);
              return (
                <motion.button
                  key={id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterviewType(id)}
                  className={`px-4 py-2 rounded-full border font-medium transition-colors duration-200
                    ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25"
                        : "bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }
                  `}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>
          {errors.interviewTypes && (
            <p className="text-red-400 text-sm mt-2">{errors.interviewTypes}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="name" className="block font-medium mb-1 text-neutral-300">
              Your Name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3 bg-white/5 border rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.name ? "border-red-500" : "border-white/10"
              }`}
              placeholder="Enter your full name"
              required
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="position" className="block font-medium mb-1 text-neutral-300">
              Position You Are Applying For
            </label>
            <input
              id="position"
              name="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className={`w-full p-3 bg-white/5 border rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.position ? "border-red-500" : "border-white/10"
              }`}
              placeholder="e.g., Frontend Developer"
              required
            />
            {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="skills" className="block font-medium mb-1 text-neutral-300">
              Your Skills (comma separated)
            </label>
            <input
              id="skills"
              name="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className={`w-full p-3 bg-white/5 border rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.skills ? "border-red-500" : "border-white/10"
              }`}
              placeholder="e.g., React, Node.js, MongoDB"
              required
            />
            {errors.skills && <p className="text-red-400 text-sm mt-1">{errors.skills}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="experience" className="block font-medium mb-1 text-neutral-300">
              Years of Experience
            </label>
            <input
              id="experience"
              name="experience"
              type="number"
              min="0"
              step="0.1"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={`w-full p-3 bg-white/5 border rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.experience ? "border-red-500" : "border-white/10"
              }`}
              placeholder="e.g., 2.5"
              required
            />
            {errors.experience && <p className="text-red-400 text-sm mt-1">{errors.experience}</p>}
          </div>

          <div className="mb-8">
            <label htmlFor="portfolio" className="block font-medium mb-1 text-neutral-300">
              Portfolio URL (optional)
            </label>
            <input
              id="portfolio"
              name="portfolio"
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition disabled:opacity-50 ${
                loading ? "cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Generating..." : "Generate Interview Questions"}
            </motion.button>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-full font-semibold transition disabled:opacity-50"
            >
              Reset
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default InterviewFormPage;
