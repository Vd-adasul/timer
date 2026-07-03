import React, { useMemo } from 'react';
import { Lightbulb, TrendingUp, Target, AlertCircle, Clock } from 'lucide-react';
import { useAppStore } from '../store';
import { generateInsights } from '../utils';
import { motion } from 'framer-motion';

export const InsightsScreen: React.FC = () => {
  const { state } = useAppStore();

  const insights = useMemo(() => {
    return generateInsights(state);
  }, [state]);

  const renderInsightCard = (text: string, index: number) => {
    let icon = <Lightbulb size={20} />;
    let style = {
      text: "text-amber-400",
      border: "border-amber-500/10 hover:border-amber-500/30",
      bg: "bg-amber-500/5",
      glow: "bg-amber-500/10",
      indicator: "bg-amber-400"
    };

    if (text.includes('score') || text.includes('productivity')) {
      icon = <Target size={20} />;
      style = {
        text: "text-indigo-400",
        border: "border-indigo-500/10 hover:border-indigo-500/30",
        bg: "bg-indigo-500/5",
        glow: "bg-indigo-500/10",
        indicator: "bg-indigo-400"
      };
    } else if (text.includes('consistent') || text.includes('spent') || text.includes('hours')) {
      icon = <TrendingUp size={20} />;
      style = {
        text: "text-emerald-400",
        border: "border-emerald-500/10 hover:border-emerald-500/30",
        bg: "bg-emerald-500/5",
        glow: "bg-emerald-500/10",
        indicator: "bg-emerald-400"
      };
    } else if (text.includes('best between') || text.includes('lost')) {
      icon = <Clock size={20} />;
      style = {
        text: "text-orange-400",
        border: "border-orange-500/10 hover:border-orange-500/30",
        bg: "bg-orange-500/5",
        glow: "bg-orange-500/10",
        indicator: "bg-orange-400"
      };
    }

    const lines = text.split('\n');

    return (
      <motion.div 
        key={index} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4 }}
        className={`relative overflow-hidden bg-zinc-900/40 p-6 rounded-[28px] border ${style.border} flex flex-col gap-4 group hover:bg-zinc-900/60 transition-all duration-300 shadow-lg`}
      >
        {/* Glow ambient circle background */}
        <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[40px] opacity-40 transition-opacity duration-300 group-hover:opacity-75 ${style.glow}`} />
        
        <div className="flex justify-between items-center relative z-10">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${style.bg} ${style.text} border border-white/5`}>
            {icon}
          </div>
          {/* Subtle Dynamic Island-like colored badge dot */}
          <div className={`w-1.5 h-1.5 rounded-full ${style.indicator}`} />
        </div>
        
        <div className="pt-1 relative z-10">
          {lines.map((line, i) => (
            <p 
              key={i} 
              className={`leading-relaxed tracking-wide ${
                i > 0 
                  ? 'font-extrabold text-2xl text-white mt-1.5 tracking-tight' 
                  : 'text-xs font-bold uppercase tracking-wider text-white/40'
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-[#09090b] overflow-y-auto pb-32 no-scrollbar"
    >
      <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10 border-b border-transparent">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Insights</h1>
        <p className="text-white/40 text-xs mt-2 font-bold uppercase tracking-wider">Locally generated analysis of your time</p>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-2">
        <div className="grid grid-cols-1 gap-4">
          {insights.map((text, i) => renderInsightCard(text, i))}
        </div>
        
        <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-[24px] flex items-start gap-4 mt-8 relative overflow-hidden group">
           <AlertCircle size={18} className="text-white/30 shrink-0 mt-0.5" />
           <p className="text-xs text-white/40 font-bold uppercase tracking-wider leading-relaxed">
             All insights are generated locally on your device. Your data never leaves this app.
           </p>
        </div>
      </div>
    </motion.div>
  );
};
