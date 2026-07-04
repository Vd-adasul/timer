import { Activity, Track, AppState } from './types';

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'act_sleep', name: 'Sleep', color: '#8b5cf6', type: 'Neutral', quadrant: 'Q2' },
  { id: 'act_study', name: 'Study', color: '#3b82f6', type: 'Productive', quadrant: 'Q1', requiresTrack: true },
  { id: 'act_gym', name: 'Gym', color: '#f97316', type: 'Productive', quadrant: 'Q2' },
  { id: 'act_work', name: 'Work', color: '#10b981', type: 'Productive', quadrant: 'Q1' },
  { id: 'act_chores', name: 'Household', color: '#64748b', type: 'Neutral', quadrant: 'Q3' },
  { id: 'act_ready', name: 'Getting Ready', color: '#06b6d4', type: 'Neutral', quadrant: 'Q2' },
  { id: 'act_leisure', name: 'Leisure', color: '#ec4899', type: 'Unproductive', quadrant: 'Q4' },
  { id: 'act_other', name: 'Other', color: '#737373', type: 'Neutral', quadrant: 'Q4' },
];

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track_dsa',
    name: 'DSA',
    description: 'Data Structures and Algorithms',
    parts: [
      { id: 'part_arr', name: 'Arrays & Strings', lectures: [], assignments: [] },
      { id: 'part_tree', name: 'Trees & Graphs', lectures: [], assignments: [] },
      { id: 'part_dp', name: 'Dynamic Programming', lectures: [], assignments: [] }
    ]
  },
  {
    id: 'track_web',
    name: 'Web Development',
    parts: [
      { id: 'part_react', name: 'React', lectures: [], assignments: [] },
      { id: 'part_node', name: 'NodeJS', lectures: [], assignments: [] }
    ]
  }
];

export const INITIAL_STATE: AppState = {
  activities: DEFAULT_ACTIVITIES,
  tracks: DEFAULT_TRACKS,
  blocks: {},
  goals: {
    act_sleep: 8,
    act_study: 8,
    act_gym: 2,
    act_work: 8,
  }
};

export const BLOCKS_PER_DAY = 48;
