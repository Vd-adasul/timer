import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, ArrowLeft, CheckCircle2, Check } from 'lucide-react';
import { useAppStore } from '../store';
import { Activity, Track, TrackPart, TrackItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  blockIndex: number;
}

type Step = 'ACTIVITY' | 'TRACK' | 'PART' | 'ITEM';

export const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, date, blockIndex }) => {
  const { state, saveBlock } = useAppStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('ACTIVITY');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedPart, setSelectedPart] = useState<TrackPart | null>(null);
  
  // Track animation direction: 1 for forward, -1 for backward
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Retrieve last study block info for quick log shortcut
  const lastStudyInfo = useMemo(() => {
    const studyBlocks = Object.values(state.blocks).filter(b => b.activityId === 'act_study' && b.trackId);
    if (studyBlocks.length === 0) return null;
    
    // Sort blocks by date desc, then index desc
    const sorted = studyBlocks.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.index - a.index;
    });
    
    const lastBlock = sorted[0];
    const track = state.tracks.find(t => t.id === lastBlock.trackId);
    if (!track) return null;
    const part = track.parts.find(p => p.id === lastBlock.partId);
    if (!part) return null;
    let itemName = '';
    if (lastBlock.itemId) {
      const item = [...(part.lectures || []), ...(part.assignments || [])].find(i => i.id === lastBlock.itemId);
      if (item) itemName = item.name;
    }
    
    return {
      track,
      part,
      itemName,
      block: lastBlock
    };
  }, [state.blocks, state.tracks]);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 sm:p-4">
      {/* Tap outside to close */}
      <div className="absolute inset-0 z-10" onClick={onClose} />

      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-stone-200/30 shadow-[0_-16px_48px_rgba(41,37,36,0.06)] flex flex-col max-h-[85vh] z-20 relative text-stone-800"
      >
        {/* Dynamic Island style top drag handle */}
        <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
        
        {/* Header and selection breadcrumbs */}
        <div className="px-6 pt-3 pb-4 border-b border-stone-100 shrink-0 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== 'ACTIVITY' && (
                <button 
                  onClick={goBack}
                  className="p-2 -ml-2 rounded-full hover:bg-stone-50 text-stone-500 hover:text-stone-800 transition-colors active:scale-95 border border-transparent hover:border-stone-200/20"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <h3 className="text-sm font-extrabold text-stone-800 tracking-tight">
                {step === 'ACTIVITY' ? 'Select Activity' : 
                 step === 'TRACK' ? 'Select Track' : 
                 step === 'PART' ? 'Select Part' : 'Select Detail'}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 rounded-full hover:bg-stone-50 text-stone-500 hover:text-stone-800 transition-colors active:scale-95 border border-transparent hover:border-stone-200/20"
            >
              <X size={14} />
            </button>
          </div>

          {/* Breadcrumbs for tracking selections */}
          {selectedActivity && (
            <p className="text-[8px] text-stone-400 font-extrabold uppercase tracking-widest mt-2 truncate">
              {getBreadcrumbs()}
            </p>
          )}
        </div>

        {/* Content with smooth horizontal transitions */}
        <div className="overflow-y-auto overflow-x-hidden p-5 no-scrollbar flex-1 relative min-h-[300px]">
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
                      className="flex items-center justify-between p-4.5 rounded-[22px] bg-stone-50/50 hover:bg-stone-50 border border-stone-200/30 transition-all text-left group active:scale-[0.97]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: activity.color }} />
                        <span className="font-extrabold text-xs text-stone-600 group-hover:text-stone-800 transition-colors truncate">{activity.name}</span>
                      </div>
                      {activity.requiresTrack && (
                        <ChevronRight size={12} className="text-stone-300 group-hover:text-stone-500 shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                  
                  {lastStudyInfo && (
                    <button
                      onClick={() => {
                        saveBlock(
                          date, 
                          blockIndex, 
                          'act_study', 
                          lastStudyInfo.block.trackId, 
                          lastStudyInfo.block.partId, 
                          lastStudyInfo.block.itemId
                        );
                        onClose();
                      }}
                      className="col-span-2 py-3 px-4 rounded-[22px] bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-900/30 transition-all text-left flex flex-col justify-center active:scale-[0.98] group mt-1"
                    >
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-indigo-400 dark:text-indigo-500">Quick Log Last Study Session</span>
                      <span className="font-extrabold text-[11px] text-indigo-950 dark:text-indigo-100 truncate mt-1">
                        {lastStudyInfo.track.name} &rarr; {lastStudyInfo.part.name} {lastStudyInfo.itemName ? `(${lastStudyInfo.itemName})` : ''}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={handleClear}
                    className="col-span-2 mt-2 py-4 rounded-[22px] bg-red-500/5 hover:bg-red-500/10 text-red-500 font-extrabold text-xs uppercase tracking-wider transition-colors border border-red-200/20 active:scale-[0.98]"
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
                      className="flex items-center justify-between p-4.5 rounded-[22px] bg-stone-50/50 hover:bg-stone-50 border border-stone-200/30 transition-all text-left group active:scale-[0.98]"
                    >
                      <span className="font-extrabold text-xs text-stone-600 group-hover:text-stone-800 truncate">{track.name}</span>
                      <ChevronRight size={12} className="text-stone-300 group-hover:text-stone-500" />
                    </button>
                  ))}
                  {state.tracks.length === 0 && (
                    <div className="py-8 text-center text-stone-400 text-xs font-medium flex flex-col items-center gap-3">
                      <p>No tracks found. Set up your learning paths in the Curriculum tab.</p>
                      <button
                        onClick={() => {
                          onClose();
                          navigate('/curriculum');
                        }}
                        className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider"
                      >
                        Go to Curriculum
                      </button>
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
                      className="flex items-center justify-between p-4.5 rounded-[22px] bg-stone-50/50 hover:bg-stone-50 border border-stone-200/30 transition-all text-left group active:scale-[0.98]"
                    >
                      <span className="font-extrabold text-xs text-stone-600 group-hover:text-stone-800 truncate">{part.name}</span>
                      {((part.lectures && part.lectures.length > 0) || (part.assignments && part.assignments.length > 0)) && (
                        <ChevronRight size={12} className="text-stone-300 group-hover:text-stone-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 'ITEM' && selectedPart && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleItemSelect()}
                    className="flex items-center justify-center gap-2 p-4 rounded-[22px] bg-stone-800 hover:bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-800 font-extrabold text-xs uppercase tracking-wider transition-all mb-3 active:scale-[0.98] shadow-sm"
                  >
                    <CheckCircle2 size={14} />
                    Track "{selectedPart.name}" Only
                  </button>

                  {selectedPart.lectures && selectedPart.lectures.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider mb-3 ml-2">Lectures</p>
                      {selectedPart.lectures.map(lec => (
                        <button
                          key={lec.id}
                          onClick={() => handleItemSelect(lec)}
                          className="w-full flex items-center justify-between p-4.5 rounded-[22px] bg-stone-50/50 hover:bg-stone-50 border border-stone-200/30 transition-all text-left mb-2.5 active:scale-[0.98] group"
                        >
                          <span className={`font-extrabold text-xs truncate flex-1 ${lec.completed ? 'line-through text-stone-400' : 'text-stone-600 group-hover:text-stone-800'}`}>{lec.name}</span>
                          {lec.completed && <Check size={14} className="text-app-peach ml-2 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedPart.assignments && selectedPart.assignments.length > 0 && (
                    <div>
                      <p className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider mb-3 ml-2">Assignments</p>
                      {selectedPart.assignments.map(ass => (
                        <button
                          key={ass.id}
                          onClick={() => handleItemSelect(ass)}
                          className="w-full flex items-center justify-between p-4.5 rounded-[22px] bg-stone-50/50 hover:bg-stone-50 border border-stone-200/30 transition-all text-left mb-2.5 active:scale-[0.98] group"
                        >
                          <span className={`font-extrabold text-xs truncate flex-1 ${ass.completed ? 'line-through text-stone-400' : 'text-stone-600 group-hover:text-stone-800'}`}>{ass.name}</span>
                          {ass.completed && <Check size={14} className="text-app-peach ml-2 shrink-0" />}
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
