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
    let icon = <Lightbulb size={18} />;
    let style = {
      text: "text-amber-500",
      border: "border-stone-200/30 hover:border-stone-200/50",
      bg: "bg-amber-500/5",
      glow: "bg-amber-500/5",
      indicator: "bg-amber-400"
    };

    if (text.includes('score') || text.includes('productivity')) {
      icon = <Target size={18} />;
      style = {
        text: "text-app-peach",
        border: "border-stone-200/30 hover:border-stone-200/50",
        bg: "bg-app-peach/10",
        glow: "bg-app-peach/5",
        indicator: "bg-app-peach"
      };
    } else if (text.includes('consistent') || text.includes('spent') || text.includes('hours')) {
      icon = <TrendingUp size={18} />;
      style = {
        text: "text-stone-600",
        border: "border-stone-200/30 hover:border-stone-200/50",
        bg: "bg-app-sage",
        glow: "bg-app-sage/30",
        indicator: "bg-stone-500"
      };
    } else if (text.includes('best between') || text.includes('lost')) {
      icon = <Clock size={18} />;
      style = {
        text: "text-stone-600",
        border: "border-stone-200/30 hover:border-stone-200/50",
        bg: "bg-app-lavender",
        glow: "bg-app-lavender/30",
        indicator: "bg-stone-500"
      };
    }

    const lines = text.split('\n');
    const rotation = index % 2 === 0 ? 'rotate-1' : '-rotate-1';

    return (
      <motion.div 
        key={index} 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className={`relative overflow-hidden bg-white p-6 rounded-[28px] border ${style.border} flex flex-col gap-4 group transition-all duration-300 shadow-[0_4px_20px_-2px_rgba(41,37,36,0.02)] ${rotation}`}
      >
        {/* Glow ambient background */}
        <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[40px] opacity-40 transition-opacity duration-300 group-hover:opacity-75 ${style.glow}`} />
        
        <div className="flex justify-between items-center relative z-10">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${style.bg} ${style.text}`}>
            {icon}
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${style.indicator}`} />
        </div>
        
        <div className="pt-1 relative z-10">
          {lines.map((line, i) => (
            <p 
              key={i} 
              className={`leading-relaxed ${
                i > 0 
                  ? 'font-extrabold text-xl text-stone-800 mt-1.5 tracking-tight' 
                  : 'text-[9px] font-extrabold uppercase tracking-widest text-stone-400'
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
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar"
    >
      <div className="px-6 pt-10 pb-6 sticky top-0 bg-app-bg/85 backdrop-blur-md z-10 border-b border-transparent">
        <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight">Insights</h1>
        <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mt-2">
          Locally generated analysis of your time
        </p>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-2">
        <div className="grid grid-cols-1 gap-5">
          {insights.map((text, i) => renderInsightCard(text, i))}
        </div>
        
        <div className="bg-stone-50 border border-stone-200/40 p-5 rounded-[24px] flex items-start gap-4 mt-8 relative overflow-hidden group">
           <AlertCircle size={16} className="text-stone-400 shrink-0 mt-0.5" />
           <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider leading-relaxed">
             All insights are generated locally on your device. Your data never leaves this app.
           </p>
        </div>
      </div>
    </motion.div>
  );
};
