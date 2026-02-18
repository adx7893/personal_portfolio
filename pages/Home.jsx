import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  MapPin, 
  Terminal, 
  Layers,
  Cpu,
  Github,
  Linkedin,
  Mail,
  ChevronRight
} from 'lucide-react';
import { BentoCard } from '../components/BentoCard';
import { PROFILE, SKILLS, SOCIALS } from '../constants';
import { motion } from 'framer-motion';

const Home = () => {
  const getIcon = (name) => {
    switch (name) {
      case 'Github': return <Github className="w-5 h-5" />;
      case 'Linkedin': return <Linkedin className="w-5 h-5" />;
      case 'Twitter': return <ArrowUpRight className="w-5 h-5" />;
      case 'Mail': return <Mail className="w-5 h-5" />;
      default: return <ArrowUpRight className="w-5 h-5" />;
    }
  };

  return (
    <div className="pt-24 pb-12 overflow-x-hidden">
      <header className="mb-16 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 text-xs tracking-[0.2em] uppercase font-bold">[Availability Status]</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-600 leading-[0.9] mb-4">
                {PROFILE.name.split(' ')[0]}<br />
                <span className="text-zinc-400 dark:text-zinc-800 text-stroke-zinc-900 dark:text-stroke-white">{PROFILE.name.split(' ')[1]}</span>
              </h1>
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-sm">
                <Terminal className="w-4 h-4" />
                <span>{PROFILE.role}</span>
              </div>
            </div>
            
            <div className="w-full lg:max-w-lg mt-4 lg:mt-20">
               <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg">
                    {PROFILE.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-full bg-white/50 dark:bg-zinc-900/50 text-xs font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                       <MapPin className="w-3 h-3" /> {PROFILE.location}
                    </div>
                  </div>
               </div>
            </div>
          </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-4 auto-rows-[120px]">
          
          <BentoCard className="md:col-span-8 lg:col-span-8 row-span-2 overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md" title="Tech Stack" delay={0.1}>
             <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white dark:from-zinc-900 dark:via-transparent dark:to-zinc-900 z-10 pointer-events-none" />
             <div className="relative h-full flex items-center overflow-hidden">
               <div className="flex gap-4 animate-scroll whitespace-nowrap hover:[animation-play-state:paused] w-max">
                  {[...SKILLS, ...SKILLS, ...SKILLS].map((skill, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all group/skill shadow-sm"
                    >
                      <span className="text-zinc-500 dark:text-zinc-400 group-hover/skill:text-indigo-600 dark:group-hover/skill:text-indigo-400 transition-colors">{skill.icon}</span>
                      <span className="text-base font-mono font-medium text-zinc-700 dark:text-zinc-300">{skill.name}</span>
                    </div>
                  ))}
               </div>
             </div>
          </BentoCard>

          <div className="md:col-span-4 lg:col-span-4 row-span-2 grid grid-cols-2 gap-4">
            {SOCIALS.slice(0, 2).map((social, idx) => (
               <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" className="block h-full">
                  <BentoCard className="h-full flex flex-col justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md" delay={0.4 + (idx * 0.1)}>
                     <div className="flex justify-between items-start">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                           {getIcon(social.icon)}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                     </div>
                     <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{social.platform}</span>
                  </BentoCard>
               </a>
            ))}
          </div>

          <Link to="/projects" className="md:col-span-6 lg:col-span-8 row-span-2 group">
             <BentoCard className="h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:border-indigo-500/50 transition-colors" delay={0.3}>
                 <div className="relative h-full flex flex-col justify-between z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">Featured Projects</h2>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md">
                            Explore full-stack applications, AI integrations, and quantum computing experiments.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-sm group-hover:translate-x-2 transition-transform">
                        <span>View All Projects</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                 </div>
             </BentoCard>
          </Link>

      </div>
    </div>
  );
};

export { Home };
