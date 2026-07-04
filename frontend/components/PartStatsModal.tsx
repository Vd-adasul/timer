import React, { useMemo } from 'react';
import { X, Clock, Calendar, CalendarDays, Infinity as InfinityIcon, Check } from 'lucide-react';
import { useAppStore } from '../store';
import { calculatePartStats } from '../utils';
import { TrackPart } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PartStatsModalProps {
  part: TrackPart | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PartStatsModal: React.FC<PartStatsModalProps> = ({ part, isOpen, onClose }) => {
  const { state, toggleItemCompleted } = useAppStore();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!part) return null;
    return calculatePartStats(state.blocks, part.id);
  }, [part, state.blocks]);

  const track = useMemo(() => {
    if (!part) return null;
    return state.tracks.find(t => t.parts.some(p => p.id === part.id));
  }, [part, state.tracks]);

  const progressInfo = useMemo(() => {
    if (!part) return null;
    const totalItems = (part.lectures?.length || 0) + (part.assignments?.length || 0);
    if (totalItems === 0) return null;
    
    const completedItems = 
      (part.lectures?.filter(i => i.completed).length || 0) + 
      (part.assignments?.filter(i => i.completed).length || 0);
      
    return {
      completed: completedItems,
      total: totalItems,
      percent: Math.round((completedItems / totalItems) * 100)
    };
  }, [part]);

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
            className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-stone-200/30 shadow-[0_-16px_48px_rgba(41,37,36,0.06)] flex flex-col z-20 max-h-[80vh]"
          >
            {/* Soft top drag indicator bar */}
            <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mt-3 shrink-0" />

            <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-stone-100 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-stone-800 tracking-tight">{part.name}</h3>
                {track && (
                  <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider mt-0.5">
                    {track.name}
                  </p>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-stone-50 text-stone-500 hover:text-stone-800 transition-colors active:scale-95 border border-transparent hover:border-stone-200/20"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable container for stats + checklist */}
            <div className="overflow-y-auto p-6 space-y-6 no-scrollbar flex-1">
              
              {/* Jump to latest log button */}
              {stats.lifetime > 0 && (
                <button
                  onClick={() => {
                    const partBlocks = Object.values(state.blocks).filter(b => b.partId === part.id);
                    if (partBlocks.length > 0) {
                      const sorted = partBlocks.sort((a, b) => b.date.localeCompare(a.date));
                      navigate('/timeline', { state: { jumpToDate: sorted[0].date } });
                      onClose();
                    }
                  }}
                  className="w-full py-3 bg-stone-800 hover:bg-stone-900 text-white dark:bg-stone-100 dark:hover:bg-stone-50 dark:text-stone-800 rounded-[22px] text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Clock size={12} />
                  Jump to Latest Session Logs
                </button>
              )}
              
              {/* Hourly Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50/50 p-4.5 rounded-[22px] border border-stone-200/35">
                  <div className="flex items-center gap-2 text-stone-400 mb-2.5">
                    <Clock size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Today</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-800 tracking-tight font-mono">
                    {stats.today}
                    <span className="text-xs text-stone-400 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>
                
                <div className="bg-stone-50/50 p-4.5 rounded-[22px] border border-stone-200/35">
                  <div className="flex items-center gap-2 text-stone-400 mb-2.5">
                    <Calendar size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Week</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-800 tracking-tight font-mono">
                    {stats.week}
                    <span className="text-xs text-stone-400 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>

                <div className="bg-stone-50/50 p-4.5 rounded-[22px] border border-stone-200/35">
                  <div className="flex items-center gap-2 text-stone-400 mb-2.5">
                    <CalendarDays size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Month</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-800 tracking-tight font-mono">
                    {stats.month}
                    <span className="text-xs text-stone-400 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>

                <div className="bg-app-peach/10 p-4.5 rounded-[22px] border border-stone-200/35">
                  <div className="flex items-center gap-2 text-stone-700/80 mb-2.5">
                    <InfinityIcon size={12} className="shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider font-extrabold">Lifetime</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-800 tracking-tight font-mono">
                    {stats.lifetime}
                    <span className="text-xs text-stone-500 ml-1 font-sans font-medium">h</span>
                  </p>
                </div>
              </div>

              {/* Progress Bar for completions */}
              {progressInfo && (
                <div className="bg-stone-50 p-4 rounded-[22px] border border-stone-200/25">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">Roadmap Progress</span>
                    <span className="text-xs font-bold text-stone-800 font-mono">{progressInfo.percent}% ({progressInfo.completed}/{progressInfo.total})</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-app-peach rounded-full transition-all duration-500" 
                      style={{ width: `${progressInfo.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Checklist Section */}
              {track && (
                <div className="space-y-4 pt-2">
                  {/* Lectures list */}
                  {part.lectures && part.lectures.length > 0 && (
                    <div>
                      <p className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest mb-2.5 ml-1">Lectures Checklist</p>
                      <div className="space-y-2">
                        {part.lectures.map(item => (
                          <button
                            key={item.id}
                            onClick={() => toggleItemCompleted(track.id, part.id, item.id)}
                            className="w-full flex items-center gap-3 p-3 bg-stone-50/30 hover:bg-stone-50 rounded-[18px] border border-stone-200/20 text-left transition-all active:scale-[0.99] group"
                          >
                            <div className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                              item.completed 
                                ? 'bg-app-peach border-app-peach text-stone-800' 
                                : 'border-stone-300 group-hover:border-stone-400'
                            }`}>
                              {item.completed && <Check size={10} strokeWidth={3} />}
                            </div>
                            <span className={`text-xs font-bold transition-all truncate flex-1 ${
                              item.completed 
                                ? 'line-through text-stone-400 font-medium' 
                                : 'text-stone-700 group-hover:text-stone-800'
                            }`}>
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assignments list */}
                  {part.assignments && part.assignments.length > 0 && (
                    <div>
                      <p className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest mb-2.5 mt-4 ml-1">Assignments Checklist</p>
                      <div className="space-y-2">
                        {part.assignments.map(item => (
                          <button
                            key={item.id}
                            onClick={() => toggleItemCompleted(track.id, part.id, item.id)}
                            className="w-full flex items-center gap-3 p-3 bg-stone-50/30 hover:bg-stone-50 rounded-[18px] border border-stone-200/20 text-left transition-all active:scale-[0.99] group"
                          >
                            <div className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                              item.completed 
                                ? 'bg-app-peach border-app-peach text-stone-800' 
                                : 'border-stone-300 group-hover:border-stone-400'
                            }`}>
                              {item.completed && <Check size={10} strokeWidth={3} />}
                            </div>
                            <span className={`text-xs font-bold transition-all truncate flex-1 ${
                              item.completed 
                                ? 'line-through text-stone-400 font-medium' 
                                : 'text-stone-700 group-hover:text-stone-800'
                            }`}>
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
