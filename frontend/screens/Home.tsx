import React, { useMemo, useEffect, useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Flame, Target, Trophy, Clock, Share2, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { calculateStats, calculateStreak } from '../utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Custom Animated Number component
const AnimatedNumber: React.FC<{ value: number; duration?: number; suffix?: string }> = ({ value, duration = 0.8, suffix = '' }) => {
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

  return <span className="font-mono font-medium">{displayValue}{suffix}</span>;
};

// SVG Circular Progress Ring - Softly style
const ProgressRing: React.FC<{ percentage: number; color: string; size?: number; strokeWidth?: number; children: React.ReactNode }> = ({ 
  percentage, 
  color, 
  size = 64, 
  strokeWidth = 5,
  children 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background track - light soft stone */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-stone-100 fill-transparent"
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
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
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

  const completedToday = useMemo(() => {
    const list: { trackName: string; partName: string; lectureNumber?: string; name: string }[] = [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    state.tracks.forEach(track => {
      track.parts.forEach(part => {
        part.lectures?.forEach(lecture => {
          if (lecture.completed && lecture.completedDate === todayStr) {
            list.push({
              trackName: track.name,
              partName: part.name,
              lectureNumber: lecture.lectureNumber,
              name: lecture.name
            });
          }
        });
      });
    });
    return list;
  }, [state.tracks]);

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
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar"
    >
      {/* Soft Top Bar */}
      <div className="px-6 pt-10 pb-6 flex justify-between items-center z-10">
        <div>
          <p className="text-stone-500/80 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight flex items-center gap-1.5">
            {greeting} <Sparkles size={14} className="text-app-peach animate-pulse" />
          </h1>
        </div>
        <button 
          onClick={() => navigate('/report')}
          className="p-3 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-800 border border-stone-200/40 rounded-full transition-all active:scale-95 shadow-[0_4px_12px_-2px_rgba(41,37,36,0.04)] flex items-center justify-center shrink-0"
          title="Share Wrap"
        >
          <Share2 size={15} />
        </button>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full">
        
        {/* Main Progress Card (Softly theme) */}
        <div className="bg-white p-6 rounded-[36px] border border-stone-200/30 shadow-[0_8px_30px_rgba(41,37,36,0.03)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-app-sage/30 via-transparent to-transparent opacity-50" />
          
          <div className="flex justify-between items-end mb-5 relative z-10">
            <div>
              <p className="text-[10px] text-stone-500/70 font-extrabold uppercase tracking-widest mb-1">Tracked Time</p>
              <div className="flex items-baseline gap-0.5">
                <p className="text-3xl font-extrabold text-stone-800 tracking-tight">
                  <AnimatedNumber value={todayStats.totalTracked} />
                </p>
                <p className="text-sm text-stone-400 font-bold font-mono">/24h</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-stone-500/70 font-extrabold uppercase tracking-widest mb-1">Productivity</p>
              <p className="text-3xl font-extrabold text-stone-800 tracking-tight">
                <AnimatedNumber value={todayStats.score} suffix="%" />
              </p>
            </div>
          </div>
          
          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/20 relative z-10">
            <motion.div 
              className="h-full bg-app-peach rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            />
          </div>
        </div>

        {/* Quick Stats: Soft progress rings */}
        <div className="grid grid-cols-3 gap-4">
          {/* Study Ring Card */}
          <div className="bg-white p-5 rounded-[28px] border border-stone-200/30 flex flex-col items-center justify-center text-center hover:bg-stone-50/50 transition-colors shadow-[0_4px_20px_-2px_rgba(41,37,36,0.02)] relative overflow-hidden group">
            <ProgressRing percentage={studyHours ? (studyHours / 8) * 100 : 0} color="var(--color-sage)">
              <Target size={14} className="text-stone-500" />
            </ProgressRing>
            <p className="text-lg font-extrabold text-stone-800 tracking-tight mt-3">
              <span className="font-mono">{studyHours}</span>
              <span className="text-xs text-stone-400 ml-0.5 font-sans font-medium">h</span>
            </p>
            <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mt-1">{studyName}</p>
          </div>

          {/* Gym Ring Card */}
          <div className="bg-white p-5 rounded-[28px] border border-stone-200/30 flex flex-col items-center justify-center text-center hover:bg-stone-50/50 transition-colors shadow-[0_4px_20px_-2px_rgba(41,37,36,0.02)] relative overflow-hidden group">
            <ProgressRing percentage={gymHours ? (gymHours / 2) * 100 : 0} color="var(--color-peach)">
              <Flame size={14} className="text-stone-500" />
            </ProgressRing>
            <p className="text-lg font-extrabold text-stone-800 tracking-tight mt-3">
              <span className="font-mono">{gymHours}</span>
              <span className="text-xs text-stone-400 ml-0.5 font-sans font-medium">h</span>
            </p>
            <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mt-1">{gymName}</p>
          </div>

          {/* Sleep Ring Card */}
          <div className="bg-white p-5 rounded-[28px] border border-stone-200/30 flex flex-col items-center justify-center text-center hover:bg-stone-50/50 transition-colors shadow-[0_4px_20px_-2px_rgba(41,37,36,0.02)] relative overflow-hidden group">
            <ProgressRing percentage={sleepHours ? (sleepHours / 8) * 100 : 0} color="var(--color-lavender)">
              <Clock size={14} className="text-stone-500" />
            </ProgressRing>
            <p className="text-lg font-extrabold text-stone-800 tracking-tight mt-3">
              <span className="font-mono">{sleepHours}</span>
              <span className="text-xs text-stone-400 ml-0.5 font-sans font-medium">h</span>
            </p>
            <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mt-1">{sleepName}</p>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[28px] border border-stone-200/30 relative overflow-hidden group shadow-[0_4px_20px_-2px_rgba(41,37,36,0.02)]">
            <div className="absolute -right-6 -top-6 text-stone-100 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12 pointer-events-none">
              <Trophy size={90} strokeWidth={1.5} />
            </div>
            <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mb-2 relative z-10">Top Focus</p>
            <p className="text-base font-extrabold text-stone-800 relative z-10 truncate tracking-tight">
              {topPart ? topPart[0] : 'None yet'}
            </p>
            {topPart && (
              <p className="text-xs text-stone-500 font-bold font-mono mt-1 relative z-10">
                {topPart[1]} hours
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-stone-200/30 relative overflow-hidden group shadow-[0_4px_20px_-2px_rgba(41,37,36,0.02)]">
            <div className="absolute -right-6 -top-6 text-app-peach/10 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-12 pointer-events-none">
              <Flame size={90} strokeWidth={1.5} />
            </div>
            <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mb-1 relative z-10">Streak Count</p>
            <div className="flex items-baseline gap-1 relative z-10">
              <p className="text-3xl font-extrabold text-stone-800 tracking-tight">
                <AnimatedNumber value={streak} />
              </p>
              <span className="font-cursive text-2xl text-stone-500/80 lowercase select-none">days</span>
            </div>
          </div>
        </div>

        {/* Completed Lectures Today Section */}
        {completedToday.length > 0 && (
          <div className="bg-white p-6 rounded-[28px] border border-stone-200/30 shadow-[0_4px_20px_-2px_rgba(41,37,36,0.02)] relative overflow-hidden">
            <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-4">Completed Today</h3>
            <div className="space-y-3">
              {completedToday.map((lec, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50/50 rounded-2xl border border-stone-200/20">
                  <div className="w-8 h-8 rounded-xl bg-app-peach/25 text-stone-700 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold border border-stone-200/20">
                    {lec.lectureNumber || 'L'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-stone-800 truncate">{lec.name}</p>
                    <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mt-0.5">
                      {lec.trackName} &bull; {lec.partName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
