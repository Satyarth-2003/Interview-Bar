import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaRoad,
  FaPenFancy,
  FaSearch,
  FaComments,
  FaBuilding,
  FaUserTie,
  FaBookOpen,
  FaQuestionCircle,
} from "react-icons/fa";
import { Outlet, useNavigate } from "react-router-dom";
import ChatBot from "../Components/Chatbot";
import BrandMark from "../Components/BrandMark";
import Dock from "../Components/Dock";
import { useCommandPalette } from "../context/CommandPaletteContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const menuItems = [
  { path: "/", label: "Dashboard", icon: FaTachometerAlt, end: true },
  { path: "/resume-analyzer", label: "Resume Analysis", icon: FaUserGraduate },
  { path: "/career-roadmap", label: "Career Roadmap", icon: FaRoad },
  { path: "/cover-letter", label: "Cover Letter", icon: FaPenFancy },
  { path: "/company-overview", label: "Company Overview", icon: FaBuilding },
  { path: "/interview-qa", label: "Interview Q&A", icon: FaQuestionCircle },
  { path: "/expert-booking", label: "Book an Expert", icon: FaUserTie },
  { path: "/study-material", label: "Study Material", icon: FaBookOpen },
  { path: "/job-search", label: "Search Job", icon: FaSearch },
];

const Dashboard = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const { open: openPalette } = useCommandPalette();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 h-16 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
          <BrandMark size={30} />
          <span className="text-lg font-semibold text-white tracking-tight">
            Interview <span className="text-blue-500">Bar</span>
          </span>
        </button>

        <button
          onClick={openPalette}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition"
        >
          <FaSearch className="text-xs" />
          <span className="hidden sm:inline text-xs">Quick nav</span>
          <kbd className="hidden sm:inline text-[10px] font-semibold bg-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
        </button>
      </header>

      <main className="flex-1 mesh-bg overflow-auto p-6 md:p-10 pb-32 text-neutral-100">
        <Outlet />
      </main>

      <Dock items={menuItems} onOpenPalette={openPalette} />

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-36 right-6 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 z-40 transition"
        aria-label="Chatbot"
      >
        <FaComments className="w-6 h-6" />
      </button>

      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default Dashboard;
