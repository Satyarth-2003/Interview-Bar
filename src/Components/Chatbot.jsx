import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  FaUser,
  FaRobot,
  FaSpinner,
  FaPaperPlane,
  FaTimes,
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

const ChatBot = ({ onClose }) => {
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    setLoading(true);
    setError('');

    const prompt = `You are a helpful and friendly AI chatbot. Answer this: "${userQuestion}"`;

    try {
      const result = await model.generateContent(prompt);
      const botResponse = (await result.response.text()).trim();

      setChatHistory((prev) => [
        ...prev,
        { sender: 'user', text: userQuestion },
        { sender: 'bot', text: botResponse },
      ]);
      setUserQuestion('');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-6 right-4 sm:right-6 w-[95%] sm:w-96 z-50 shadow-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden"
    >
      <div className="bg-blue-600 text-white p-4 font-semibold text-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaRobot className="text-xl" />
          AI Assistant
        </div>
        <button onClick={onClose} aria-label="Close chatbot">
          <FaTimes className="text-white/80 hover:text-white text-lg transition" />
        </button>
      </div>

      <div className="h-96 overflow-y-auto px-4 py-3 space-y-3 bg-transparent text-sm scrollbar-thin scrollbar-thumb-white/10">
        {chatHistory.length === 0 ? (
          <p className="text-neutral-500 text-center mt-20">
            Start the conversation…
          </p>
        ) : (
          chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-end gap-2 max-w-[80%] ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="mb-1">
                  {msg.sender === 'user' ? (
                    <FaUser className="text-blue-400" />
                  ) : (
                    <FaRobot className="text-blue-500" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white/10 text-neutral-100 rounded-bl-sm'
                  }`}
                >
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-3 border-t border-white/10"
      >
        <input
          type="text"
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask me anything..."
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
        />
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.08 }}
          whileTap={{ scale: loading ? 1 : 0.92 }}
          type="submit"
          className="text-blue-500 hover:text-blue-400 p-2 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
        </motion.button>
      </form>

      {error && (
        <p className="text-red-400 text-center text-sm px-4 py-2">{error}</p>
      )}
    </motion.div>
  );
};

export default ChatBot;
