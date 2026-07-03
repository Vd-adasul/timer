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
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col h-full bg-[#09090b] overflow-y-auto pb-32 no-scrollbar"
      >
        <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#09090b]/95 backdrop-blur-xl z-10 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setView('paste_json')} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all active:scale-95 border border-transparent hover:border-white/5">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Preview Track</h1>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Confirm imported items</p>
          </div>
        </div>

        <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-6">
          <div className="bg-zinc-900/40 p-6 rounded-[32px] border border-white/5 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <CheckCircle2 size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1.5 tracking-tight">{previewTrack.name}</h2>
            {previewTrack.description && <p className="text-white/40 text-xs mb-6 font-medium">{previewTrack.description}</p>}
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <p className="text-2xl font-extrabold text-white font-mono">{previewTrack.parts.length}</p>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">Parts</p>
              </div>
              <div className="bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <p className="text-2xl font-extrabold text-white font-mono">{totalLectures}</p>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">Lectures</p>
              </div>
              <div className="bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <p className="text-2xl font-extrabold text-white font-mono">{totalAssignments}</p>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">Tasks</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveTrack}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/10"
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
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col h-full bg-[#09090b] overflow-y-auto pb-32 no-scrollbar"
      >
        <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#09090b]/95 backdrop-blur-xl z-10 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setView('tracks')} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all active:scale-95 border border-transparent hover:border-white/5">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Paste JSON</h1>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Input structured JSON roadmap</p>
          </div>
        </div>

        <div className="px-6 space-y-4 max-w-2xl mx-auto w-full mt-6 flex-1 flex flex-col">
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{\n  "name": "DSA Roadmap",\n  "description": "Arrays and dynamic programming",\n  "parts": [\n    {\n      "name": "Arrays",\n      "lectures": ["Intro to Arrays"],\n      "assignments": ["Array practice"]\n    }\n  ]\n}`}
            className="flex-1 w-full bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-xs text-white/80 font-mono focus:outline-none focus:border-indigo-500/50 resize-none min-h-[260px] shadow-inner leading-relaxed"
          />
          
          {jsonError && (
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider leading-relaxed">
              {jsonError}
            </div>
          )}

          <button 
            onClick={handlePreviewJSON}
            disabled={!jsonInput.trim()}
            className="w-full py-3.5 bg-white hover:bg-white/90 text-black rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-30"
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
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col h-full bg-[#09090b] overflow-y-auto pb-32 no-scrollbar"
      >
        <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#09090b]/95 backdrop-blur-xl z-10 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setView('main')} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all active:scale-95 border border-transparent hover:border-white/5">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Learning Tracks</h1>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Configure study curriculum</p>
          </div>
        </div>

        <div className="px-6 space-y-5 max-w-2xl mx-auto w-full mt-6">
          <button 
            onClick={() => setView('paste_json')}
            className="w-full bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 p-4 rounded-2xl flex items-center justify-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
          >
            <Plus size={14} /> Add Track via JSON
          </button>

          <div className="space-y-3">
            {state.tracks.map(track => (
              <div key={track.id} className="bg-zinc-900/40 rounded-2xl border border-white/5 p-5 flex justify-between items-center group hover:border-white/10 transition-colors">
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-tight">{track.name}</h3>
                  <p className="text-white/40 text-xs mt-0.5 font-bold uppercase tracking-wider">{track.parts.length} Parts</p>
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
                  className="p-3 bg-white/[0.01] rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors active:scale-95 border border-transparent hover:border-white/5"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {state.tracks.length === 0 && (
              <div className="text-center py-16 text-white/20 text-xs font-bold uppercase tracking-widest">
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
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-[#09090b] overflow-y-auto pb-32 no-scrollbar"
    >
      <div className="px-6 pt-10 pb-6 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10 border-b border-transparent">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-white/40 text-xs mt-2 font-bold uppercase tracking-wider">Configure app and local data</p>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-2">
        
        <section>
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 ml-4">Customization</h2>
          <div className="bg-zinc-900/40 rounded-[28px] border border-white/5 overflow-hidden">
            <button 
              onClick={() => setView('tracks')}
              className="w-full p-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors text-left group active:bg-white/[0.02]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/5 rounded-2xl text-indigo-400 border border-indigo-500/10">
                  <FileJson size={18} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Learning Tracks</p>
                  <p className="text-white/40 text-xs font-medium mt-0.5">Manage JSON roadmaps</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 ml-4">Data Management</h2>
          <div className="bg-zinc-900/40 rounded-[28px] border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-white/60 border border-white/5">
                <Database size={18} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Local Storage</p>
                <p className="text-white/40 text-xs font-medium mt-0.5">All data remains completely offline.</p>
              </div>
            </div>
            
            <button onClick={handleExport} className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.01] transition-colors text-left active:bg-white/[0.02]">
              <span className="text-white/70 font-bold text-xs uppercase tracking-wider">Export App Data</span>
              <Download size={16} className="text-white/40" />
            </button>
            
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.01] transition-colors text-left active:bg-white/[0.02]">
              <span className="text-white/70 font-bold text-xs uppercase tracking-wider">Import App Data</span>
              <Upload size={16} className="text-white/40" />
            </button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />

            <div className="p-5">
              {!showDangerZone ? (
                <button 
                  onClick={() => setShowDangerZone(true)}
                  className="w-full py-3 rounded-2xl border border-red-500/10 hover:border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/5 transition-all active:scale-[0.98]"
                >
                  Danger Zone
                </button>
              ) : (
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 animate-scale-in">
                  <div className="flex items-start gap-3.5 mb-5">
                    <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs text-red-200/70 space-y-1">
                      <p className="font-extrabold text-red-400 text-sm">Erase Device Database</p>
                      <p className="font-medium leading-relaxed">This will delete all tracked days, streak histories, study track logs, and local configurations. This action is absolute.</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2.5">
                    Type <span className="text-red-400 font-mono">DELETE</span> below to execute:
                  </p>
                  <input 
                    type="text" 
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-[#09090b] border border-red-500/20 rounded-xl px-4 py-3 text-white text-xs font-mono font-bold focus:outline-none focus:border-red-500 mb-4"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setShowDangerZone(false); setDeleteInput(''); }}
                      className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleEraseData}
                      disabled={deleteInput !== 'DELETE'}
                      className="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:bg-red-600/50 transition-all active:scale-95 shadow-lg shadow-red-600/10"
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
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 ml-4">About</h2>
          <div className="bg-zinc-900/40 rounded-[28px] border border-white/5 p-5 flex gap-4 items-start">
             <div className="p-3 bg-white/5 rounded-2xl text-white/60 shrink-0 border border-white/5">
                <Info size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-base">TimeOS v3.1</p>
                <p className="text-white/40 text-xs leading-relaxed font-medium mt-1">
                  Offline-first personal time wrapper designed to track and optimize daily focus distribution, built with premium mobile-first interactive aesthetics.
                </p>
              </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
};
