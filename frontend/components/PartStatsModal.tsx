import React, { useMemo } from 'react';
import { X, Clock, Calendar, CalendarDays, Infinity as InfinityIcon } from 'lucide-react';
import { useAppStore } from '../store';
import { calculatePartStats } from '../utils';
import { TrackPart } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface PartStatsModalProps {
  part: TrackPart | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PartStatsModal: React.FC<PartStatsModalProps> = ({ part, isOpen, onClose }) => {
  const { state } = useAppStore();

  const stats = useMemo(() => {
    if (!part) return null;
    return calculatePartStats(state.blocks, part.id);
  }, [part, state.blocks]);

  return (
    <AnimatePresence>
      {isOpen && part && stats && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 sm:p-4">
          {/* Tap outside backdrop */}
          <div className="absolute inset-0 z-10" onClick={onClose} />

          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-stone-200/30 shadow-[0_-16px_48px_rgba(41,37,36,0.06)] flex flex-col z-20"
          >
            {/* Soft top drag indicator bar */}
            <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mt-3 shrink-0" />

            <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-stone-100">
              <h3 className="text-base font-extrabold text-stone-850 tracking-tight">{part.name}</h3>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-stone-50 text-stone-500 hover:text-stone-850 transition-colors active:scale-95 border border-transparent hover:border-stone-200/20"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50/50 p-4.5 rounded-[22px] border border-stone-200/35">
                  <div className="flex items-center gap-2 text-stone-400 mb-2.5">
                    <Clock size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Today</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-850 tracking-tight font-mono">
                    {stats.today}
                    <span className="text-xs text-stone-400 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>
                
                <div className="bg-stone-50/50 p-4.5 rounded-[22px] border border-stone-200/35">
                  <div className="flex items-center gap-2 text-stone-400 mb-2.5">
                    <Calendar size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Week</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-850 tracking-tight font-mono">
                    {stats.week}
                    <span className="text-xs text-stone-400 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>

                <div className="bg-stone-50/50 p-4.5 rounded-[22px] border border-stone-200/35">
                  <div className="flex items-center gap-2 text-stone-400 mb-2.5">
                    <CalendarDays size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Month</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-850 tracking-tight font-mono">
                    {stats.month}
                    <span className="text-xs text-stone-400 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>

                <div className="bg-app-peach/10 p-4.5 rounded-[22px] border border-stone-200/35">
                  <div className="flex items-center gap-2 text-stone-700/80 mb-2.5">
                    <InfinityIcon size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider font-extrabold">Lifetime</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-850 tracking-tight font-mono">
                    {stats.lifetime}
                    <span className="text-xs text-stone-500 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
