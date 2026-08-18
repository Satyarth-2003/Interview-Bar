import React from "react";
import { motion } from "framer-motion";
import {
  FaUserFriends,
  FaChalkboardTeacher,
  FaLaptopCode,
  FaClipboardList,
  FaQuestionCircle,
  FaHeadset,
  FaRocket
} from "react-icons/fa";

const sections = [
  {
    icon: <FaUserFriends className="text-4xl text-blue-500" />,
    title: "Who We Are",
    description:
      "We’re a passionate team of developers, designers, and educators committed to building innovative solutions and empowering users through technology and collaboration."
  },
  {
    icon: <FaChalkboardTeacher className="text-4xl text-blue-500" />,
    title: "What We Do",
    description:
      "We create educational platforms, conduct interviews, and help people get placed with industry-standard tools. From technical evaluations to project mentorship, we do it all."
  },
  {
    icon: <FaLaptopCode className="text-4xl text-blue-500" />,
    title: "Our Technology",
    description:
      "Built using React.js, Tailwind CSS, Node.js, and Framer Motion, our platform is fast, modern, and responsive across all devices."
  },
  {
    icon: <FaClipboardList className="text-4xl text-blue-500" />,
    title: "Why Choose Us?",
    description:
      "We provide personalized interview experiences, real-world assessments, and feedback designed to help you grow and succeed in your career."
  },
  {
    icon: <FaQuestionCircle className="text-4xl text-blue-500" />,
    title: "How It Works",
    description:
      "Just sign up, take interviews, get evaluated, and access detailed feedback. It’s easy, efficient, and made to fit your schedule."
  },
  {
    icon: <FaHeadset className="text-4xl text-blue-500" />,
    title: "Support",
    description:
      "Need help? Our support team is here 24/7 to answer questions and guide you through your journey."
  },
  {
    icon: <FaRocket className="text-4xl text-blue-500" />,
    title: "Our Mission",
    description:
      "To simplify and democratize career growth through modern tools, smart evaluations, and human guidance."
  }
];

const LearnMorePage = () => {
  return (
    <div className="min-h-screen bg-black">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <h1 className="text-4xl font-semibold text-center text-white mb-12 tracking-tight">
          Learn More About Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-white/20 transition shadow-lg"
            >
              <div className="mb-4">{section.icon}</div>
              <h2 className="text-xl font-semibold mb-2 text-white tracking-tight">{section.title}</h2>
              <p className="text-neutral-400">{section.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LearnMorePage;
