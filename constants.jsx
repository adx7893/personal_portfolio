import React from 'react';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Code2, 
  Database, 
  Globe, 
  Cpu,
  Layers,
  Server,
  Layout,
  Terminal,
  Zap,
  Cloud
} from 'lucide-react';

export const PROFILE = {
  name: "[Your Name Here]",
  role: "[Your Professional Title]",
  bio: "Experienced [Industry] professional with expertise in [Skill 1] and [Skill 2]. Passionate about [Your Interest].",
  location: "[City, Country]",
  availability: "[Availability Status]"
};

export const SKILLS = [
  { name: "Java", icon: React.createElement(Server, { className: "w-5 h-5" }) },
  { name: "Python (AI/ML)", icon: React.createElement(Terminal, { className: "w-5 h-5" }) },
  { name: "JavaScript", icon: React.createElement(Code2, { className: "w-5 h-5" }) },
  { name: "SQL & Spark", icon: React.createElement(Database, { className: "w-5 h-5" }) },
  { name: "AWS Cloud", icon: React.createElement(Cloud, { className: "w-5 h-5" }) },
  { name: "React / Next.js", icon: React.createElement(Globe, { className: "w-5 h-5" }) },
  { name: "Spring Boot", icon: React.createElement(Cpu, { className: "w-5 h-5" }) },
  { name: "CI/CD & DevOps", icon: React.createElement(Layers, { className: "w-5 h-5" }) },
];

export const PROJECTS = [
  {
    id: "1",
    title: "[Project Name 01]",
    description: "Template project description outlining core goals, user value, and a concise summary of implementation approach.",
    tags: ["Python", "Flask", "Langchain", "ChromaDB"],
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1000&auto=format&fit=crop",
    featured: true,
    link: "#"
  },
  {
    id: "2",
    title: "[Project Name 02]",
    description: "Template project description focused on scalable architecture, secure access patterns, and deployment workflow.",
    tags: ["Next.js", "MongoDB", "CI/CD", "JWT"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    featured: true,
    link: "#"
  },
  {
    id: "3",
    title: "[Project Name 03]",
    description: "Template project description highlighting business workflows, data modeling, and dashboard-style reporting.",
    tags: ["Java", "Spring Boot", "MySQL", "JSP"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    featured: false,
    link: "#"
  },
  {
    id: "4",
    title: "[Project Name 04]",
    description: "Template project description covering responsive interface design, API integration, and smooth interaction flows.",
    tags: ["React", "API", "Frontend"],
    imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1000&auto=format&fit=crop",
    featured: false,
    link: "#",
    demoUrl: "#"
  },
  {
    id: "5",
    title: "E-commerce Platform Template",
    description: "Template project description for catalog browsing, cart management, and secure checkout lifecycle handling.",
    tags: ["E-commerce", "Full Stack", "Java"],
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
    featured: false,
    link: "#"
  },
  {
    id: "6",
    title: "[Project Name 06]",
    description: "Template project description for interactive visualization and performance-conscious rendering techniques.",
    tags: ["3D", "Graphics", "Logic"],
    imageUrl: "https://images.unsplash.com/photo-1506318137071-a8bcbf67cc77?q=80&w=1000&auto=format&fit=crop",
    featured: false,
    link: "#"
  }
];

export const EXPERIENCE = [
  {
    id: "e1",
    role: "[Job Title]",
    company: "[Company Name]",
    period: "[Month Year] - Present",
    description: "Led cross-functional delivery of product features, improved process efficiency, and collaborated on stakeholder-aligned technical solutions."
  },
  {
    id: "e2",
    role: "[Job Title]",
    company: "[Company Name]",
    period: "[Month Year] - Present",
    description: "Built and maintained reliable application modules, authored internal documentation, and supported data-driven decision workflows."
  },
  {
    id: "e3",
    role: "[Job Title]",
    company: "[Company Name]",
    period: "[Month Year] - Present",
    description: "Executed quality assurance activities, validated release readiness, and coordinated issue resolution with engineering teams."
  }
];

export const SOCIALS = [
  { platform: "GitHub", url: "#", icon: "Github" },
  { platform: "LinkedIn", url: "#", icon: "Linkedin" },
  { platform: "Email", url: "#", icon: "Mail" },
];
