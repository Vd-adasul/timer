import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { formatTime, getBlockKey } from '../utils';
import { EntryModal } from '../components/EntryModal';
import { motion } from 'framer-motion';

export const TimelineScreen: React.FC = () => {
  const { state } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Real-time tracker for the 'Now' indicator
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  const currentHour = nowTime.getHours();
  const currentMinutes = nowTime.getMinutes();
  const nowBlockIndex = currentHour * 2 + (currentMinutes >= 30 ? 1 : 0);
  const nowOffsetPercent = ((currentMinutes % 30) / 30) * 100;

  // Auto-scroll to current hour on load
  useEffect(() => {
    if (isToday && scrollRef.current) {
      const timer = setTimeout(() => {
        const blockElement = document.getElementById(`block-${nowBlockIndex}`);
        if (blockElement) {
          blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [dateStr]);

  const handleBlockClick = (index: number) => {
    setSelectedBlock(index);
    setModalOpen(true);
  };

  const renderBlock = (index: number) => {
    const key = getBlockKey(dateStr, index);
    const blockData = state.blocks[key];
    const activity = blockData ? state.activities.find(a => a.id === blockData.activityId) : null;
    
    let trackName = '';
    let partName = '';
    let itemName = '';

    if (blockData?.trackId) {
      const track = state.tracks.find(t => t.id === blockData.trackId);
      if (track) {
        trackName = track.name;
        if (blockData.partId) {
          const part = track.parts.find(p => p.id === blockData.partId);
          if (part) {
            partName = part.name;
            if (blockData.itemId) {
              const item = [...(part.lectures || []), ...(part.assignments || [])].find(i => i.id === blockData.itemId);
              if (item) itemName = item.name;
            }
          }
        }
      }
    }

    const showNowIndicator = isToday && index === nowBlockIndex;

    return (
      <div 
        key={index} 
        id={`block-${index}`}
        onClick={() => handleBlockClick(index)}
        className="flex items-stretch group cursor-pointer h-16 relative select-none"
      >
        {/* Time Column */}
        <div className="w-16 flex-shrink-0 flex flex-col items-end pr-4 justify-center relative select-none">
          <span className="text-[10px] font-bold text-white/30 font-mono tracking-wider group-hover:text-white/60 transition-colors">
            {formatTime(index)}
          </span>
          {/* Timeline Connector Line */}
          {index !== 47 && (
            <div className="absolute right-[-0.5px] top-1/2 bottom-[-1/2] w-[1px] h-full bg-white/10 group-hover:bg-white/20 transition-colors" />
          )}
          {/* Node dot */}
          <div className="absolute right-[-3px] top-[calc(50%-3px)] w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/40 group-hover:scale-125 transition-all" />
        </div>

        {/* Content Column */}
        <div className="flex-1 pl-5 py-1.5 relative select-none">
          {activity ? (
            <div 
              className="h-full rounded-2xl px-4 flex flex-col justify-center transition-all duration-300 hover:brightness-110 active:scale-[0.98] border border-white/[0.03] shadow-md relative overflow-hidden"
              style={{ 
                backgroundColor: `${activity.color}0a`, 
                borderLeft: `4px solid ${activity.color}` 
              }}
            >
              {/* Soft glow behind the block */}
              <div 
                className="absolute inset-y-0 left-0 w-24 opacity-30 filter blur-xl" 
                style={{ backgroundColor: activity.color }}
              />
              <div className="flex items-center gap-2 relative z-10">
                <span className="font-bold text-sm tracking-tight" style={{ color: activity.color }}>
                  {activity.name} {trackName ? <span className="text-white/40 font-medium"> · {trackName}</span> : ''}
                </span>
              </div>
              {partName && (
                <span className="text-xs text-white/50 mt-0.5 font-medium tracking-wide truncate max-w-[240px] relative z-10">
                  {partName} {itemName ? <span className="text-white/30 font-normal">({itemName})</span> : ''}
                </span>
              )}
            </div>
          ) : (
            <div className="h-full rounded-2xl border border-transparent bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/5 transition-all duration-200 flex items-center px-4 active:scale-[0.98]">
              <span className="text-[11px] text-white/20 font-bold uppercase tracking-wider">Tap to track</span>
            </div>
          )}

          {/* Award Winning 'Now' Indicator Line Overlay */}
          {showNowIndicator && (
            <div 
              className="absolute left-1 right-3 z-20 pointer-events-none flex items-center gap-1.5"
              style={{ top: `${nowOffsetPercent}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shadow-[0_0_8px_#6366f1]" />
              <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-500/80 to-transparent" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-[#09090b]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-30 border-b border-white/5">
        <button 
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
          className="p-2.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 text-white/50 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-4 py-2 border border-transparent hover:border-white/5 rounded-full transition-all active:scale-95" 
          onClick={() => setCurrentDate(new Date())}
        >
          <CalendarIcon size={14} className="text-white/40" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/80">
            {format(currentDate, 'EEEE, MMM d')}
          </h2>
        </div>

        <button 
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-2.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 text-white/50 hover:text-white transition-all active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto pb-32 px-4 no-scrollbar" ref={scrollRef}>
        <div className="max-w-2xl mx-auto py-6 relative">
          {Array.from({ length: 48 }).map((_, i) => renderBlock(i))}
        </div>
      </div>

      <EntryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        date={dateStr}
        blockIndex={selectedBlock}
      />
    </motion.div>
  );
};
