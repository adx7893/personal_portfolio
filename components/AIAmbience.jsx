import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, Image as ImageIcon, Loader2, Cpu, Wifi, Activity, Lock } from 'lucide-react';
import { generateBackgroundArt, generateWelcomeAudio, playGeneratedAudio } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

const AIAmbience = () => {
  const [bgImage, setBgImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
        setBootStep(0);
        return;
    }
    
    const interval = setInterval(() => {
      setBootStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const bootMessages = [
    "INITIALIZING NEURAL UPLINK...",
    "ALLOCATING GPU CLUSTERS...",
    "SYNTHESIZING AUDIO WAVES...",
    "RENDERING DIGITAL DREAMSCAPE...",
    "SYSTEM READY."
  ];

  const handleActivate = async () => {
    if (isLoading || hasLoaded) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext({sampleRate: 24000});

    setIsLoading(true);

    try {
      const [imgData, audioData] = await Promise.all([
        generateBackgroundArt(),
        generateWelcomeAudio()
      ]);

      if (imgData) {
        setBgImage(imgData);
      }
      
      if (audioData) {
        await playGeneratedAudio(audioData, audioCtx);
      }
      
      setHasLoaded(true);
    } catch (e) {
      console.error("Error activating ambience", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {bgImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-[3px] z-10 transition-colors duration-1000" /> 
            
            <motion.img 
              initial={{ scale: 1.1, filter: 'blur(20px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              src={bgImage} 
              alt="AI Generated Background" 
              className="w-full h-full object-cover" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ 
                    opacity: 0, 
                    scale: 1.5, 
                    filter: 'blur(10px)',
                    transition: { duration: 0.8, ease: "easeInOut" } 
                }}
                className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-wait"
            >
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{
                        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center mb-10 sm:mb-12">
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-dashed border-zinc-700 w-full h-full"
                    />
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-full border-t-2 border-r-2 border-indigo-500 w-[calc(100%-2rem)] h-[calc(100%-2rem)]"
                    />
                    <motion.div 
                         animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
                         transition={{ duration: 2, repeat: Infinity }}
                         className="absolute inset-12 rounded-full border border-indigo-400/30 bg-indigo-500/10 backdrop-blur-sm w-[calc(100%-6rem)] h-[calc(100%-6rem)] flex items-center justify-center"
                    >
                         <Cpu className="w-12 h-12 text-indigo-400 animate-pulse" />
                    </motion.div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-2 h-16 w-full px-3">
                    <motion.div
                        key={bootStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-indigo-400 font-mono text-xs sm:text-xl tracking-[0.08em] sm:tracking-[0.2em] font-bold uppercase text-center w-full"
                    >
                        {bootMessages[bootStep]}
                    </motion.div>
                    
                    <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mt-4">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 4.5, ease: "easeInOut" }}
                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                        />
                    </div>
                </div>
                
                <div className="absolute bottom-8 left-0 right-0 flex flex-wrap justify-center gap-3 sm:gap-8 px-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest text-center">
                    <div className="flex items-center gap-2">
                        <Wifi className="w-3 h-3 animate-pulse" /> Network: Secure
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 animate-pulse" /> CPU: Optimizing
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Protocol: v2.5.0
                    </div>
                </div>

            </motion.div>
        )}
      </AnimatePresence>

      {!hasLoaded && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleActivate}
            disabled={isLoading}
            className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto z-40 flex items-center justify-center sm:justify-start gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-zinc-900/90 dark:bg-zinc-100/90 backdrop-blur-md border border-zinc-700 dark:border-zinc-300 rounded-full shadow-2xl text-[10px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-white dark:text-black hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white hover:border-transparent transition-all group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <Sparkles className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                </div>
                <span>Activate AI Experience</span>
              </>
            )}
          </motion.button>
      )}
      
      {hasLoaded && (
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto z-40 px-3 py-1.5 rounded-full bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 backdrop-blur-md flex items-center justify-center sm:justify-start gap-2 group cursor-default shadow-lg"
         >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-bold shadow-black drop-shadow-sm">AI Background Active</span>
         </motion.div>
      )}
    </>
  );
};

export { AIAmbience };
