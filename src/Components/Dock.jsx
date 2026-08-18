import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { FaSearch } from "react-icons/fa";

const DockIcon = ({ mouseX, item, onHover, onLeave }) => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = item.end
    ? location.pathname === item.path
    : location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - (bounds.x + bounds.width / 2);
  });

  const sizeSync = useTransform(distance, [-140, 0, 140], [48, 68, 48]);
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 200, damping: 18 });

  const iconSizeSync = useTransform(distance, [-140, 0, 140], [18, 26, 18]);
  const iconSize = useSpring(iconSizeSync, { mass: 0.1, stiffness: 200, damping: 18 });

  const handleMouseEnter = () => {
    const bounds = ref.current?.getBoundingClientRect();
    if (bounds) {
      onHover({ label: item.label, x: bounds.x + bounds.width / 2 });
    }
  };

  const handleMouseMove = () => {
    const bounds = ref.current?.getBoundingClientRect();
    if (bounds) {
      onHover({ label: item.label, x: bounds.x + bounds.width / 2 });
    }
  };

  const Icon = item.icon;

  return (
    <div
      className="relative flex flex-col items-center shrink-0 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={onLeave}
      onClick={() => navigate(item.path)}
    >
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        className={`rounded-2xl flex items-center justify-center border transition-colors duration-200 ${
          isActive
            ? "bg-blue-600 border-blue-400/40 text-white shadow-lg shadow-blue-600/40"
            : "bg-white/8 border-white/10 text-neutral-300 hover:bg-white/15 hover:text-white"
        }`}
      >
        <motion.div style={{ fontSize: iconSize }} className="flex items-center justify-center pointer-events-none">
          <Icon />
        </motion.div>
      </motion.div>
      <span
        className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-colors ${
          isActive ? "bg-blue-400" : "bg-transparent"
        }`}
      />
    </div>
  );
};

const DockSearchButton = ({ mouseX, onOpenPalette, onHover, onLeave }) => {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - (bounds.x + bounds.width / 2);
  });

  const sizeSync = useTransform(distance, [-140, 0, 140], [48, 68, 48]);
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 200, damping: 18 });

  const iconSizeSync = useTransform(distance, [-140, 0, 140], [16, 24, 16]);
  const iconSize = useSpring(iconSizeSync, { mass: 0.1, stiffness: 200, damping: 18 });

  const handleMouseEnter = () => {
    const bounds = ref.current?.getBoundingClientRect();
    if (bounds) {
      onHover({ label: "Quick nav (⌘K)", x: bounds.x + bounds.width / 2 });
    }
  };

  const handleMouseMove = () => {
    const bounds = ref.current?.getBoundingClientRect();
    if (bounds) {
      onHover({ label: "Quick nav (⌘K)", x: bounds.x + bounds.width / 2 });
    }
  };

  return (
    <div
      className="relative flex flex-col items-center shrink-0 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={onLeave}
      onClick={onOpenPalette}
    >
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        className="rounded-2xl flex items-center justify-center border border-white/10 bg-white/8 text-neutral-300 hover:bg-white/15 hover:text-white transition-colors"
      >
        <motion.div style={{ fontSize: iconSize }} className="flex items-center justify-center pointer-events-none">
          <FaSearch />
        </motion.div>
      </motion.div>
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-transparent" />
    </div>
  );
};

const Dock = ({ items, onOpenPalette }) => {
  const mouseX = useMotionValue(Infinity);
  const scrollRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += delta;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
      {/* Floating Tooltip above the Dock (outside overflow clipping) */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.label}
            initial={{ opacity: 0, y: 6, scale: 0.92, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 3, scale: 0.92, x: "-50%" }}
            transition={{ duration: 0.12 }}
            style={{ left: hovered.x }}
            className="fixed bottom-26 whitespace-nowrap text-[11px] font-semibold text-white bg-neutral-900/95 border border-white/20 px-3 py-1 rounded-lg pointer-events-none shadow-2xl shadow-black/90 z-50 flex flex-col items-center backdrop-blur-md"
          >
            <span>{hovered.label}</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 border-r border-b border-white/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock Bar */}
      <motion.div
        ref={scrollRef}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => {
          mouseX.set(Infinity);
          setHovered(null);
        }}
        className="pointer-events-auto flex items-end gap-2.5 max-w-full overflow-x-auto no-scrollbar rounded-3xl border border-white/10 bg-black/75 backdrop-blur-2xl px-4 py-2.5 shadow-2xl shadow-black/60"
      >
        {items.map((item) => (
          <DockIcon
            key={item.path}
            mouseX={mouseX}
            item={item}
            onHover={setHovered}
            onLeave={() => setHovered(null)}
          />
        ))}

        <div className="w-px h-8 self-center bg-white/10 mx-1 shrink-0" />

        <DockSearchButton
          mouseX={mouseX}
          onOpenPalette={onOpenPalette}
          onHover={setHovered}
          onLeave={() => setHovered(null)}
        />
      </motion.div>
    </div>
  );
};

export default Dock;
