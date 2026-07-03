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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          {/* Tap outside backdrop */}
          <div className="absolute inset-0 z-10" onClick={onClose} />

          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="bg-zinc-950 w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-white/5 shadow-[0_-16px_48px_rgba(0,0,0,0.6)] flex flex-col z-20"
          >
            {/* Soft top drag indicator bar */}
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-3 shrink-0" />

            <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-white/5">
              <h3 className="text-lg font-extrabold text-white tracking-tight">{part.name}</h3>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors active:scale-95 border border-transparent hover:border-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.01] p-4.5 rounded-[22px] border border-white/5">
                  <div className="flex items-center gap-2 text-white/30 mb-2.5">
                    <Clock size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Today</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white tracking-tight font-mono">
                    {stats.today}
                    <span className="text-xs text-white/40 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>
                
                <div className="bg-white/[0.01] p-4.5 rounded-[22px] border border-white/5">
                  <div className="flex items-center gap-2 text-white/30 mb-2.5">
                    <Calendar size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Week</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white tracking-tight font-mono">
                    {stats.week}
                    <span className="text-xs text-white/40 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>

                <div className="bg-white/[0.01] p-4.5 rounded-[22px] border border-white/5">
                  <div className="flex items-center gap-2 text-white/30 mb-2.5">
                    <CalendarDays size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Month</span>
                  </div>
                  <p className="text-2xl font-extrabold text-white tracking-tight font-mono">
                    {stats.month}
                    <span className="text-xs text-white/40 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>

                <div className="bg-indigo-500/5 p-4.5 rounded-[22px] border border-indigo-500/10">
                  <div className="flex items-center gap-2 text-indigo-400/80 mb-2.5">
                    <InfinityIcon size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Lifetime</span>
                  </div>
                  <p className="text-2xl font-extrabold text-indigo-200 tracking-tight font-mono">
                    {stats.lifetime}
                    <span className="text-xs text-indigo-400/60 ml-1 font-sans font-medium">h</span>
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
