import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAnonymousUserId } from "../utils/anonymousUser";

const ScheduleSessionPage = () => {
  const navigate = useNavigate();
  const [candidateId, setCandidateId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSchedule = async (e) => {
    e.preventDefault();

    if (!candidateId || !scheduledTime) {
      setError("All fields are required.");
      return;
    }

    try {
      if (!db) {
        setMessage("Session scheduled (offline mode).");
        setError("");
        setCandidateId("");
        setScheduledTime("");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      const sessionRef = collection(db, "sessions");

      await addDoc(sessionRef, {
        interviewerId: getAnonymousUserId(),
        candidateId: candidateId,
        scheduledAt: Timestamp.fromDate(new Date(scheduledTime)),
        feedback: "",
        status: "scheduled",
      });

      setMessage("Session scheduled successfully!");
      setError("");
      setCandidateId("");
      setScheduledTime("");

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Error scheduling session:", err);
      setError("Failed to schedule session. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white">
          Schedule Interview Session
        </h2>

        {message && (
          <p className="text-emerald-400 text-center font-medium mb-4">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-400 text-center font-medium mb-4">{error}</p>
        )}

        <form onSubmit={handleSchedule} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-neutral-300">Candidate ID</label>
            <input
              type="text"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-neutral-500"
              placeholder="Enter candidate user ID"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-neutral-300">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-full font-medium hover:bg-blue-500 transition"
          >
            Schedule Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionPage;
