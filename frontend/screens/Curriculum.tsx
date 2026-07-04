import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { Track, TrackPart, TrackItem } from '../types';
import { Plus, Trash2, Check, BookOpen, Layers, Award, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CurriculumScreen: React.FC = () => {
  const { 
    state, 
    addTrack, 
    deleteTrack, 
    addPartToTrack, 
    deletePartFromTrack, 
    addLectureToPart, 
    deleteLectureFromPart, 
    toggleItemCompleted,
    showToast,
    showConfirm
  } = useAppStore();

  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    return state.tracks[0]?.id || '';
  });

  // Active track object
  const activeTrack = useMemo(() => {
    return state.tracks.find(t => t.id === activeTrackId) || state.tracks[0] || null;
  }, [state.tracks, activeTrackId]);

  // If active track changes or gets deleted
  React.useEffect(() => {
    if (activeTrack && activeTrack.id !== activeTrackId) {
      setActiveTrackId(activeTrack.id);
    }
  }, [activeTrack]);

  // Form states
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');
  const [showAddTrack, setShowAddTrack] = useState(false);

  const [newPartName, setNewPartName] = useState<Record<string, string>>({});
  const [newLectureNo, setNewLectureNo] = useState<Record<string, string>>({});
  const [newLectureName, setNewLectureName] = useState<Record<string, string>>({});

  // Selected lecture for details
  const [selectedLecture, setSelectedLecture] = useState<{ partId: string; lecture: TrackItem } | null>(null);

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackName.trim()) return;

    const track: Track = {
      id: `track_${Date.now()}`,
      name: newTrackName.trim(),
      description: newTrackDesc.trim() || undefined,
      parts: []
    };

    addTrack(track);
    setActiveTrackId(track.id);
    setNewTrackName('');
    setNewTrackDesc('');
    setShowAddTrack(false);
    showToast('Learning track created successfully!', 'success');
  };

  const handleDeleteTrack = (track: Track) => {
    showConfirm(
      'Delete Track',
      `Are you sure you want to delete track "${track.name}"? All progress logs inside this track will be deleted.`,
      () => {
        deleteTrack(track.id);
        if (activeTrackId === track.id) {
          const remaining = state.tracks.filter(t => t.id !== track.id);
          setActiveTrackId(remaining[0]?.id || '');
        }
        showToast('Track deleted successfully', 'success');
      }
    );
  };

  const handleCreatePart = (trackId: string) => {
    const name = newPartName[trackId]?.trim();
    if (!name) return;

    addPartToTrack(trackId, name);
    setNewPartName(prev => ({ ...prev, [trackId]: '' }));
    showToast('New module added!', 'success');
  };

  const handleCreateLecture = (trackId: string, partId: string) => {
    const no = newLectureNo[partId]?.trim() || '';
    const name = newLectureName[partId]?.trim() || '';
    if (!name) {
      showToast('Lecture name is required', 'error');
      return;
    }

    addLectureToPart(trackId, partId, name, no);
    setNewLectureNo(prev => ({ ...prev, [partId]: '' }));
    setNewLectureName(prev => ({ ...prev, [partId]: '' }));
    showToast(`Lecture ${no} added successfully!`, 'success');
  };

  // Compute stats for current track
  const trackStats = useMemo(() => {
    if (!activeTrack) return { total: 0, completed: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    activeTrack.parts.forEach(p => {
      p.lectures?.forEach(l => {
        total++;
        if (l.completed) completed++;
      });
    });
    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [activeTrack]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col h-full bg-[#12110F] text-[#FAFAF9] overflow-y-auto pb-32 no-scrollbar"
    >
      {/* Editorial Header */}
      <div className="px-6 pt-10 pb-4 sticky top-0 bg-[#12110F]/95 backdrop-blur-md z-30 border-b border-stone-800/40 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Curriculum Mapping</h1>
          <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mt-1">Linear-style syllabus progression</p>
        </div>
        <button 
          onClick={() => setShowAddTrack(prev => !prev)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-indigo-600/10"
        >
          <Plus size={10} />
          Add Track
        </button>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-4">
        {/* Track Creation Form */}
        <AnimatePresence>
          {showAddTrack && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateTrack}
              className="bg-[#1C1A18] border border-stone-850 p-5 rounded-2xl space-y-3 overflow-hidden shadow-xl"
            >
              <h3 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest">New Learning Track</h3>
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={newTrackName}
                  onChange={e => setNewTrackName(e.target.value)}
                  placeholder="Track Name (e.g. Data Structures)"
                  className="w-full bg-[#242220] border border-stone-800/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <input 
                  type="text" 
                  value={newTrackDesc}
                  onChange={e => setNewTrackDesc(e.target.value)}
                  placeholder="Short Description (e.g. Master algorithms and arrays)"
                  className="w-full bg-[#242220] border border-stone-800/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button 
                  type="button"
                  onClick={() => setShowAddTrack(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-[10px] font-extrabold uppercase tracking-wider hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-extrabold uppercase tracking-wider transition-colors shadow-md shadow-indigo-600/10"
                >
                  Create
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Track Picker (Tonal horizontal list) */}
        {state.tracks.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-800/20">
            {state.tracks.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTrackId(t.id);
                  setSelectedLecture(null);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 border transition-all ${
                  activeTrackId === t.id 
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-sm' 
                    : 'bg-[#1C1A18] border-stone-800/60 text-stone-400 hover:text-white'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {activeTrack ? (
          <div className="space-y-6">
            {/* Track Overview Card */}
            <div className="bg-[#1C1A18] border border-stone-850 p-6 rounded-3xl relative overflow-hidden group shadow-md">
              <div className="absolute top-0 right-0 w-48 h-48 opacity-5 blur-3xl pointer-events-none bg-indigo-500 rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="flex justify-between items-start z-10 relative">
                <div>
                  <div className="flex items-center gap-2 text-stone-400 font-mono text-[9px] uppercase tracking-widest mb-1.5">
                    <BookOpen size={10} className="text-indigo-400" />
                    <span>Learning Path</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">{activeTrack.name}</h2>
                  {activeTrack.description && (
                    <p className="text-xs text-stone-450 mt-1 font-cursive text-lg lowercase">{activeTrack.description}</p>
                  )}
                </div>

                <button 
                  onClick={() => handleDeleteTrack(activeTrack)}
                  className="p-2.5 rounded-xl bg-stone-800/50 hover:bg-red-500/10 border border-stone-800 text-stone-400 hover:text-red-500 transition-all active:scale-95"
                  title="Delete Track"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2 z-10 relative">
                <div className="flex justify-between text-[10px] font-mono font-bold text-stone-400">
                  <span className="uppercase tracking-wider">Overall Syllabus Progress</span>
                  <span className="text-indigo-400">{trackStats.percent}% ({trackStats.completed}/{trackStats.total} lectures)</span>
                </div>
                <div className="w-full h-1.5 bg-[#242220] border border-stone-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${trackStats.percent}%` }}
                    transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                  />
                </div>
              </div>
            </div>

            {/* Modules (Parts) Grid */}
            <div className="space-y-5">
              {activeTrack.parts.map((part) => {
                const partLectures = part.lectures || [];

                return (
                  <div 
                    key={part.id}
                    className="bg-[#1C1A18] border border-stone-850 p-5 rounded-2xl space-y-5 relative"
                  >
                    {/* Part Header */}
                    <div className="flex justify-between items-center border-b border-stone-800/40 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-900/50 font-mono text-[9px] font-bold">
                          M
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white tracking-tight">{part.name}</h4>
                          <p className="text-[9px] text-stone-450 font-bold uppercase tracking-wider">{partLectures.length} Lectures</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          showConfirm(
                            'Delete Module',
                            `Are you sure you want to delete module "${part.name}"?`,
                            () => {
                              deletePartFromTrack(activeTrack.id, part.id);
                              if (selectedLecture?.partId === part.id) setSelectedLecture(null);
                              showToast('Module deleted', 'success');
                            }
                          );
                        }}
                        className="text-stone-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/5 transition-all"
                        title="Delete Module"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Bubble Grid of Done/Not Done Lectures */}
                    {partLectures.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5">
                          {partLectures.map((lec) => {
                            const isSelected = selectedLecture?.lecture.id === lec.id;
                            return (
                              <button
                                key={lec.id}
                                onClick={() => {
                                  toggleItemCompleted(activeTrack.id, part.id, lec.id);
                                  setSelectedLecture({ partId: part.id, lecture: { ...lec, completed: !lec.completed } });
                                  showToast(
                                    `Lecture ${lec.lectureNumber || ''} marked ${!lec.completed ? 'Done' : 'Not Done'}`,
                                    !lec.completed ? 'success' : 'info'
                                  );
                                }}
                                onMouseEnter={() => setSelectedLecture({ partId: part.id, lecture: lec })}
                                className={`aspect-square flex items-center justify-center rounded-xl text-[10px] font-mono font-bold transition-all relative group select-none active:scale-[0.9] ${
                                  lec.completed
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-[#12110F] hover:text-indigo-400 hover:border-indigo-500 border border-transparent'
                                    : 'bg-[#242220] text-stone-400 hover:border-stone-500 hover:text-white border border-stone-800'
                                } ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1C1A18]' : ''}`}
                              >
                                {lec.lectureNumber || '?'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                        No lectures added to this module yet.
                      </div>
                    )}

                    {/* Quick Adding Lecture inline form */}
                    <div className="pt-2 flex gap-2">
                      <input 
                        type="text" 
                        value={newLectureNo[part.id] || ''}
                        onChange={e => setNewLectureNo(prev => ({ ...prev, [part.id]: e.target.value }))}
                        placeholder="1.1"
                        className="w-16 bg-[#242220] border border-stone-800 rounded-xl px-3 py-2 text-[10px] text-white placeholder-stone-500 focus:outline-none focus:border-indigo-500 font-mono text-center"
                      />
                      <input 
                        type="text" 
                        value={newLectureName[part.id] || ''}
                        onChange={e => setNewLectureName(prev => ({ ...prev, [part.id]: e.target.value }))}
                        placeholder="Lecture Name"
                        className="flex-1 bg-[#242220] border border-stone-800 rounded-xl px-3 py-2 text-[10px] text-white placeholder-stone-500 focus:outline-none focus:border-indigo-500 font-bold"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleCreateLecture(activeTrack.id, part.id);
                        }}
                      />
                      <button
                        onClick={() => handleCreateLecture(activeTrack.id, part.id)}
                        className="p-2 bg-stone-800 hover:bg-indigo-600 hover:text-white text-stone-300 rounded-xl border border-stone-800 transition-colors"
                        title="Add Lecture"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Part/Module Section */}
            <div className="bg-[#1C1A18]/50 border border-dashed border-stone-800/80 p-5 rounded-2xl flex gap-3 items-center">
              <input 
                type="text" 
                value={newPartName[activeTrack.id] || ''}
                onChange={e => setNewPartName(prev => ({ ...prev, [activeTrack.id]: e.target.value }))}
                placeholder="Module Name (e.g. Dynamic Programming)"
                className="flex-1 bg-[#242220] border border-stone-800/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-indigo-500 font-bold"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreatePart(activeTrack.id);
                }}
              />
              <button
                onClick={() => handleCreatePart(activeTrack.id)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-colors active:scale-95 shrink-0 shadow-md shadow-indigo-600/10"
              >
                Add Module
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#1C1A18] border border-stone-850 rounded-3xl p-6">
            <Layers className="text-stone-500/50 mx-auto mb-4 scale-150" strokeWidth={1.5} />
            <h3 className="font-extrabold text-sm text-stone-400 uppercase tracking-widest">No Learning Tracks</h3>
            <p className="text-xs text-stone-500 mt-2">Create your first structured track above to start mapping your syllabus.</p>
          </div>
        )}

        {/* Selected Lecture Details Floating Context Panel */}
        <AnimatePresence>
          {selectedLecture && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-[#242220] border border-stone-800 p-4 rounded-2xl flex items-center justify-between shadow-xl mt-6 border-l-4 border-indigo-500"
            >
              <div className="min-w-0 flex-1 mr-4">
                <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">Selected Syllabus Item</p>
                <h5 className="text-xs font-bold text-white mt-1 truncate">
                  {selectedLecture.lecture.lectureNumber ? `${selectedLecture.lecture.lectureNumber} - ` : ''}
                  {selectedLecture.lecture.name}
                </h5>
                <p className="text-[9px] text-stone-500 mt-0.5 font-bold uppercase tracking-wider">
                  Status: {selectedLecture.lecture.completed ? 'COMPLETED' : 'INCOMPLETE'}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    if (activeTrack) {
                      deleteLectureFromPart(activeTrack.id, selectedLecture.partId, selectedLecture.lecture.id);
                      setSelectedLecture(null);
                      showToast('Lecture deleted', 'success');
                    }
                  }}
                  className="p-2 text-stone-500 hover:text-red-500 rounded-lg hover:bg-red-500/5 transition-all"
                  title="Delete Lecture"
                >
                  <Trash size={12} />
                </button>
                <button 
                  onClick={() => setSelectedLecture(null)}
                  className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 hover:text-white px-2 py-1"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
