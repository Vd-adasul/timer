import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store';
import { Track, TrackPart, TrackItem } from '../types';
import { Plus, Trash2, Check, BookOpen, Layers } from 'lucide-react';
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
    renameLecture,
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
  useEffect(() => {
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

  // Show Incomplete Only toggle
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  // Selected lecture for details
  const [selectedLecture, setSelectedLecture] = useState<{ partId: string; lecture: TrackItem } | null>(null);

  // Inline rename state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');

  // Reset rename state when selection changes
  useEffect(() => {
    if (selectedLecture) {
      setEditingNameValue(selectedLecture.lecture.name);
      setIsEditingName(false);
    }
  }, [selectedLecture?.lecture.id]);

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
        setSelectedLecture(null);
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

  const handleRenameSave = () => {
    if (!editingNameValue.trim() || !activeTrack || !selectedLecture) return;
    renameLecture(activeTrack.id, selectedLecture.partId, selectedLecture.lecture.id, editingNameValue.trim());
    setSelectedLecture(prev => prev ? {
      ...prev,
      lecture: {
        ...prev.lecture,
        name: editingNameValue.trim()
      }
    } : null);
    setIsEditingName(false);
    showToast('Lecture renamed successfully', 'success');
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
      className="flex flex-col h-full bg-app-bg text-stone-800 overflow-y-auto pb-32 no-scrollbar"
    >
      {/* Editorial Header */}
      <div className="px-6 pt-10 pb-4 sticky top-0 bg-app-bg/85 backdrop-blur-md z-30 border-b border-stone-200/20 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-800">Curriculum Mapping</h1>
          <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mt-1">Syllabus progression & tracking</p>
        </div>
        <button 
          onClick={() => setShowAddTrack(prev => !prev)}
          className="bg-indigo-650 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-indigo-600/10"
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
              className="bg-white border border-stone-200/30 p-5 rounded-2xl space-y-3 overflow-hidden shadow-xl"
            >
              <h3 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest">New Learning Track</h3>
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={newTrackName}
                  onChange={e => setNewTrackName(e.target.value)}
                  placeholder="Track Name (e.g. Data Structures)"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-indigo-500"
                  required
                />
                <input 
                  type="text" 
                  value={newTrackDesc}
                  onChange={e => setNewTrackDesc(e.target.value)}
                  placeholder="Short Description (e.g. Master algorithms and arrays)"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button 
                  type="button"
                  onClick={() => setShowAddTrack(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/60 text-stone-605 text-[10px] font-extrabold uppercase tracking-wider transition-colors"
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
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200/20">
            {state.tracks.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTrackId(t.id);
                  setSelectedLecture(null);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shrink-0 border transition-all ${
                  activeTrackId === t.id 
                    ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-550 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'bg-white border-stone-200/30 text-stone-500 hover:text-stone-800 hover:border-stone-300'
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
            <div className="bg-white border border-stone-200/30 p-6 rounded-3xl relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 w-48 h-48 opacity-5 blur-3xl pointer-events-none bg-indigo-500 rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="flex justify-between items-start z-10 relative">
                <div>
                  <div className="flex items-center gap-2 text-stone-400 font-mono text-[9px] uppercase tracking-widest mb-1.5">
                    <BookOpen size={10} className="text-indigo-650 dark:text-indigo-400" />
                    <span>Learning Path</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-stone-850 tracking-tight">{activeTrack.name}</h2>
                  {activeTrack.description && (
                    <p className="text-xs text-stone-500 mt-1 font-cursive text-lg lowercase">{activeTrack.description}</p>
                  )}
                </div>

                <button 
                  onClick={() => handleDeleteTrack(activeTrack)}
                  className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-red-500/10 border border-stone-200/30 text-stone-400 hover:text-red-500 transition-all active:scale-95"
                  title="Delete Track"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-3 z-10 relative">
                <div className="flex justify-between text-[10px] font-mono font-bold text-stone-400">
                  <span className="uppercase tracking-wider">Overall Syllabus Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{trackStats.percent}% ({trackStats.completed}/{trackStats.total} lectures)</span>
                </div>
                <div className="w-full h-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${trackStats.percent}%` }}
                    transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                  />
                </div>

                {/* Incomplete Only Filter Toggle */}
                <div className="flex items-center gap-2 pt-1 select-none">
                  <input
                    type="checkbox"
                    id="show-incomplete-filter"
                    checked={showIncompleteOnly}
                    onChange={(e) => {
                      setShowIncompleteOnly(e.target.checked);
                      setSelectedLecture(null); // Clear selected lecture on filter change to avoid stale state
                    }}
                    className="w-3.5 h-3.5 rounded border-stone-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="show-incomplete-filter" className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider cursor-pointer">
                    Show Incomplete Only
                  </label>
                </div>
              </div>
            </div>

            {/* Modules (Parts) Grid */}
            <div className="space-y-5">
              {activeTrack.parts.map((part) => {
                const partLectures = part.lectures || [];
                const visibleLectures = showIncompleteOnly 
                  ? partLectures.filter(l => !l.completed) 
                  : partLectures;

                return (
                  <div 
                    key={part.id}
                    className="bg-white border border-stone-200/30 p-5 rounded-2xl space-y-5 relative"
                  >
                    {/* Part Header */}
                    <div className="flex justify-between items-center border-b border-stone-200/20 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 font-mono text-[9px] font-bold">
                          M
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-stone-850 tracking-tight">{part.name}</h4>
                          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{partLectures.length} Lectures</p>
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
                        className="text-stone-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/5 transition-all"
                        title="Delete Module"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Bubble Grid of Done/Not Done Lectures */}
                    {visibleLectures.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2.5">
                          {visibleLectures.map((lec) => {
                            const isSelected = selectedLecture?.lecture.id === lec.id;
                            return (
                              <button
                                key={lec.id}
                                onClick={() => {
                                  setSelectedLecture({ partId: part.id, lecture: lec });
                                }}
                                className={`aspect-square flex items-center justify-center rounded-xl text-[10px] font-mono font-bold transition-all relative group select-none active:scale-[0.9] ${
                                  lec.completed
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700'
                                    : 'bg-stone-50 dark:bg-stone-800 text-stone-500 hover:border-stone-400 border border-stone-200 dark:border-stone-700'
                                } ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-stone-900' : ''}`}
                              >
                                {lec.lectureNumber || '?'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                        {showIncompleteOnly ? 'No incomplete items left!' : 'No lectures added to this module yet.'}
                      </div>
                    )}

                    {/* Quick Adding Lecture inline form */}
                    <div className="pt-2 flex gap-2">
                      <input 
                        type="text" 
                        value={newLectureNo[part.id] || ''}
                        onChange={e => setNewLectureNo(prev => ({ ...prev, [part.id]: e.target.value }))}
                        placeholder="1.1"
                        className="w-16 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-[10px] text-stone-850 placeholder-stone-400 focus:outline-none focus:border-indigo-500 font-mono text-center"
                      />
                      <input 
                        type="text" 
                        value={newLectureName[part.id] || ''}
                        onChange={e => setNewLectureName(prev => ({ ...prev, [part.id]: e.target.value }))}
                        placeholder="Lecture Name"
                        className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-[10px] text-stone-850 placeholder-stone-400 focus:outline-none focus:border-indigo-500 font-bold"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleCreateLecture(activeTrack.id, part.id);
                        }}
                      />
                      <button
                        onClick={() => handleCreateLecture(activeTrack.id, part.id)}
                        className="p-2 bg-stone-50 dark:bg-stone-800 hover:bg-indigo-650 hover:text-white border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl transition-colors"
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
            <div className="bg-white/50 border border-dashed border-stone-300 dark:border-stone-700 p-5 rounded-2xl flex gap-3 items-center">
              <input 
                type="text" 
                value={newPartName[activeTrack.id] || ''}
                onChange={e => setNewPartName(prev => ({ ...prev, [activeTrack.id]: e.target.value }))}
                placeholder="Module Name (e.g. Dynamic Programming)"
                className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-850 placeholder-stone-400 focus:outline-none focus:border-indigo-500 font-bold"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreatePart(activeTrack.id);
                }}
              />
              <button
                onClick={() => handleCreatePart(activeTrack.id)}
                className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-colors active:scale-95 shrink-0 shadow-md shadow-indigo-600/10"
              >
                Add Module
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-stone-200/30 rounded-3xl p-6">
            <Layers className="text-stone-400/50 mx-auto mb-4 scale-150" strokeWidth={1.5} />
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
              className="bg-white border border-stone-200/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl mt-6 border-l-4 border-indigo-500"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">Selected Syllabus Item</p>
                {isEditingName ? (
                  <div className="flex gap-2 w-full max-w-sm mt-1">
                    <input 
                      type="text"
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-850 focus:outline-none focus:border-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSave();
                      }}
                      autoFocus
                    />
                    <button 
                      onClick={handleRenameSave}
                      className="px-3 py-1.5 bg-indigo-650 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 text-stone-600 rounded-xl text-[10px] font-extrabold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 mt-1">
                    <h5 className="text-xs font-bold text-stone-800 truncate max-w-[200px]">
                      {selectedLecture.lecture.lectureNumber ? `${selectedLecture.lecture.lectureNumber} - ` : ''}
                      {selectedLecture.lecture.name}
                    </h5>
                    <button
                      onClick={() => {
                        setEditingNameValue(selectedLecture.lecture.name);
                        setIsEditingName(true);
                      }}
                      className="text-[9px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider hover:underline"
                    >
                      Rename
                    </button>
                  </div>
                )}
                <p className="text-[9px] text-stone-400 mt-1.5 font-extrabold uppercase tracking-wider">
                  Status: <span className={selectedLecture.lecture.completed ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-stone-550'}>
                    {selectedLecture.lecture.completed ? 'COMPLETED' : 'INCOMPLETE'}
                  </span>
                </p>
              </div>

              <div className="flex gap-2 items-center justify-end">
                <button
                  onClick={() => {
                    if (activeTrack) {
                      toggleItemCompleted(activeTrack.id, selectedLecture.partId, selectedLecture.lecture.id);
                      setSelectedLecture(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          lecture: {
                            ...prev.lecture,
                            completed: !prev.lecture.completed
                          }
                        };
                      });
                      showToast(
                        `Lecture marked ${!selectedLecture.lecture.completed ? 'Completed' : 'Incomplete'}`,
                        !selectedLecture.lecture.completed ? 'success' : 'info'
                      );
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all active:scale-95 border ${
                    selectedLecture.lecture.completed
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                  }`}
                >
                  {selectedLecture.lecture.completed ? 'Undo Done' : 'Mark Done'}
                </button>
                <button
                  onClick={() => {
                    if (activeTrack) {
                      showConfirm(
                        'Delete Lecture',
                        `Are you sure you want to delete lecture "${selectedLecture.lecture.name}"?`,
                        () => {
                          deleteLectureFromPart(activeTrack.id, selectedLecture.partId, selectedLecture.lecture.id);
                          setSelectedLecture(null);
                          showToast('Lecture deleted', 'success');
                        }
                      );
                    }
                  }}
                  className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-500/5 border border-stone-200/30 transition-all"
                  title="Delete Lecture"
                >
                  <Trash2 size={12} />
                </button>
                <button 
                  onClick={() => setSelectedLecture(null)}
                  className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 hover:text-stone-700 px-2 py-1"
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
