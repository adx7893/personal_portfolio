import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Sparkles, Scan, ArrowUpRight, Terminal, Database, Play } from 'lucide-react';
import { generateProjectInsight } from '../services/geminiService';

const AIProjectCard = ({ project, index }) => {
  const [insight, setInsight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e) => {
    e.stopPropagation();
    if (insight) return;
    
    setIsAnalyzing(true);
    try {
      const result = await generateProjectInsight(project.title, project.description);
      setInsight(result);
    } catch (err) {
      setInsight("Insight module unavailable.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group h-[380px] w-full 
        bg-white/90 dark:bg-zinc-900/80 
        backdrop-blur-md
        rounded-xl border border-zinc-200 dark:border-zinc-800 
        overflow-hidden transition-all duration-300
        hover:border-indigo-500/50 dark:hover:border-indigo-500/50
        hover:shadow-[0_0_30px_-10px_rgba(79,70,229,0.15)]
        flex flex-col"
    >
       {/* Tech Grid Background (Light) */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
            style={{
                backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)',
                backgroundSize: '32px 32px'
            }}
       />

       {/* Image Section */}
       <div className="relative h-40 overflow-hidden border-b border-zinc-200 dark:border-zinc-800 group-hover:h-36 transition-all duration-500">
         {/* Subtle Scanline Overlay for animated feel */}
         <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] bg-repeat pointer-events-none opacity-20" />
         
         <div className="absolute inset-0 bg-zinc-900/10 dark:bg-zinc-900/50 z-10 group-hover:bg-transparent transition-colors duration-500" />
         <img 
            src={project.imageUrl} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 animate-ken-burns" 
            alt={project.title} 
         />
         
         <div className="absolute top-3 right-3 z-20 flex gap-2">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" title="Live Demo" className="p-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-green-500 hover:scale-110 transition-all border border-zinc-200 dark:border-zinc-800">
                <Play className="w-4 h-4 fill-current" />
              </a>
            )}
            {project.link && (
              <a href={project.link} target="_blank" rel="noreferrer" title="View Source" className="p-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:scale-110 transition-all border border-zinc-200 dark:border-zinc-800">
                <Github className="w-4 h-4" />
              </a>
            )}
         </div>

         <div className="absolute bottom-2 left-3 z-20">
             <span className="text-[10px] font-mono font-bold bg-black/80 text-white px-2 py-1 rounded border border-white/10 backdrop-blur-md">
                PRJ-{project.id.padStart(3, '0')}
             </span>
         </div>
       </div>

       {/* Content */}
       <div className="relative z-10 p-5 flex flex-col flex-1 justify-between bg-white/50 dark:bg-zinc-900/40">
          <div>
            <h3 className="text-xl font-bold font-mono text-zinc-900 dark:text-white mb-2 tracking-tight flex items-center gap-2">
              {project.title}
            </h3>
            
            <p className="text-zinc-600 dark:text-zinc-300 text-sm line-clamp-3 mb-4 font-sans leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
             <AnimatePresence mode="wait">
                {insight ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-inner"
                  >
                    <div className="flex items-center gap-2 mb-1">
                        <Terminal className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Analysis Complete</span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-mono leading-relaxed">
                      "{insight}"
                    </p>
                  </motion.div>
                ) : (
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full group/btn relative overflow-hidden rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black py-2.5 transition-all hover:shadow-lg active:scale-95 disabled:opacity-70"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center gap-2">
                        {isAnalyzing ? (
                          <>
                            <Scan className="w-4 h-4 animate-spin" />
                            <span className="text-xs font-bold font-mono tracking-widest">PROCESSING</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold font-mono tracking-widest">GENERATE INSIGHT</span>
                          </>
                        )}
                    </div>
                  </button>
                )}
             </AnimatePresence>
          </div>
       </div>
    </motion.div>
  );
};

export { AIProjectCard };
