import React, { useState, useMemo } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store';
import { calculateStats } from '../utils';
import { PartStatsModal } from '../components/PartStatsModal';
import { TrackPart } from '../types';
import { motion } from 'framer-motion';

type Period = 'Today' | 'Week' | 'Month';

export const AnalyticsScreen: React.FC = () => {
  const { state } = useAppStore();
  const [period, setPeriod] = useState<Period>('Week');
  const [selectedPart, setSelectedPart] = useState<TrackPart | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    let start, end;
    
    switch (period) {
      case 'Today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'Week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'Month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }
    
    return calculateStats(state.blocks, state, start, end);
  }, [state, period]);

  const activityData = useMemo(() => {
    const colorMapping: Record<string, string> = {
      'Study': '#E8EFE8',      // Sage
      'Gym': '#FFB7B2',        // Coral/Peach
      'Sleep': '#EFEDF4',      // Lavender
      'Chores': '#F5F5F0',     // Sand
      'Work': '#FFD3B6',       // Light Orange
      'Leisure': '#FCE1E4',    // Pale Pink
    };

    return Object.entries(stats.activityBreakdown)
      .map(([name, value]) => {
        const fallbackColor = '#F5F5F0';
        return { name, value, color: colorMapping[name] || fallbackColor };
      })
      .sort((a, b) => b.value - a.value);
  }, [stats.activityBreakdown]);

  const partData = useMemo(() => {
    return Object.entries(stats.partBreakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [stats.partBreakdown]);

  const topicData = useMemo(() => {
    return Object.entries(stats.trackBreakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [stats.trackBreakdown]);

  const handlePartClick = (partName: string) => {
    for (const track of state.tracks) {
      const part = track.parts.find(p => p.name === partName);
      if (part) {
        setSelectedPart(part);
        return;
      }
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
      <div className="px-6 pt-10 pb-4 sticky top-0 bg-app-bg/85 backdrop-blur-md z-20 border-b border-transparent">
        <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight mb-5">Analytics</h1>
        
        <div className="flex bg-stone-100/60 p-1 rounded-2xl border border-stone-200/35">
          {(['Today', 'Week', 'Month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                period === p 
                  ? 'bg-white text-stone-800 shadow-[0_2px_8px_rgba(41,37,36,0.04)]' 
                  : 'text-stone-500/60 hover:text-stone-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[28px] border border-stone-200/30 shadow-[0_4px_16px_rgba(41,37,36,0.01)]">
            <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mb-1.5">Productivity</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-extrabold text-stone-800 font-mono">{stats.score}</span>
              <span className="text-xs font-bold text-stone-400 font-mono">%</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[28px] border border-stone-200/30 shadow-[0_4px_16px_rgba(41,37,36,0.01)]">
            <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mb-1.5">Tracked Time</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-extrabold text-stone-800 font-mono">{stats.totalTracked}</span>
              <span className="text-xs font-bold text-stone-400 font-mono">h</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[36px] border border-stone-200/30 shadow-[0_4px_24px_rgba(41,37,36,0.02)]">
          <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-6">Activity Distribution</h3>
          {activityData.length > 0 ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-48 h-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(41,37,36,0.08)', borderRadius: '16px', color: '#292524', boxShadow: '0 8px 24px rgba(41,37,36,0.04)' }}
                      itemStyle={{ color: '#292524', fontWeight: 700, fontSize: '11px' }}
                      formatter={(value: number) => [`${value} hrs`, 'Time']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-stone-850 font-mono tracking-tight">{stats.totalTracked}h</span>
                  <span className="font-cursive text-xl text-stone-500 lowercase select-none">total</span>
                </div>
              </div>

              <div className="w-full space-y-3 pt-2">
                {activityData.map(item => (
                  <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color, border: '1px solid rgba(41,37,36,0.05)' }} />
                      <span className="text-xs font-bold text-stone-500 group-hover:text-stone-800 transition-colors">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-stone-800 font-mono">{item.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-stone-400/40 text-[10px] font-extrabold uppercase tracking-widest">
              No data for this period
            </div>
          )}
        </div>

        {topicData.length > 0 && (
          <div className="bg-white p-6 rounded-[36px] border border-stone-200/30 shadow-[0_4px_24px_rgba(41,37,36,0.02)]">
            <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-6">Learning Topic Share</h3>
            <div className="h-48 w-full select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 10, fontWeight: 700 }} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(41,37,36,0.01)', radius: 4 }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(41,37,36,0.08)', borderRadius: '16px', color: '#292524' }}
                    formatter={(value: number) => [`${value} hrs`, 'Time']}
                  />
                  <Bar dataKey="value" fill="#FFB7B2" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {partData.length > 0 && (
          <div className="bg-white p-6 rounded-[36px] border border-stone-200/30 shadow-[0_4px_24px_rgba(41,37,36,0.02)]">
            <h3 className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest mb-4">Top Focus Areas</h3>
            <div className="space-y-1">
              {partData.map((item, index) => {
                const maxVal = partData[0].value || 1;
                const ratioPercent = (item.value / maxVal) * 100;
                
                return (
                  <div 
                    key={item.name}
                    onClick={() => handlePartClick(item.name)}
                    className="flex flex-col p-3 rounded-[22px] hover:bg-stone-50/50 transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-stone-300 font-bold font-mono text-xs">{index + 1}</span>
                        <span className="text-xs font-bold text-stone-500 group-hover:text-stone-850 transition-colors">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-stone-800 font-mono">{item.value}h</span>
                    </div>
                    <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-app-peach rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${ratioPercent}%` }}
                        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <PartStatsModal 
        part={selectedPart} 
        isOpen={!!selectedPart} 
        onClose={() => setSelectedPart(null)} 
      />
    </motion.div>
  );
};
