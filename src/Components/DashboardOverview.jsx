import React, { useEffect, useState } from "react";
import {
  FaRedoAlt,
  FaCommentDots,
  FaPlay,
  FaSearch,
  FaListAlt,
  FaChartBar,
  FaQuoteRight,
  FaPlayCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAnonymousUserId } from "../utils/anonymousUser";

const tipsList = [
  "Practice mock interviews daily!",
  "Focus on behavioral questions using the STAR method.",
  "Master fundamentals instead of just frameworks.",
  "Keep your resume updated after every mock.",
  "Use ChatGPT to simulate interviews!",
];

const statTiles = [
  { key: "total", label: "Total Interviews", gradient: "from-blue-500/20 to-indigo-500/5", ring: "ring-blue-500/30" },
  { key: "completed", label: "Completed", gradient: "from-emerald-500/20 to-emerald-500/5", ring: "ring-emerald-500/30" },
  { key: "pending", label: "Pending", gradient: "from-amber-500/20 to-amber-500/5", ring: "ring-amber-500/30" },
];

const DashboardOverview = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tipsList.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    if (!db) {
      setLoading(false);
      return;
    }

    const userId = getAnonymousUserId();

    const q = query(
      collection(db, "interview_submissions"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const interviewsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            company: data.company || "",
            position: data.position || "",
            date: data.date || "",
            status: data.status || "Pending",
            score: data.score ?? null,
            feedback: data.feedback || "",
            tips: data.tips || "",
          };
        });
        setInterviews(interviewsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching interviews:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredInterviews = interviews.filter((i) => {
    const match =
      i.company.toLowerCase().includes(search.toLowerCase()) ||
      i.position.toLowerCase().includes(search.toLowerCase());
    const statusMatch = filter === "all" || i.status.toLowerCase() === filter;
    return match && statusMatch;
  });

  const completed = interviews.filter((i) => i.status === "Completed").length;
  const pending = interviews.filter((i) => i.status === "Pending").length;
  const stats = { total: interviews.length, completed, pending };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-semibold text-center text-white mb-8 flex items-center justify-center gap-3 tracking-tight">
        <FaListAlt className="text-blue-500" /> Interview Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {statTiles.map((tile) => (
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            key={tile.key}
            className={`bg-gradient-to-br ${tile.gradient} ring-1 ${tile.ring} backdrop-blur-xl p-5 rounded-2xl flex items-center justify-between`}
          >
            <div>
              <p className="text-sm font-medium text-neutral-300">{tile.label}</p>
              <h3 className="text-3xl font-semibold text-white mt-1">{stats[tile.key]}</h3>
            </div>
            <FaChartBar className="text-2xl text-neutral-400" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 border border-white/10 text-neutral-200 p-4 rounded-2xl flex items-center gap-3 mb-8"
        >
          <FaQuoteRight className="text-xl text-blue-500" />
          <p className="text-sm font-medium">{tipsList[tipIndex]}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => navigate("/interview-form")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-full shadow-lg shadow-blue-600/20 flex items-center gap-2 text-base font-semibold transition"
          >
            <FaPlayCircle className="text-lg" />
            Take Interview
          </button>
          <span className="text-neutral-400 text-sm ml-1">
            Choose interview type or take an interview now
          </span>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-white/10 bg-white/5 text-white placeholder:text-neutral-500 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-white/10 bg-white/5 text-white px-2 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="bg-neutral-900" value="all">All</option>
            <option className="bg-neutral-900" value="completed">Completed</option>
            <option className="bg-neutral-900" value="pending">Pending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-neutral-400 py-8">Loading interviews...</p>
      ) : filteredInterviews.length === 0 ? (
        <div className="text-center py-10 text-neutral-400">
          <p className="text-lg flex items-center justify-center gap-2">
            <FaSearch /> No interviews found.
          </p>
          <p className="text-sm mt-1">
            Try searching different keywords or add new interviews.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInterviews.map((i) => (
            <motion.div
              key={i.id}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="border border-white/10 bg-white/5 backdrop-blur-xl p-5 rounded-2xl hover:border-white/20 transition"
            >
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {i.position} @ {i.company}
                  </h3>
                  <p className="text-sm text-neutral-400">Date: {i.date}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full h-fit ${
                    i.status === "Completed"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {i.status}
                </span>
              </div>

              {i.score !== null && (
                <div className="mt-2">
                  <p className="text-sm text-neutral-400 font-medium">Score</p>
                  <div className="w-full bg-white/10 h-2 rounded-full mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${i.score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1 text-neutral-300">{i.score}%</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedInterview(i)}
                  className="bg-blue-600/90 hover:bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition"
                >
                  <FaCommentDots />
                  View Feedback
                </button>
                <button
                  onClick={() => navigate("/interview-form")}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition"
                >
                  <FaRedoAlt />
                  Retake
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedInterview && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedInterview(null)}
        >
          <div
            className="bg-neutral-900 border border-white/10 p-6 rounded-3xl shadow-2xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-xl text-neutral-400 hover:text-white"
              onClick={() => setSelectedInterview(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-2 text-white">
              {selectedInterview.position} @ {selectedInterview.company}
            </h3>
            <p className="text-sm mb-1 text-neutral-400">
              Date: {selectedInterview.date}
            </p>
            <p className="text-sm mb-1 text-neutral-300">
              <strong className="text-white">Status:</strong> {selectedInterview.status}
            </p>
            <p className="text-sm mt-2 mb-2 text-neutral-300">
              <strong className="text-white">Feedback:</strong>{" "}
              {selectedInterview.feedback || "No feedback available."}
            </p>
            <p className="text-sm text-neutral-300">
              <strong className="text-white">Improvement Tips:</strong> {selectedInterview.tips}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/interview-form")}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-5 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition z-50"
        title="Start Interview"
      >
        <FaPlay />
      </button>
    </div>
  );
};

export default DashboardOverview;
