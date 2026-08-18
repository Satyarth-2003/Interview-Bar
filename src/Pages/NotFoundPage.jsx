import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeftCircle } from "react-icons/fi";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-black px-6 relative overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/20 blur-[120px]"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 md:p-16 max-w-4xl w-full grid md:grid-cols-2 gap-10 items-center"
      >
        {/* SVG Illustration */}
        <div className="w-full">
          <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <circle cx="150" cy="100" r="80" fill="rgba(59,130,246,0.12)" />
            <text
              x="150"
              y="110"
              textAnchor="middle"
              fontSize="64"
              fontWeight="bold"
              fill="#3b82f6"
              fontFamily="sans-serif"
            >
              404
            </text>
            <text
              x="150"
              y="140"
              textAnchor="middle"
              fontSize="16"
              fill="#93c5fd"
              fontFamily="sans-serif"
            >
              Page Not Found
            </text>
          </svg>
        </div>

        {/* Text + Navigation */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">
            Oops! Page not found
          </h1>
          <p className="text-neutral-400 text-base mb-6">
            The page you're looking for doesn't exist or was moved. Let's get you back on track.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-600/25 transition"
          >
            <FiArrowLeftCircle className="text-xl" />
            Go to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotFoundPage;
