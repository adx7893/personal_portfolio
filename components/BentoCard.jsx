import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const BentoCard = ({ 
  children, 
  className = "", 
  delay = 0, 
  title,
  noPadding = false,
  ...props
}) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <motion.div
      {...props}
      ref={divRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl 
        bg-white dark:bg-zinc-900 
        border border-zinc-200 dark:border-zinc-800/50 
        group transition-all duration-300 
        hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-none
        ${className}`}
    >
      {/* Dark Mode: Subtle White Spotlight */}
      <div 
        className="pointer-events-none absolute -inset-px transition duration-300 opacity-0 group-hover:opacity-100 z-10 hidden dark:block"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />
      
      {/* Light Mode: Vibrant Aurora/Iridescent Spotlight */}
      <div 
        className="pointer-events-none absolute -inset-px transition duration-300 opacity-0 group-hover:opacity-100 z-10 block dark:hidden"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
          mixBlendMode: 'multiply'
        }}
      />
      
      {/* Border Spotlight (Dark Mode) */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-20 hidden dark:block"
        style={{
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(120, 119, 198, 0.3), transparent 40%)`,
          maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px'
        }}
      />

       {/* Border Spotlight (Light Mode) - Colorful Ring */}
       <div 
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-20 block dark:hidden"
        style={{
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(79, 70, 229, 0.4), transparent 40%)`,
          maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '2px' 
        }}
      />

      {/* Content */}
      <div className={`relative h-full z-10 ${noPadding ? '' : 'p-6'}`}>
        {title && (
          <div className="flex items-center gap-2 mb-4">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
             <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold font-mono tracking-widest uppercase">
               {title}
             </h3>
          </div>
        )}
        {children}
      </div>
      
      {/* Decoration Lines (Circuit Board feel) */}
      <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M0 0H20V20" stroke="currentColor" strokeWidth="1" className="text-zinc-900 dark:text-white"/>
        </svg>
      </div>
    </motion.div>
  );
};

export { BentoCard };
