import React, { useState } from "react";
import { FiMapPin, FiBriefcase, FiClock } from "react-icons/fi";
import { FaExternalLinkAlt, FaBuilding, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [expandedJobId, setExpandedJobId] = useState(null);

  const fetchJobs = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    setJobs([]);
    setSuccess(false);

    const query = `${searchTerm} ${jobType} ${location}`.trim();
    if (!query) {
      setError("Please enter a job title or keyword.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
          query
        )}&page=${pageNum}&num_pages=1`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setError("No jobs found for this search.");
        setJobs([]);
      } else {
        setJobs(data.data);
        // show success for 1.5s
        setTimeout(() => setSuccess(true), 500);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs(1);
  };

  const handlePageChange = (direction) => {
    const newPage = page + direction;
    if (newPage < 1) return;
    setPage(newPage);
    fetchJobs(newPage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto mt-20 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10 text-white"
    >
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
          <FaBuilding className="text-blue-500" /> Job Search
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Job title or keyword"
          className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-neutral-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-neutral-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option className="bg-neutral-900" value="">Any Type</option>
          <option className="bg-neutral-900" value="full-time">Full-time</option>
          <option className="bg-neutral-900" value="part-time">Part-time</option>
          <option className="bg-neutral-900" value="remote">Remote</option>
          <option className="bg-neutral-900" value="contract">Contract</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-full font-semibold shadow-lg transition disabled:opacity-50 ${
            loading ? "bg-neutral-700 cursor-not-allowed shadow-none text-neutral-300" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
          } flex justify-center items-center gap-3`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Searching...
            </>
          ) : (
            "Search Jobs"
          )}
        </button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            className="mt-6 text-red-400 font-semibold text-center bg-red-500/15 rounded-xl px-4 py-3"
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}

        {success && (
          <motion.div
            className="mt-6 flex items-center justify-center text-emerald-400 gap-2 font-semibold text-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <FaCheckCircle /> Jobs Found!
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && jobs.length > 0 && (
        <>
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2">
            {jobs.map((job) => {
              const isExpanded = expandedJobId === job.job_id;
              return (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-white/20 transition cursor-pointer"
                >
                  <div className="flex items-center mb-4 gap-4">
                    {job.employer_logo ? (
                      <img
                        src={job.employer_logo}
                        alt={`${job.employer_name} logo`}
                        className="w-14 h-14 object-contain rounded bg-white/5 p-1"
                      />
                    ) : (
                      <FaBuilding className="text-neutral-500 text-4xl" />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {job.job_title}
                      </h2>
                      <p className="text-neutral-400">{job.employer_name || "Unknown Company"}</p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ height: isExpanded ? "auto" : 60 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden text-neutral-300 mb-2 text-sm leading-relaxed"
                  >
                    {isExpanded ? job.job_description || "No description available." : (job.job_description || "No description available.").slice(0, 150) + "..."}
                  </motion.div>

                  {job.job_description && job.job_description.length > 150 && (
                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : job.job_id)}
                      className="text-blue-400 font-semibold mb-4 hover:underline text-sm"
                    >
                      {isExpanded ? "Show Less" : "Read More"}
                    </button>
                  )}

                  <div className="flex flex-wrap text-sm text-neutral-400 gap-4 mb-4">
                    {job.job_city && (
                      <span className="flex items-center gap-1 bg-blue-500/15 text-blue-400 rounded-full px-3 py-1 text-xs font-semibold">
                        <FiMapPin /> {job.job_city}, {job.job_country}
                      </span>
                    )}
                    {job.job_employment_type && (
                      <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 rounded-full px-3 py-1 text-xs font-semibold">
                        <FiBriefcase /> {job.job_employment_type}
                      </span>
                    )}
                    {job.job_posted_at_datetime_utc && (
                      <span className="flex items-center gap-1 bg-amber-500/15 text-amber-400 rounded-full px-3 py-1 text-xs font-semibold">
                        <FiClock />{" "}
                        {new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}
                      </span>
                    )}
                    {job.job_salary && (
                      <span className="flex items-center gap-1 bg-purple-500/15 text-purple-400 rounded-full px-3 py-1 text-xs font-semibold">
                        <MdWork /> {job.job_salary}
                      </span>
                    )}
                  </div>

                  <a
                    href={job.job_apply_link || job.job_google_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:underline"
                  >
                    Apply Now <FaExternalLinkAlt />
                  </a>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center items-center gap-6">
            <button
              onClick={() => handlePageChange(-1)}
              disabled={page <= 1 || loading}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                page <= 1 || loading
                  ? "bg-white/5 cursor-not-allowed text-neutral-600 border border-white/10"
                  : "border border-white/20 text-white hover:bg-white/10"
              }`}
            >
              Previous
            </button>
            <span className="text-lg font-medium text-neutral-300">Page {page}</span>
            <button
              onClick={() => handlePageChange(1)}
              disabled={loading || jobs.length === 0}
              className="px-6 py-3 rounded-full font-semibold border border-white/20 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <FaSpinner className="animate-spin text-blue-500 text-6xl" />
        </div>
      )}
    </motion.div>
  );
};

export default JobSearch;
