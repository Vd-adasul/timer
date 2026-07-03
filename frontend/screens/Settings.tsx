import React, { useState, useRef } from 'react';
import { Trash2, Database, Info, ChevronRight, Plus, Download, Upload, AlertTriangle, FileJson, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store';
import { Track } from '../types';
import { motion } from 'framer-motion';

export const SettingsScreen: React.FC = () => {
  const { state, clearData, addTrack, deleteTrack, importData, showToast, showConfirm } = useAppStore();
  const [view, setView] = useState<'main' | 'tracks' | 'paste_json' | 'preview_json'>('main');
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [previewTrack, setPreviewTrack] = useState<Track | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(state);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `TimeOS-Backup-${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showToast('Data exported successfully!', 'success');
    } catch (e) {
      showToast('Export failed.', 'error');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importData(content)) {
        showToast('Data imported successfully!', 'success');
      } else {
        showToast('Failed to import data. Invalid format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleEraseData = () => {
    if (deleteInput === 'DELETE') {
      clearData();
      setShowDangerZone(false);
      setDeleteInput('');
      showToast('All data has been erased.', 'success');
    }
  };

  const handlePreviewJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.name) throw new Error("Track must have a 'name' field.");
      
      const newTrack: Track = {
        id: `track_${Date.now()}`,
        name: parsed.name,
        description: parsed.description,
        parts: (parsed.parts || []).map((p: any, i: number) => ({
          id: `part_${Date.now()}_${i}`,
          name: p.name || `Part ${i+1}`,
          lectures: (p.lectures || []).map((l: string, j: number) => ({
            id: `lec_${Date.now()}_${i}_${j}`,
            name: l,
            type: 'lecture'
          })),
          assignments: (p.assignments || []).map((a: string, j: number) => ({
            id: `ass_${Date.now()}_${i}_${j}`,
            name: a,
            type: 'assignment'
          }))
        }))
      };
      
      setPreviewTrack(newTrack);
      setView('preview_json');
      setJsonError('');
    } catch (e: any) {
      setJsonError(e.message || "Invalid JSON format");
      showToast('JSON validation failed', 'error');
    }
  };

  const handleSaveTrack = () => {
    if (previewTrack) {
      addTrack(previewTrack);
      setJsonInput('');
      setPreviewTrack(null);
      setView('tracks');
      showToast('Learning track added!', 'success');
    }
  };

  if (view === 'preview_json' && previewTrack) {
    const totalLectures = previewTrack.parts.reduce((acc, p) => acc + (p.lectures?.length || 0), 0);
    const totalAssignments = previewTrack.parts.reduce((acc, p) => acc + (p.assignments?.length || 0), 0);

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-col h-full bg-[#FDFCF8] overflow-y-auto pb-32 no-scrollbar"
      >
        <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#FDFCF8]/85 backdrop-blur-md z-10 flex items-center gap-3 border-b border-stone-200/20">
          <button onClick={() => setView('paste_json')} className="p-2.5 -ml-2 rounded-full hover:bg-stone-50 text-stone-500 hover:text-stone-850 transition-all active:scale-95 border border-transparent hover:border-stone-200/20">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">Preview Track</h1>
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">Confirm imported items</p>
          </div>
        </div>

        <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-6">
          <div className="bg-white p-6 rounded-[36px] border border-stone-200/30 text-center relative overflow-hidden shadow-[0_4px_20px_-2px_rgba(41,37,36,0.02)]">
            <div className="w-16 h-16 bg-app-sage rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200/20">
              <CheckCircle2 size={24} className="text-stone-600" />
            </div>
            <h2 className="text-xl font-extrabold text-stone-800 mb-1.5 tracking-tight">{previewTrack.name}</h2>
            {previewTrack.description && <p className="text-stone-400 text-xs mb-6 font-medium font-cursive text-lg">{previewTrack.description}</p>}
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-stone-50/50 p-4 rounded-[22px] border border-stone-200/35">
                <p className="text-xl font-extrabold text-stone-800 font-mono">{previewTrack.parts.length}</p>
                <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mt-1">Parts</p>
              </div>
              <div className="bg-stone-50/50 p-4 rounded-[22px] border border-stone-200/35">
                <p className="text-xl font-extrabold text-stone-800 font-mono">{totalLectures}</p>
                <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mt-1">Lectures</p>
              </div>
              <div className="bg-stone-50/50 p-4 rounded-[22px] border border-stone-200/35">
                <p className="text-xl font-extrabold text-stone-800 font-mono">{totalAssignments}</p>
                <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mt-1">Tasks</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveTrack}
            className="w-full py-4 bg-stone-800 hover:bg-stone-900 text-white rounded-[22px] font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-stone-800/10"
          >
            Import Track
          </button>
        </div>
      </motion.div>
    );
  }

  if (view === 'paste_json') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-col h-full bg-[#FDFCF8] overflow-y-auto pb-32 no-scrollbar"
      >
        <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#FDFCF8]/85 backdrop-blur-md z-10 flex items-center gap-3 border-b border-stone-200/20">
          <button onClick={() => setView('tracks')} className="p-2.5 -ml-2 rounded-full hover:bg-stone-50 text-stone-500 hover:text-stone-850 transition-all active:scale-95 border border-transparent hover:border-stone-200/20">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">Paste JSON</h1>
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">Input structured JSON roadmap</p>
          </div>
        </div>

        <div className="px-6 space-y-4 max-w-2xl mx-auto w-full mt-6 flex-1 flex flex-col">
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{\n  "name": "DSA Roadmap",\n  "description": "Arrays and dynamic programming",\n  "parts": [\n    {\n      "name": "Arrays",\n      "lectures": ["Intro to Arrays"],\n      "assignments": ["Array practice"]\n    }\n  ]\n}`}
            className="flex-1 w-full bg-white border border-stone-200/40 rounded-[22px] p-4 text-xs text-stone-800 font-mono focus:outline-none focus:border-stone-400/50 resize-none min-h-[260px] shadow-sm leading-relaxed"
          />
          
          {jsonError && (
            <div className="p-4 bg-red-50/5 border border-red-200/40 rounded-[22px] text-red-600 text-xs font-bold uppercase tracking-wider leading-relaxed">
              {jsonError}
            </div>
          )}

          <button 
            onClick={handlePreviewJSON}
            disabled={!jsonInput.trim()}
            className="w-full py-4 bg-stone-800 hover:bg-stone-900 text-white rounded-[22px] font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-30"
          >
            Verify Preview
          </button>
        </div>
      </motion.div>
    );
  }

  if (view === 'tracks') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-col h-full bg-[#FDFCF8] overflow-y-auto pb-32 no-scrollbar"
      >
        <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#FDFCF8]/85 backdrop-blur-md z-10 flex items-center gap-3 border-b border-stone-200/20">
          <button onClick={() => setView('main')} className="p-2.5 -ml-2 rounded-full hover:bg-stone-50 text-stone-500 hover:text-stone-855 transition-all active:scale-95 border border-transparent hover:border-stone-200/20">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">Learning Tracks</h1>
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">Configure study curriculum</p>
          </div>
        </div>

        <div className="px-6 space-y-5 max-w-2xl mx-auto w-full mt-6">
          <button 
            onClick={() => setView('paste_json')}
            className="w-full bg-app-peach hover:bg-opacity-90 border border-stone-200/35 p-4 rounded-[22px] flex items-center justify-center gap-2 text-stone-800 text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-[0.98]"
          >
            <Plus size={12} /> Add Track via JSON
          </button>

          <div className="space-y-3">
            {state.tracks.map(track => (
              <div key={track.id} className="bg-white rounded-[26px] border border-stone-200/30 p-5 flex justify-between items-center group hover:border-stone-200/50 transition-colors shadow-sm">
                <div>
                  <h3 className="font-extrabold text-stone-800 text-sm tracking-tight">{track.name}</h3>
                  <p className="text-stone-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">{track.parts.length} Parts</p>
                </div>
                <button 
                  onClick={() => {
                    showConfirm(
                      'Delete Track', 
                      `Are you sure you want to delete track "${track.name}"? This action cannot be undone.`,
                      () => {
                        deleteTrack(track.id);
                        showToast('Track deleted successfully', 'success');
                      }
                    );
                  }} 
                  className="p-3 bg-stone-50 rounded-[14px] text-stone-400 hover:text-red-500 hover:bg-red-500/5 transition-all active:scale-95 border border-transparent hover:border-stone-200/30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {state.tracks.length === 0 && (
              <div className="text-center py-16 text-stone-400/40 text-[10px] font-extrabold uppercase tracking-widest">
                No tracks added yet.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col h-full bg-[#FDFCF8] overflow-y-auto pb-32 no-scrollbar"
    >
      <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#FDFCF8]/85 backdrop-blur-md z-10 border-b border-transparent">
        <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight">Settings</h1>
        <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">Configure app and local data</p>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-2">
        
        <section>
          <h2 className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest mb-3 ml-4">Customization</h2>
          <div className="bg-white rounded-[32px] border border-stone-200/30 overflow-hidden shadow-sm">
            <button 
              onClick={() => setView('tracks')}
              className="w-full p-5 flex items-center justify-between hover:bg-stone-50/50 transition-colors text-left group active:bg-stone-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-app-sage rounded-2xl text-stone-700">
                  <FileJson size={16} />
                </div>
                <div>
                  <p className="text-stone-800 font-extrabold text-xs">Learning Tracks</p>
                  <p className="text-stone-400 text-[10px] font-medium mt-0.5">Manage JSON roadmaps</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest mb-3 ml-4">Data Management</h2>
          <div className="bg-white rounded-[32px] border border-stone-200/30 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-stone-100 flex items-center gap-4">
              <div className="p-3 bg-app-lavender rounded-2xl text-stone-700">
                <Database size={16} />
              </div>
              <div>
                <p className="text-stone-800 font-extrabold text-xs">Local Storage</p>
                <p className="text-stone-400 text-[10px] font-medium mt-0.5">All data remains completely offline.</p>
              </div>
            </div>
            
            <button onClick={handleExport} className="w-full p-5 border-b border-stone-100 flex items-center justify-between hover:bg-stone-50/50 transition-colors text-left active:bg-stone-50">
              <span className="text-stone-500 font-extrabold text-[10px] uppercase tracking-wider">Export App Data</span>
              <Download size={14} className="text-stone-400" />
            </button>
            
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-5 border-b border-stone-100 flex items-center justify-between hover:bg-stone-50/50 transition-colors text-left active:bg-stone-50">
              <span className="text-stone-500 font-extrabold text-[10px] uppercase tracking-wider">Import App Data</span>
              <Upload size={14} className="text-stone-400" />
            </button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />

            <div className="p-5">
              {!showDangerZone ? (
                <button 
                  onClick={() => setShowDangerZone(true)}
                  className="w-full py-3.5 rounded-[22px] border border-red-200 hover:border-red-300 text-red-500 text-[10px] font-extrabold uppercase tracking-wider hover:bg-red-500/5 transition-all active:scale-[0.98]"
                >
                  Danger Zone
                </button>
              ) : (
                <div className="bg-red-500/5 border border-red-200/40 rounded-[24px] p-5 animate-scale-in">
                  <div className="flex items-start gap-3.5 mb-5">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs text-stone-500 space-y-1">
                      <p className="font-extrabold text-red-500 text-xs uppercase tracking-wider">Erase Device Database</p>
                      <p className="font-medium leading-relaxed mt-0.5">This will delete all tracked days, streak histories, study track logs, and local configurations. This action is absolute.</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest mb-2.5">
                    Type <span className="text-red-500 font-mono">DELETE</span> below to execute:
                  </p>
                  <input 
                    type="text" 
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-white border border-stone-200/50 rounded-xl px-4 py-3 text-stone-850 text-xs font-mono font-bold focus:outline-none focus:border-red-400 mb-4 shadow-inner"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setShowDangerZone(false); setDeleteInput(''); }}
                      className="flex-1 py-3 rounded-[16px] bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleEraseData}
                      disabled={deleteInput !== 'DELETE'}
                      className="flex-1 py-3 rounded-[16px] bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-wider disabled:opacity-30 disabled:bg-red-500/50 transition-all active:scale-95 shadow-md shadow-red-500/10"
                    >
                      Erase All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest mb-3 ml-4">About</h2>
          <div className="bg-white rounded-[32px] border border-stone-200/30 p-5 flex gap-4 items-start shadow-sm">
             <div className="p-3 bg-stone-50 rounded-2xl text-stone-400 border border-stone-100">
                <Info size={16} />
              </div>
              <div>
                <p className="text-stone-800 font-extrabold text-sm">TimeOS v3.1</p>
                <p className="text-stone-500 text-[11px] leading-relaxed font-medium mt-1">
                  Offline-first personal time wrapper designed to track and optimize daily focus distribution, built with premium mobile-first interactive aesthetics.
                </p>
              </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
};
