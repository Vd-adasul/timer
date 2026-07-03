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
          <span className="text-[10px] font-bold text-stone-400/80 font-mono tracking-wider group-hover:text-stone-850 transition-colors">
            {formatTime(index)}
          </span>
          {/* Timeline Connector Line */}
          {index !== 47 && (
            <div className="absolute right-[-0.5px] top-1/2 bottom-[-1/2] w-[1px] h-full bg-stone-200/50 group-hover:bg-stone-300 transition-colors" />
          )}
          {/* Node dot */}
          <div className="absolute right-[-3px] top-[calc(50%-3px)] w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-app-peach group-hover:scale-125 transition-all" />
        </div>

        {/* Content Column */}
        <div className="flex-1 pl-5 py-1.5 relative select-none">
          {activity ? (
            <div 
              className="h-full rounded-[20px] bg-white px-4 flex flex-col justify-center transition-all duration-300 hover:shadow-[0_4px_16px_rgba(41,37,36,0.03)] active:scale-[0.98] border border-stone-200/30 relative overflow-hidden"
              style={{ 
                borderLeft: `4px solid ${activity.color}` 
              }}
            >
              {/* Soft glow behind the block */}
              <div 
                className="absolute inset-y-0 left-0 w-16 opacity-5 filter blur-md" 
                style={{ backgroundColor: activity.color }}
              />
              <div className="flex items-center gap-2 relative z-10">
                <span className="font-extrabold text-xs tracking-tight text-stone-800">
                  {activity.name} {trackName ? <span className="text-stone-400 font-medium font-cursive text-base lowercase ml-1">({trackName})</span> : ''}
                </span>
              </div>
              {partName && (
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5 truncate max-w-[240px] relative z-10">
                  {partName} {itemName ? <span className="text-stone-400 font-normal">({itemName})</span> : ''}
                </span>
              )}
            </div>
          ) : (
            <div className="h-full rounded-[20px] border border-dashed border-stone-200/50 bg-stone-50/20 hover:bg-stone-50/60 transition-all duration-200 flex items-center px-4 active:scale-[0.98]">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Tap to track</span>
            </div>
          )}

          {/* Award Winning 'Now' Indicator Line Overlay - styled Softly */}
          {showNowIndicator && (
            <div 
              className="absolute left-1 right-3 z-20 pointer-events-none flex items-center gap-1.5"
              style={{ top: `${nowOffsetPercent}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-app-peach animate-ping shadow-[0_0_8px_#FFB7B2]" />
              <div className="flex-1 h-[1px] bg-gradient-to-r from-app-peach to-transparent" />
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
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col h-full bg-[#FDFCF8]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#FDFCF8]/70 backdrop-blur-xl sticky top-0 z-30 border-b border-stone-200/20">
        <button 
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
          className="p-2.5 rounded-full hover:bg-stone-50 border border-transparent hover:border-stone-200/20 text-stone-500 hover:text-stone-855 transition-all active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 px-4 py-2 border border-transparent hover:border-stone-200/20 rounded-full transition-all active:scale-95" 
          onClick={() => setCurrentDate(new Date())}
        >
          <CalendarIcon size={12} className="text-stone-400" />
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-800">
            {format(currentDate, 'EEEE, MMM d')}
          </h2>
        </div>

        <button 
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-2.5 rounded-full hover:bg-stone-50 border border-transparent hover:border-stone-200/20 text-stone-500 hover:text-stone-855 transition-all active:scale-95"
        >
          <ChevronRight size={18} />
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
