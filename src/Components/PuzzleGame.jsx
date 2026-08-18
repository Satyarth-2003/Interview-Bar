import React, { useState, useEffect } from "react";
import { FaSmileBeam, FaSadTear, FaQuestionCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "../assets/assets";

const categories = ["Math", "Riddle", "Logic"];

const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const PuzzleGame = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = questions.filter((q) => q.category === selectedCategory);
      setFilteredQuestions(filtered);
    }
  }, [selectedCategory]);

  const handleAnswer = (selectedOption) => {
    setShowQuestion(false);
    setTimeout(() => {
      const current = filteredQuestions[currentQuestion];
      if (selectedOption === current.answer) {
        if (currentQuestion === filteredQuestions.length - 1) {
          setWon(true);
        } else {
          setCurrentQuestion((prev) => prev + 1);
          setShowQuestion(true);
        }
      } else {
        setGameOver(true);
      }
    }, 300);
  };

  const resetGame = () => {
    setSelectedCategory(null);
    setFilteredQuestions([]);
    setCurrentQuestion(0);
    setGameOver(false);
    setWon(false);
    setShowQuestion(true);
  };

  useEffect(() => {
    if (won) {
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.6 },
        });
      });
    }
  }, [won]);

  const progress = ((currentQuestion + (won ? 1 : 0)) / filteredQuestions.length) * 100;
  const baseContainer = "relative flex flex-col items-center justify-center h-screen p-6 bg-black overflow-hidden";

  if (!selectedCategory) {
    return (
      <div className={baseContainer}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-blue-600/20 blur-[100px]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 text-3xl font-semibold mb-6 text-white tracking-tight"
        >
          Choose a Question Category
        </motion.h1>
        <div className="relative z-10 space-y-4 w-full max-w-md">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(cat)}
              className="w-full py-4 bg-white/5 border border-white/10 backdrop-blur-xl text-white font-semibold rounded-2xl shadow-lg hover:border-white/20 hover:bg-white/10 transition"
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const QuestionCard = () => {
  const current = filteredQuestions[currentQuestion];

  if (!current) return null;

  return (
    <motion.div
      key={currentQuestion}
      variants={fadeVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl text-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
    >
      <FaQuestionCircle size={40} className="text-blue-500 mb-4 animate-pulse" />
      <h2 className="text-2xl font-semibold mb-2 text-center tracking-tight">
        Question {currentQuestion + 1}
      </h2>
      <p className="text-lg mb-4 text-center text-neutral-300">{current.question}</p>
      <div className="space-y-3">
        {current.options.map((option, idx) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => handleAnswer(option)}
            key={idx}
            className="w-full py-3 bg-white/5 border border-white/10 text-neutral-100 font-semibold rounded-xl hover:bg-blue-600/20 hover:border-blue-500/40 transition-all"
          >
            {option}
          </motion.button>
        ))}
      </div>
      <div className="mt-6">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-neutral-400 mt-2 text-center">
          {progress.toFixed(0)}% Complete
        </p>
      </div>
    </motion.div>
  );
};


  if (gameOver) {
    return (
      <div className={`${baseContainer} text-red-400`}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-red-600/10 blur-[100px]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="relative z-10">
          <FaSadTear size={80} className="mb-4 animate-bounce" />
        </motion.div>
        <h2 className="relative z-10 text-3xl font-semibold mb-4 tracking-tight">Oops! You Lost</h2>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetGame}
          className="relative z-10 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-red-600/25 transition"
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  if (won) {
    return (
      <div className={`${baseContainer} text-blue-400`}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-blue-600/10 blur-[100px]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.div initial={{ rotate: -10 }} animate={{ rotate: 10 }} transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }} className="relative z-10">
          <FaSmileBeam size={90} className="mb-4" />
        </motion.div>
        <h2 className="relative z-10 text-3xl font-semibold mb-4 tracking-tight text-white">🎉 You Win!</h2>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetGame}
          className="relative z-10 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-600/25 transition"
        >
          Play Again
        </motion.button>
      </div>
    );
  }

  return (
    <div className={baseContainer}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-600/20 blur-[100px]"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <AnimatePresence mode="wait">
        {showQuestion && <QuestionCard key={currentQuestion} />}
      </AnimatePresence>
    </div>
  );
};

export default PuzzleGame;
