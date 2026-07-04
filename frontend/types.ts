export type ActivityType = 'Productive' | 'Neutral' | 'Unproductive';
export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Activity {
  id: string;
  name: string;
  color: string;
  type: ActivityType;
  quadrant: Quadrant;
  requiresTrack?: boolean;
}

export interface TrackItem {
  id: string;
  name: string;
  type: 'lecture' | 'assignment';
  completed?: boolean;
  lectureNumber?: string;
  completedDate?: string;
}

export interface TrackPart {
  id: string;
  name: string;
  lectures?: TrackItem[];
  assignments?: TrackItem[];
}

export interface Track {
  id: string;
  name: string;
  description?: string;
  parts: TrackPart[];
}

export interface TimeBlock {
  date: string; // YYYY-MM-DD
  index: number; // 0 to 47
  activityId: string;
  trackId?: string;
  partId?: string;
  itemId?: string;
}

export interface AppState {
  activities: Activity[];
  tracks: Track[];
  blocks: Record<string, TimeBlock>; // Key: "YYYY-MM-DD-index"
  goals: Record<string, number>; // Key: activityId, value: goalHours
}

export interface DailyStats {
  totalTracked: number;
  productive: number;
  neutral: number;
  unproductive: number;
  score: number;
  activityBreakdown: Record<string, number>;
  trackBreakdown: Record<string, number>;
  partBreakdown: Record<string, number>;
}

export interface PartStats {
  today: number;
  week: number;
  month: number;
  lifetime: number;
}
