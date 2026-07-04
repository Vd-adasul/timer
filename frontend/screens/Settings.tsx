import React, { useState, useRef } from 'react';
import { Database, Info, Download, Upload, AlertTriangle, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store';
import { motion } from 'framer-motion';

export const SettingsScreen: React.FC = () => {
  const { state, clearData, importData, showToast, theme, toggleTheme } = useAppStore();
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar"
    >
      <div className="px-6 pt-10 pb-6 sticky top-0 bg-app-bg/85 backdrop-blur-md z-10 border-b border-transparent">
        <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight">Settings</h1>
        <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">Configure app and local data</p>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-2">
        
        <section>
          <h2 className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest mb-3 ml-4">Customization</h2>
          <div className="bg-white rounded-[32px] border border-stone-200/30 overflow-hidden shadow-sm">
            <button 
              onClick={toggleTheme}
              className="w-full p-5 flex items-center justify-between hover:bg-stone-50/50 transition-colors text-left group active:bg-stone-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-app-lavender rounded-2xl text-stone-700">
                  {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                </div>
                <div>
                  <p className="text-stone-800 font-extrabold text-xs">App Theme</p>
                  <p className="text-stone-400 text-[10px] font-medium mt-0.5">Currently: {theme === 'dark' ? 'Dark' : 'Light'} Mode</p>
                </div>
              </div>
              <div className="w-10 h-6 bg-stone-100 rounded-full p-1 transition-all duration-300 cursor-pointer flex items-center relative select-none">
                <div className={`w-4 h-4 bg-stone-500 rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
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
            
            <button onClick={handleExport} className="w-full p-5 border-b border-stone-100 flex items-center justify-between hover:bg-stone-50/50 transition-colors text-left active:bg-stone-55">
              <span className="text-stone-500 font-extrabold text-[10px] uppercase tracking-wider">Export App Data</span>
              <Download size={14} className="text-stone-400" />
            </button>
            
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-5 border-b border-stone-100 flex items-center justify-between hover:bg-stone-50/50 transition-colors text-left active:bg-stone-55">
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
