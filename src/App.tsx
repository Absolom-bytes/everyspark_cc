/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  BrainCircuit, 
  Compass, 
  Layers, 
  CheckCircle2, 
  Mail, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Bot,
  Database,
  Search,
  Workflow,
  MessageSquare,
  ShieldCheck,
  Network,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Forum from './components/Forum';

// --- Types ---

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index: number;
}

interface SkillItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

// --- Components ---

const ServiceCard = ({ icon, title, description, index }: ServiceCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="group p-8 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden"
    id={`service-${index}`}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl -z-10 group-hover:bg-cyan-500/10 transition-all" />
    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed mb-6 group-hover:text-slate-400 transition-colors">{description}</p>
    <div className="flex items-center text-[10px] font-bold text-cyan-400 tracking-widest uppercase cursor-pointer group-hover:gap-2 transition-all">
      Deploy Service <ArrowRight size={12} className="ml-2" />
    </div>
  </motion.div>
);

const SkillItem = ({ title, description, icon }: SkillItemProps) => (
  <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 group">
    <div className="flex-shrink-0 w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{title}</h4>
      <p className="text-[11px] text-slate-500 leading-normal group-hover:text-slate-400 transition-colors">{description}</p>
    </div>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'forum'>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Services', id: 'services' },
    { name: 'Approach', id: 'approach' },
    { name: 'Community', id: 'community' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'community') {
      setActiveView('forum');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      if (activeView === 'forum') {
        setActiveView('landing');
        setTimeout(() => scrollToSection(id), 100);
      } else {
        scrollToSection(id);
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => { setActiveView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EverySpark</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 text-sm font-medium uppercase tracking-widest text-slate-400">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors ${activeView === 'forum' && link.id === 'community' ? 'text-cyan-400' : 'hover:text-cyan-400'}`}
                id={`nav-link-${link.id}`}
              >
                {link.name}
              </button>
            ))}
            <button 
              onClick={() => handleNavClick('contact')}
              className="px-6 py-2 bg-white text-slate-950 text-sm font-bold rounded-full hover:bg-cyan-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              id="cta-nav-button"
            >
              Consultation
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            id="mobile-menu-button"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-950/95 border-b border-white/5 overflow-hidden backdrop-blur-lg"
              id="mobile-menu"
            >
              <div className="px-6 py-8 space-y-6">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="block w-full text-left text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400"
                  >
                    {link.name}
                  </button>
                ))}
                <button 
                  onClick={() => handleNavClick('contact')}
                  className="w-full bg-white text-slate-950 px-6 py-4 rounded-full text-sm font-bold uppercase tracking-widest"
                >
                  Consultation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {activeView === 'landing' ? (
        <>
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center text-center px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Bridging Modern Ed-Tech Gaps</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 max-w-4xl leading-tight">
                Future-Proofing Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Educational Model.</span>
              </h1>
              <p className="max-w-2xl text-lg text-slate-400 mb-10 leading-relaxed mx-auto">
                Build, scale, and secure your institution's future on a framework of AI literacy, competency-based logic, and adaptive student pathways.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 text-sm font-bold rounded-full hover:bg-cyan-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-900/10"
                  id="hero-primary-cta"
                >
                  BOOK CONSULTATION <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => scrollToSection('community')}
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-slate-300 text-sm font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  id="hero-secondary-cta"
                >
                  JOIN THE NETWORK
                </button>
              </div>
            </motion.div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-16">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-4"> Strategic Pillars</div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">Our Framework</h2>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-3 gap-6">
              <ServiceCard 
                index={0}
                icon={<Bot size={24} />}
                title="AI Upskilling"
                description="Platform-agnostic units focused on automation and literacy. Empowering staff to securely reclaim time through strategic cognitive offloading."
              />
              <ServiceCard 
                index={1}
                icon={<Layers size={24} />}
                title="Adaptive Journeys"
                description="Implementing data-driven tracking to create non-linear student pathways. Tailoring scheduling to real-time mastery metrics."
              />
              <ServiceCard 
                index={2}
                icon={<Compass size={24} />}
                title="Competency Design"
                description="Transforming heavy content clusters into transferable universal skills. Designing curricula that survive the disruption cycle."
              />
            </div>
          </section>

          {/* Approach Section */}
          <section id="approach" className="py-24 relative z-10 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-4">Methodology</div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">Toward <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Universal Logic.</span></h2>
                  <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                    Facts are static; cognition is dynamic. We help schools shift from content-first instruction to a logic-first architecture, ensuring graduates remain relevant in an automated world.
                  </p>
                  
                  <div className="bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-950/40">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">DATA_ANALYTICS // GAP_ANALYSIS</div>
                    </div>
                    <div className="p-8 text-left">
                      <h3 className="text-white font-bold mb-4">Foundational Skill Mapping</h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">
                        Our systemic approach identifies root causes through cross-subject data integration, allowing schools to apply surgical interventions where they matter most.
                      </p>
                      <div className="flex items-center gap-3 py-3 border-t border-white/5">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-xs font-mono text-emerald-400 uppercase tracking-tighter">Precision Optimization Active</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm">Cognitive Core</h3>
                  <div className="grid gap-4">
                    <SkillItem title="Information Retrieval" description="Navigating high-density data and verification." icon={<Search size={18} />} />
                    <SkillItem title="Operational Logic" description="Deconstructing problems into workflows." icon={<Workflow size={18} />} />
                    <SkillItem title="Contextual Synthesis" description="Merging data to form original whole." icon={<BrainCircuit size={18} />} />
                    <SkillItem title="Critical Verification" description="Identifying bias and logic leaks." icon={<ShieldCheck size={18} />} />
                    <SkillItem title="Systemic Thinking" description="Patterns within the ecosystem." icon={<Network size={18} />} />
                    <SkillItem title="Strategic Communication" description="Translating logic across platforms." icon={<MessageSquare size={18} />} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-24 relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16">
                <div>
                  <h2 className="text-5xl font-extrabold text-white mb-8 italic tracking-tighter">Ready for <span className="text-cyan-400">Deployment?</span></h2>
                  <p className="text-lg text-slate-400 mb-12 max-w-md leading-relaxed">
                    Join the network of future-ready institutions. Secure your consultation slot to begin the transition.
                  </p>

                  <div className="space-y-6 text-sm font-mono tracking-widest uppercase text-slate-500">
                    <div className="flex items-center gap-4">
                      <Mail size={16} className="text-cyan-400" />
                      <span>HELLO@EVERYSPARK.CC</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <MapPin size={16} className="text-cyan-400" />
                      <span>Global Educational Consulting</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-10 backdrop-blur-sm">
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <input type="text" placeholder="FIRST_NAME" className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-xs uppercase tracking-widest text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-600" />
                      <input type="text" placeholder="LAST_NAME" className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-xs uppercase tracking-widest text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-600" />
                    </div>
                    <input type="email" placeholder="WORK_EMAIL" className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-xs uppercase tracking-widest text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-600" />
                    <textarea rows={4} placeholder="CHALLENGES__GOALS" className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-xs uppercase tracking-widest text-white focus:outline-none focus:border-cyan-400 transition-all resize-none placeholder:text-slate-600"></textarea>
                    <button type="submit" className="w-full py-4 bg-white text-slate-950 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-cyan-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                      Send Inquiry // Initiate Sync
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="pt-32">
          <Forum />
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded shadow-[0_0_10px_rgba(34,211,238,0.3)] flex items-center justify-center text-white">
              <Sparkles size={14} />
            </div>
            <span className="text-sm font-bold tracking-tight text-white uppercase">EverySpark</span>
          </div>
          
          <p className="text-slate-600 text-[10px] font-mono tracking-[0.2em] uppercase">
            &copy; {new Date().getFullYear()} EverySpark Consulting. Empowering Educators.
          </p>

          <div className="flex gap-8 text-[10px] font-mono tracking-widest text-slate-600 uppercase">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      {/* Bottom Labels */}
      <div className="fixed bottom-4 left-6 lg:left-12 flex gap-8 text-[9px] text-slate-700 font-mono tracking-widest pointer-events-none hidden sm:flex">
        <span>REGION: EDUCATIONAL_TRANSFORMATION_A1</span>
        <span>STATUS: OPERATIONAL</span>
        <span>LATENCY: 0MS</span>
      </div>
    </div>
  );
}
