import { format, parseISO, startOfDay, endOfDay, eachDayOfInterval, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { TimeBlock, AppState, DailyStats, PartStats, Activity } from './types';

export const getBlockKey = (date: string, index: number) => `${date}-${index}`;

export const formatTime = (index: number): string => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? '00' : '30';
  const formattedHours = hours.toString().padStart(2, '0');
  return `${formattedHours}:${minutes}`;
};

export const calculateStats = (
  blocks: Record<string, TimeBlock>,
  state: AppState,
  startDate: Date,
  endDate: Date
): DailyStats => {
  const stats: DailyStats = {
    totalTracked: 0,
    productive: 0,
    neutral: 0,
    unproductive: 0,
    score: 0,
    activityBreakdown: {},
    trackBreakdown: {},
    partBreakdown: {},
  };

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  days.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    for (let i = 0; i < 48; i++) {
      const key = getBlockKey(dateStr, i);
      const block = blocks[key];
      
      if (block) {
        stats.totalTracked += 0.5;
        const activity = state.activities.find(a => a.id === block.activityId);
        
        if (activity) {
          stats.activityBreakdown[activity.name] = (stats.activityBreakdown[activity.name] || 0) + 0.5;
          
          if (activity.type === 'Productive') stats.productive += 0.5;
          else if (activity.type === 'Neutral') stats.neutral += 0.5;
          else if (activity.type === 'Unproductive') stats.unproductive += 0.5;

          if (block.trackId) {
            const track = state.tracks.find(t => t.id === block.trackId);
            if (track) {
              stats.trackBreakdown[track.name] = (stats.trackBreakdown[track.name] || 0) + 0.5;
              if (block.partId) {
                const part = track.parts.find(p => p.id === block.partId);
                if (part) {
                  stats.partBreakdown[part.name] = (stats.partBreakdown[part.name] || 0) + 0.5;
                }
              }
            }
          }
        }
      }
    }
  });

  if (stats.totalTracked > 0) {
    stats.score = Math.round((stats.productive / stats.totalTracked) * 100);
  }

  return stats;
};

export const calculateStreak = (blocks: Record<string, TimeBlock>, activities: Activity[]): number => {
  let streak = 0;
  let currentDate = new Date();
  
  // 4 AM grace period: if current time is before 4 AM, start checking from yesterday
  if (currentDate.getHours() < 4) {
    currentDate = subDays(currentDate, 1);
  }
  
  const productiveActivityIds = activities.filter(a => a.type === 'Productive').map(a => a.id);
  const baseDate = currentDate;

  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    let hasProductive = false;
    
    for (let i = 0; i < 48; i++) {
      const block = blocks[`${dateStr}-${i}`];
      if (block && productiveActivityIds.includes(block.activityId)) {
        hasProductive = true;
        break;
      }
    }
    
    if (hasProductive) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      if (streak === 0 && isSameDay(currentDate, baseDate)) {
         currentDate = subDays(currentDate, 1);
         continue;
      }
      break;
    }
  }
  return streak;
};

export const calculatePartStats = (blocks: Record<string, TimeBlock>, partId: string): PartStats => {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  
  const stats: PartStats = { today: 0, week: 0, month: 0, lifetime: 0 };

  Object.values(blocks).forEach(block => {
    if (block.partId === partId) {
      stats.lifetime += 0.5;
      
      if (block.date === todayStr) {
        stats.today += 0.5;
      }
      
      const blockDate = parseISO(block.date);
      if (blockDate >= weekStart) {
        stats.week += 0.5;
      }
      if (blockDate >= monthStart) {
        stats.month += 0.5;
      }
    }
  });

  return stats;
};

export const generateInsights = (state: AppState): string[] => {
  const now = new Date();
  const weekStats = calculateStats(state.blocks, state, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }));
  const lifetimeStats = calculateStats(state.blocks, state, new Date(2000, 0, 1), now);
  
  const insights: string[] = [];
  
  if (lifetimeStats.totalTracked < 10) {
    insights.push(`Only ${weekStats.totalTracked} hours have been tracked this week.`);
    insights.push("Track more days to unlock meaningful insights and patterns.");
    return insights;
  }

  if (lifetimeStats.totalTracked >= 10 && lifetimeStats.totalTracked < 50) {
    const totalStudy = Object.values(weekStats.trackBreakdown).reduce((a, b) => a + b, 0);
    if (totalStudy > 0) {
      insights.push("You spent:");
      const sortedTracks = Object.entries(weekStats.trackBreakdown).sort((a, b) => b[1] - a[1]);
      sortedTracks.forEach(([name, hours]) => {
        const percentage = Math.round((hours / totalStudy) * 100);
        insights.push(`${percentage}% ${name}`);
      });
      insights.push("This week.");
    } else {
      insights.push(`You tracked ${weekStats.totalTracked} hours this week, but no study time yet.`);
    }
    return insights;
  }

  const sortedLifetimeTracks = Object.entries(lifetimeStats.trackBreakdown).sort((a, b) => b[1] - a[1]);
  const topTrack = sortedLifetimeTracks.length > 0 ? sortedLifetimeTracks[0][0] : null;
  
  if (topTrack) {
    insights.push(`Your most consistent focus is ${topTrack}.`);
  }

  const sortedParts = Object.entries(lifetimeStats.partBreakdown).sort((a, b) => b[1] - a[1]);
  if (sortedParts.length >= 2) {
    insights.push(`${sortedParts[0][0]} has received ${sortedParts[0][1]} hours.`);
    insights.push(`${sortedParts[sortedParts.length - 1][0]} has received only ${sortedParts[sortedParts.length - 1][1]} hours.`);
    insights.push(`There may be an imbalance in your learning distribution.`);
  }

  const hourCounts = new Array(24).fill(0);
  Object.values(state.blocks).forEach(block => {
    const activity = state.activities.find(a => a.id === block.activityId);
    if (activity?.type === 'Productive') {
      const hour = Math.floor(block.index / 2);
      hourCounts[hour]++;
    }
  });
  
  let bestHour = 0;
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      bestHour = hour;
    }
  });
  
  if (maxCount > 0) {
    const endHour = (bestHour + 3) % 24;
    insights.push(`You study best between:\n${bestHour}:00 - ${endHour}:00`);
  }

  insights.push(`Average productivity:\n${lifetimeStats.score}%`);

  const lostHours = weekStats.unproductive;
  if (lostHours > 0) {
    insights.push(`You lost ${lostHours} hours this week to Unproductive activities.`);
    if (topTrack) {
      const sessions = lostHours * 2;
      insights.push(`That equals:\n${sessions} ${topTrack} sessions.`);
    }
  }

  return insights;
};
