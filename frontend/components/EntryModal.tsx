import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';
import { Activity, Track, TrackPart, TrackItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  blockIndex: number;
}

type Step = 'ACTIVITY' | 'TRACK' | 'PART' | 'ITEM';

export const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, date, blockIndex }) => {
  const { state, saveBlock } = useAppStore();
  const [step, setStep] = useState<Step>('ACTIVITY');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedPart, setSelectedPart] = useState<TrackPart | null>(null);
  
  // Track animation direction: 1 for forward, -1 for backward
  const [slideDirection, setSlideDirection] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setStep('ACTIVITY');
      setSelectedActivity(null);
      setSelectedTrack(null);
      setSelectedPart(null);
      setSlideDirection(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigateToStep = (nextStep: Step, direction: number = 1) => {
    setSlideDirection(direction);
    setStep(nextStep);
  };

  const handleActivitySelect = (activity: Activity) => {
    if (activity.requiresTrack) {
      setSelectedActivity(activity);
      navigateToStep('TRACK', 1);
    } else {
      saveBlock(date, blockIndex, activity.id);
      onClose();
    }
  };

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
    navigateToStep('PART', 1);
  };

  const handlePartSelect = (part: TrackPart) => {
    setSelectedPart(part);
    const hasItems = (part.lectures && part.lectures.length > 0) || (part.assignments && part.assignments.length > 0);
    
    if (hasItems) {
      navigateToStep('ITEM', 1);
    } else {
      if (selectedActivity && selectedTrack) {
        saveBlock(date, blockIndex, selectedActivity.id, selectedTrack.id, part.id);
        onClose();
      }
    }
  };

  const handleItemSelect = (item?: TrackItem) => {
    if (selectedActivity && selectedTrack && selectedPart) {
      saveBlock(date, blockIndex, selectedActivity.id, selectedTrack.id, selectedPart.id, item?.id);
      onClose();
    }
  };

  const handleClear = () => {
    saveBlock(date, blockIndex, 'clear');
    onClose();
  };

  const goBack = () => {
    if (step === 'ITEM') navigateToStep('PART', -1);
    else if (step === 'PART') navigateToStep('TRACK', -1);
    else if (step === 'TRACK') navigateToStep('ACTIVITY', -1);
  };

  // Breadcrumb tracker helper
  const getBreadcrumbs = () => {
    const crumbs = ['Start'];
    if (selectedActivity) crumbs.push(selectedActivity.name);
    if (selectedTrack) crumbs.push(selectedTrack.name);
    if (selectedPart) crumbs.push(selectedPart.name);
    return crumbs.join(' → ');
  };

  // Dynamic variants for horizontal slide animations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      {/* Tap outside to close */}
      <div className="absolute inset-0 z-10" onClick={onClose} />

      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="bg-zinc-950 w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-white/5 shadow-[0_-16px_48px_rgba(0,0,0,0.6)] flex flex-col max-h-[85vh] z-20 relative"
      >
        {/* Dynamic Island style top drag handle */}
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-3 mb-1 shrink-0" />
        
        {/* Header and selection breadcrumbs */}
        <div className="px-6 pt-3 pb-4 border-b border-white/5 shrink-0 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== 'ACTIVITY' && (
                <button 
                  onClick={goBack}
                  className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors active:scale-95 border border-transparent hover:border-white/5"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {step === 'ACTIVITY' ? 'Select Activity' : 
                 step === 'TRACK' ? 'Select Track' : 
                 step === 'PART' ? 'Select Part' : 'Select Detail'}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors active:scale-95 border border-transparent hover:border-white/5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Breadcrumbs for tracking selections */}
          {selectedActivity && (
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-2.5 truncate">
              {getBreadcrumbs()}
            </p>
          )}
        </div>

        {/* Content with smooth horizontal transitions */}
        <div className="overflow-y-auto p-5 no-scrollbar flex-1 relative min-h-[300px]">
          <AnimatePresence initial={false} custom={slideDirection} mode="wait">
            <motion.div
              key={step}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', damping: 20, stiffness: 180 }}
              className="w-full"
            >
              {step === 'ACTIVITY' && (
                <div className="grid grid-cols-2 gap-3">
                  {state.activities.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivitySelect(activity)}
                      className="flex items-center justify-between p-4.5 rounded-[22px] bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 transition-all text-left group active:scale-[0.97]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: activity.color }} />
                        <span className="font-bold text-xs text-white/80 group-hover:text-white transition-colors truncate">{activity.name}</span>
                      </div>
                      {activity.requiresTrack && (
                        <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={handleClear}
                    className="col-span-2 mt-4 py-4 rounded-[22px] bg-red-950/20 hover:bg-red-950/40 text-red-400 font-bold text-xs uppercase tracking-wider transition-colors border border-red-500/10 active:scale-[0.98]"
                  >
                    Clear Block
                  </button>
                </div>
              )}

              {step === 'TRACK' && (
                <div className="flex flex-col gap-2.5">
                  {state.tracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => handleTrackSelect(track)}
                      className="flex items-center justify-between p-4.5 rounded-[22px] bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 transition-all text-left group active:scale-[0.98]"
                    >
                      <span className="font-bold text-xs text-white/85 group-hover:text-white truncate">{track.name}</span>
                      <ChevronRight size={14} className="text-white/20 group-hover:text-white/50" />
                    </button>
                  ))}
                  {state.tracks.length === 0 && (
                    <div className="py-12 text-center text-white/30 text-xs font-bold uppercase tracking-widest">
                      No tracks found. Add them in Settings.
                    </div>
                  )}
                </div>
              )}

              {step === 'PART' && selectedTrack && (
                <div className="flex flex-col gap-2.5">
                  {selectedTrack.parts.map(part => (
                    <button
                      key={part.id}
                      onClick={() => handlePartSelect(part)}
                      className="flex items-center justify-between p-4.5 rounded-[22px] bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 transition-all text-left group active:scale-[0.98]"
                    >
                      <span className="font-bold text-xs text-white/85 group-hover:text-white truncate">{part.name}</span>
                      {((part.lectures && part.lectures.length > 0) || (part.assignments && part.assignments.length > 0)) && (
                        <ChevronRight size={14} className="text-white/20 group-hover:text-white/50" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 'ITEM' && selectedPart && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleItemSelect()}
                    className="flex items-center justify-center gap-2 p-4 rounded-[22px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all mb-3 active:scale-[0.98]"
                  >
                    <CheckCircle2 size={16} />
                    Track "{selectedPart.name}" Only
                  </button>

                  {selectedPart.lectures && selectedPart.lectures.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 ml-2">Lectures</p>
                      {selectedPart.lectures.map(lec => (
                        <button
                          key={lec.id}
                          onClick={() => handleItemSelect(lec)}
                          className="w-full flex items-center p-4.5 rounded-[22px] bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 transition-all text-left mb-2.5 active:scale-[0.98]"
                        >
                          <span className="font-bold text-xs text-white/80 truncate">{lec.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedPart.assignments && selectedPart.assignments.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 ml-2">Assignments</p>
                      {selectedPart.assignments.map(ass => (
                        <button
                          key={ass.id}
                          onClick={() => handleItemSelect(ass)}
                          className="w-full flex items-center p-4.5 rounded-[22px] bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 transition-all text-left mb-2.5 active:scale-[0.98]"
                        >
                          <span className="font-bold text-xs text-white/80 truncate">{ass.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
