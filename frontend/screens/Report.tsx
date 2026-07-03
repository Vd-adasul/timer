import React, { useRef, useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Share, Download, Loader2, Sparkles, ArrowLeft, Heart } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useAppStore } from '../store';
import { calculateStats, calculateStreak } from '../utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const ReportScreen: React.FC = () => {
  const { state, showToast, theme } = useAppStore();
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
        backgroundColor: theme === 'dark' ? '#12110F' : '#FDFCF8',
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
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar"
    >
      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex justify-between items-center bg-app-bg/85 backdrop-blur-md z-20 border-b border-stone-200/20 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 -ml-2 rounded-full hover:bg-stone-50 text-stone-500 hover:text-stone-850 transition-colors active:scale-95 border border-transparent hover:border-stone-200/20"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800 tracking-tight">Share Card</h1>
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">Export your time tracking</p>
          </div>
        </div>

        {!generatedImage && (
          <button 
            onClick={generateImage}
            disabled={isGenerating}
            className="bg-stone-800 text-white px-4 py-2 rounded-full font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-stone-900 transition-all active:scale-95 disabled:opacity-50 shadow-[0_4px_16px_rgba(41,37,36,0.06)]"
          >
            {isGenerating ? <Loader2 size={10} className="animate-spin" /> : <Share size={10} />}
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
              className="w-[280px] rounded-[32px] shadow-[0_16px_40px_rgba(41,37,36,0.06)] border border-stone-200/30" 
            />
            
            <div className="flex gap-3 w-full max-w-[280px] mt-2">
              <button 
                onClick={handleDownload}
                className="flex-1 bg-stone-800 hover:bg-stone-900 text-white py-3.5 rounded-[22px] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download size={14} />
                Save Card
              </button>
              <button 
                onClick={() => setGeneratedImage(null)}
                className="px-5 bg-white hover:bg-stone-50 text-stone-600 py-3.5 rounded-[22px] font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 border border-stone-200/35"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Social Media Report Design Container in Softly theme */}
            <div className="w-[300px] h-[533px] bg-app-bg p-6 rounded-[36px] flex flex-col justify-between relative overflow-hidden border border-stone-200/30 shadow-md shrink-0" ref={reportRef}>
              
              {/* Subtle ambient gradients */}
              <div className="absolute top-[-10%] left-[-10%] w-56 h-56 bg-app-sage/40 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-56 h-56 bg-app-lavender/40 rounded-full blur-[80px] pointer-events-none" />

              {/* Card Header */}
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={10} className="text-app-peach" />
                    <h2 className="text-[8px] font-bold text-stone-400 tracking-[0.25em] uppercase">TimeOS Wrap</h2>
                  </div>
                  <p className="text-xl font-extrabold text-stone-800 tracking-tight">{format(new Date(), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {/* Metric stats grid */}
              <div className="relative z-10 grid grid-cols-2 gap-3 my-4">
                <div className="bg-white p-4 rounded-[22px] border border-stone-200/25 shadow-[0_2px_8px_rgba(41,37,36,0.01)]">
                  <p className="text-stone-400 text-[8px] font-bold uppercase tracking-wider mb-1">{studyName}</p>
                  <p className="text-2xl font-extrabold text-stone-800 tracking-tight font-mono">{studyHours}<span className="text-xs text-stone-400 ml-0.5 font-sans font-medium">h</span></p>
                </div>
                <div className="bg-white p-4 rounded-[22px] border border-stone-200/25 shadow-[0_2px_8px_rgba(41,37,36,0.01)]">
                  <p className="text-stone-400 text-[8px] font-bold uppercase tracking-wider mb-1">Score</p>
                  <p className="text-2xl font-extrabold text-stone-800 tracking-tight font-mono">{stats.score}%</p>
                </div>
                <div className="bg-white p-4 rounded-[22px] border border-stone-200/25 shadow-[0_2px_8px_rgba(41,37,36,0.01)]">
                  <p className="text-stone-400 text-[8px] font-bold uppercase tracking-wider mb-1">{gymName}</p>
                  <p className="text-2xl font-extrabold text-stone-800 tracking-tight font-mono">{gymHours}<span className="text-xs text-stone-400 ml-0.5 font-sans font-medium">h</span></p>
                </div>
                <div className="bg-white p-4 rounded-[22px] border border-stone-200/25 shadow-[0_2px_8px_rgba(41,37,36,0.01)]">
                  <p className="text-stone-400 text-[8px] font-bold uppercase tracking-wider mb-1">{sleepName}</p>
                  <p className="text-2xl font-extrabold text-stone-800 tracking-tight font-mono">{sleepHours}<span className="text-xs text-stone-400 ml-0.5 font-sans font-medium">h</span></p>
                </div>
              </div>

              {/* Focused track details */}
              <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-end">
                {topPart && (
                  <div className="bg-gradient-to-r from-app-sage/60 to-app-lavender/60 p-4 rounded-[22px] border border-stone-200/30">
                    <p className="text-stone-500/70 text-[8px] font-bold uppercase tracking-wider mb-1">Top Focus</p>
                    <p className="text-base font-extrabold text-stone-800 tracking-tight truncate">{topPart[0]}</p>
                  </div>
                )}

                {topTracks.length > 0 && (
                  <div className="bg-white p-4 rounded-[22px] border border-stone-200/30 shadow-[0_2px_8px_rgba(41,37,36,0.01)] space-y-2.5">
                    {topTracks.map(([name, hours]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="text-stone-500 font-bold text-xs">{name}</span>
                        <span className="text-stone-800 font-extrabold text-xs font-mono">{hours}h</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="relative z-10 mt-6 flex justify-between items-center pt-2">
                <div className="bg-app-peach px-3 py-1.5 rounded-full border border-stone-200/20">
                  <p className="text-stone-800 font-extrabold text-[9px] tracking-wide flex items-center gap-1">
                    <Heart size={8} className="fill-stone-800" /> {streak} Day Streak
                  </p>
                </div>
                <p className="text-stone-400 text-[8px] font-bold tracking-[0.2em] uppercase">TimeOS App</p>
              </div>
            </div>
            
            {/* Generate visual pointer */}
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mt-6">
              Tap 'Create Card' at the top to export
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
