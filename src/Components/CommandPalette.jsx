import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaRoad,
  FaPenFancy,
  FaBuilding,
  FaQuestionCircle,
  FaUserTie,
  FaBookOpen,
  FaSearch,
  FaPlayCircle,
  FaCode,
  FaPuzzlePiece,
  FaInfoCircle,
} from 'react-icons/fa';
import { useCommandPalette } from '../context/CommandPaletteContext';

const destinations = [
  { label: 'Dashboard', path: '/', icon: FaTachometerAlt, group: 'Explore' },
  { label: 'Learn More', path: '/learn-more', icon: FaInfoCircle, group: 'Explore' },
  { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FaUserGraduate, group: 'Tools' },
  { label: 'Career Roadmap', path: '/career-roadmap', icon: FaRoad, group: 'Tools' },
  { label: 'Cover Letter Generator', path: '/cover-letter', icon: FaPenFancy, group: 'Tools' },
  { label: 'Company Overview', path: '/company-overview', icon: FaBuilding, group: 'Tools' },
  { label: 'Interview Q&A Generator', path: '/interview-qa', icon: FaQuestionCircle, group: 'Tools' },
  { label: 'Expert Booking', path: '/expert-booking', icon: FaUserTie, group: 'Tools' },
  { label: 'Study Material', path: '/study-material', icon: FaBookOpen, group: 'Tools' },
  { label: 'Job Search', path: '/job-search', icon: FaSearch, group: 'Tools' },
  { label: 'Take a Mock Interview', path: '/interview-form', icon: FaPlayCircle, group: 'Tools' },
  { label: 'Code Playground', path: '/code', icon: FaCode, group: 'Practice' },
  { label: 'Puzzle Game', path: '/puzzle', icon: FaPuzzlePiece, group: 'Practice' },
];

const CommandPalette = () => {
  const { isOpen, close, toggle } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return destinations;
    const q = query.toLowerCase();
    return destinations.filter((d) => d.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle, close]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => setActiveIndex(0), [query]);

  const select = (dest) => {
    if (!dest) return;
    navigate(dest.path);
    close();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(results[activeIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32 px-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-950/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              <FaSearch className="text-neutral-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jump to a tool or page..."
                className="flex-1 bg-transparent text-white placeholder:text-neutral-500 focus:outline-none text-sm"
              />
              <kbd className="text-[10px] font-semibold text-neutral-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500">No matches found.</p>
              ) : (
                results.map((dest, i) => {
                  const Icon = dest.icon;
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={dest.path}
                      onClick={() => select(dest)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        isActive ? 'bg-blue-600/15 text-white' : 'text-neutral-300'
                      }`}
                    >
                      <Icon className={isActive ? 'text-blue-400' : 'text-neutral-500'} />
                      {dest.label}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
