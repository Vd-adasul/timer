import React, { useMemo, useEffect, useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Flame, Target, Trophy, Clock, Share2, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { calculateStats, calculateStreak } from '../utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Custom Animated Number component
const AnimatedNumber: React.FC<{ value: number; duration?: number; suffix?: string }> = ({ value, duration = 1, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const incrementTime = 30; // 30ms step
    const totalSteps = totalMiliseconds / incrementTime;
    const stepIncrement = (end - start) / totalSteps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      start += stepIncrement;
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Number(start.toFixed(1)));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className="font-mono">{displayValue}{suffix}</span>;
};

// SVG Circular Progress Ring
const ProgressRing: React.FC<{ percentage: number; color: string; size?: number; strokeWidth?: number; children: React.ReactNode }> = ({ 
  percentage, 
  color, 
  size = 56, 
  strokeWidth = 4,
  children 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-white/5 fill-transparent"
          strokeWidth={strokeWidth}
        />
        {/* Dynamic track */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const HomeScreen: React.FC = () => {
  const { state } = useAppStore();
  const navigate = useNavigate();

  const todayStats = useMemo(() => {
    const now = new Date();
    return calculateStats(state.blocks, state, startOfDay(now), endOfDay(now));
  }, [state]);

  const streak = useMemo(() => calculateStreak(state.blocks, state.activities), [state]);

  const topPart = Object.entries(todayStats.partBreakdown).sort((a, b) => b[1] - a[1])[0];
  
  // Resolve activities dynamically
  const studyAct = state.activities.find(a => a.id === 'act_study');
  const gymAct = state.activities.find(a => a.id === 'act_gym');
  const sleepAct = state.activities.find(a => a.id === 'act_sleep');

  const studyName = studyAct?.name || 'Study';
  const gymName = gymAct?.name || 'Gym';
  const sleepName = sleepAct?.name || 'Sleep';

  const studyHours = todayStats.activityBreakdown[studyName] || 0;
  const gymHours = todayStats.activityBreakdown[gymName] || 0;
  const sleepHours = todayStats.activityBreakdown[sleepName] || 0;

  const progressPercentage = Math.min((todayStats.totalTracked / 24) * 100, 100);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-[#09090b] overflow-y-auto pb-32 no-scrollbar"
    >
      {/* Premium Top Bar */}
      <div className="px-6 pt-10 pb-6 flex justify-between items-center z-10">
        <div>
          <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
            {greeting} <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          </h1>
        </div>
        <button 
          onClick={() => navigate('/report')}
          className="p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 hover:border-white/10 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0"
          title="Share Daily Summary"
        >
          <Share2 size={16} />
        </button>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full">
        
        {/* Main Progress Card (Linear inspired visual) */}
        <div className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-50" />
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-[40px] opacity-60" />
          
          <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1.5">Tracked Time</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-extrabold text-white tracking-tight">
                  <AnimatedNumber value={todayStats.totalTracked} />
                </p>
                <p className="text-lg text-white/30 font-semibold font-mono">/24h</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1.5">Productivity</p>
              <p className="text-4xl font-extrabold text-indigo-400 tracking-tight">
                <AnimatedNumber value={todayStats.score} suffix="%" />
              </p>
            </div>
          </div>
          
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative z-10">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {progressPercentage > 0 && (
                <div className="absolute inset-0 bg-white/25 w-full h-full animate-[pulse_2s_infinite]" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick Stats: Flighty-inspired dynamic SVG progress rings */}
        <div className="grid grid-cols-3 gap-4">
          {/* Study Ring Card */}
          <div className="bg-zinc-900/40 p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            <ProgressRing percentage={studyHours ? (studyHours / 8) * 100 : 0} color={studyAct?.color || '#3b82f6'}>
              <Target size={16} style={{ color: studyAct?.color || '#3b82f6' }} />
            </ProgressRing>
            <p className="text-xl font-bold text-white tracking-tight mt-3">
              <span className="font-mono">{studyHours}</span>
              <span className="text-xs text-white/40 ml-0.5 font-sans font-medium">h</span>
            </p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">{studyName}</p>
          </div>

          {/* Gym Ring Card */}
          <div className="bg-zinc-900/40 p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            <ProgressRing percentage={gymHours ? (gymHours / 2) * 100 : 0} color={gymAct?.color || '#f97316'}>
              <Flame size={16} style={{ color: gymAct?.color || '#f97316' }} />
            </ProgressRing>
            <p className="text-xl font-bold text-white tracking-tight mt-3">
              <span className="font-mono">{gymHours}</span>
              <span className="text-xs text-white/40 ml-0.5 font-sans font-medium">h</span>
            </p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">{gymName}</p>
          </div>

          {/* Sleep Ring Card */}
          <div className="bg-zinc-900/40 p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            <ProgressRing percentage={sleepHours ? (sleepHours / 8) * 100 : 0} color={sleepAct?.color || '#8b5cf6'}>
              <Clock size={16} style={{ color: sleepAct?.color || '#8b5cf6' }} />
            </ProgressRing>
            <p className="text-xl font-bold text-white tracking-tight mt-3">
              <span className="font-mono">{sleepHours}</span>
              <span className="text-xs text-white/40 ml-0.5 font-sans font-medium">h</span>
            </p>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">{sleepName}</p>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950 p-6 rounded-[28px] border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <Trophy size={100} strokeWidth={1} />
            </div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-2 relative z-10">Top Focus</p>
            <p className="text-lg font-bold text-white relative z-10 truncate tracking-tight">
              {topPart ? topPart[0] : 'None yet'}
            </p>
            {topPart && (
              <p className="text-xs text-indigo-400 font-bold font-mono mt-1.5 relative z-10">
                {topPart[1]} hours
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-zinc-950 p-6 rounded-[28px] border border-orange-500/10 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-orange-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
              <Flame size={100} strokeWidth={1} />
            </div>
            <p className="text-[10px] text-orange-500/60 font-bold uppercase tracking-wider mb-2 relative z-10">Current Streak</p>
            <div className="flex items-baseline gap-1 relative z-10">
              <p className="text-3xl font-extrabold text-orange-400 tracking-tight">
                <AnimatedNumber value={streak} />
              </p>
              <p className="text-[10px] text-orange-500/60 font-bold uppercase tracking-wider mb-1">Days</p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
