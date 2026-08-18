import React from 'react';
import { motion } from 'framer-motion';

const bars = [
  { h: 10, delay: 0 },
  { h: 18, delay: 0.15 },
  { h: 14, delay: 0.3 },
  { h: 20, delay: 0.45 },
];

const BrandMark = ({ size = 36, animate = true, className = '' }) => {
  return (
    <div
      className={`relative flex items-end justify-center gap-[3px] rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-600/30 ${className}`}
      style={{ width: size, height: size, padding: size * 0.2 }}
      aria-hidden="true"
    >
      {bars.map((bar, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-white"
          style={{ height: bar.h * (size / 36), transformOrigin: 'bottom' }}
          initial={{ scaleY: 0.6 }}
          animate={
            animate
              ? { scaleY: [0.4, 1, 0.6, 0.9, 0.4] }
              : undefined
          }
          transition={
            animate
              ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: bar.delay }
              : undefined
          }
        />
      ))}
    </div>
  );
};

export default BrandMark;
