import React, { useRef, useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Share, Download, Loader2, Sparkles, ArrowLeft, Heart } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useAppStore } from '../store';
import { calculateStats, calculateStreak } from '../utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const ReportScreen: React.FC = () => {
  const { state, showToast } = useAppStore();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    return calculateStats(state.blocks, state, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }));
  }, [state]);

  const streak = useMemo(() => calculateStreak(state.blocks, state.activities), [state]);

  const topPart = Object.entries(stats.partBreakdown).sort((a, b) => b[1] - a[1])[0];
  
  // Resolve activities dynamically
  const studyAct = state.activities.find(a => a.id === 'act_study');
  const gymAct = state.activities.find(a => a.id === 'act_gym');
  const sleepAct = state.activities.find(a => a.id === 'act_sleep');

  const studyName = studyAct?.name || 'Study';
  const gymName = gymAct?.name || 'Gym';
  const sleepName = sleepAct?.name || 'Sleep';

  const studyHours = stats.activityBreakdown[studyName] || 0;
  const gymHours = stats.activityBreakdown[gymName] || 0;
  const sleepHours = stats.activityBreakdown[sleepName] || 0;

  const topTracks = Object.entries(stats.trackBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const generateImage = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Smooth animation delay
      
      // Ensure screenshot captures cleanly by temporarily resetting scaling properties
      const dataUrl = await htmlToImage.toPng(reportRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#09090b',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      setGeneratedImage(dataUrl);
      showToast('Card generated successfully!', 'success');
    } catch (err) {
      console.error('Failed to generate image', err);
      showToast('Could not generate the sharing card.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.download = `TimeOS-Daily-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = generatedImage;
      link.click();
      showToast('Saved to downloads!', 'success');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-[#09090b] overflow-y-auto pb-32 no-scrollbar"
    >
      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex justify-between items-center bg-[#09090b]/95 backdrop-blur-xl z-20 border-b border-white/5 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors active:scale-95 border border-transparent hover:border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Share Card</h1>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Export your time tracking</p>
          </div>
        </div>

        {!generatedImage && (
          <button 
            onClick={generateImage}
            disabled={isGenerating}
            className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50 shadow-[0_4px_16px_rgba(255,255,255,0.15)]"
          >
            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Share size={12} />}
            {isGenerating ? 'Generating...' : 'Create Card'}
          </button>
        )}
      </div>

      <div className="px-6 max-w-md mx-auto w-full flex flex-col items-center mt-6">
        
        {generatedImage ? (
          <div className="w-full flex flex-col items-center gap-6 animate-scale-in">
            <img 
              src={generatedImage} 
              alt="Generated Report" 
              className="w-[280px] rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/10" 
            />
            
            <div className="flex gap-3 w-full max-w-[280px] mt-2">
              <button 
                onClick={handleDownload}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download size={16} />
                Save Card
              </button>
              <button 
                onClick={() => setGeneratedImage(null)}
                className="px-5 bg-white/5 hover:bg-white/10 text-white/70 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 border border-white/5"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Social Media Report Design Container with responsive scaling */}
            <div className="w-[300px] h-[533px] bg-[#09090b] p-6 rounded-[36px] flex flex-col justify-between relative overflow-hidden border border-white/5 shadow-2xl shrink-0" ref={reportRef}>
              
              {/* Subtle ambient gradients */}
              <div className="absolute top-[-10%] left-[-10%] w-56 h-56 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-56 h-56 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={12} className="text-indigo-400" />
                    <h2 className="text-[8px] font-bold text-indigo-400 tracking-[0.25em] uppercase">TimeOS Wrap</h2>
                  </div>
                  <p className="text-xl font-extrabold text-white tracking-tight">{format(new Date(), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {/* Metric stats grid */}
              <div className="relative z-10 grid grid-cols-2 gap-3 my-4">
                <div className="bg-white/[0.02] backdrop-blur-xl p-4 rounded-[22px] border border-white/[0.04]">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">{studyName}</p>
                  <p className="text-2xl font-extrabold text-white tracking-tight font-mono">{studyHours}<span className="text-sm text-white/30 ml-0.5 font-sans font-medium">h</span></p>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-xl p-4 rounded-[22px] border border-white/[0.04]">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">Productivity</p>
                  <p className="text-2xl font-extrabold text-white tracking-tight font-mono">{stats.score}%</p>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-xl p-4 rounded-[22px] border border-white/[0.04]">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">{gymName}</p>
                  <p className="text-2xl font-extrabold text-white tracking-tight font-mono">{gymHours}<span className="text-sm text-white/30 ml-0.5 font-sans font-medium">h</span></p>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-xl p-4 rounded-[22px] border border-white/[0.04]">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-1">{sleepName}</p>
                  <p className="text-2xl font-extrabold text-white tracking-tight font-mono">{sleepHours}<span className="text-sm text-white/30 ml-0.5 font-sans font-medium">h</span></p>
                </div>
              </div>

              {/* Focused track details */}
              <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-end">
                {topPart && (
                  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-[22px] border border-white/10">
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1">Top Focus</p>
                    <p className="text-lg font-bold text-white tracking-tight truncate">{topPart[0]}</p>
                  </div>
                )}

                {topTracks.length > 0 && (
                  <div className="bg-white/[0.02] backdrop-blur-xl p-4 rounded-[22px] border border-white/[0.04] space-y-2.5">
                    {topTracks.map(([name, hours]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="text-white/70 font-semibold text-sm">{name}</span>
                        <span className="text-white font-extrabold text-sm font-mono">{hours}h</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="relative z-10 mt-6 flex justify-between items-center pt-2">
                <div className="bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                  <p className="text-orange-400 font-extrabold text-[10px] tracking-wide flex items-center gap-1">
                    <Heart size={10} className="fill-orange-400" /> {streak} Day Streak
                  </p>
                </div>
                <p className="text-white/20 text-[8px] font-bold tracking-[0.2em] uppercase">TimeOS App</p>
              </div>
            </div>
            
            {/* Generate visual pointer */}
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-6">
              Tap 'Create Card' at the top to export
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
