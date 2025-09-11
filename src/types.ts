export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskSession {
  id: string;
  taskId: string;
  startedAt: string; // ISO
  endedAt?: string; // ISO
  minutes: number; // planned or actual when ended
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3; // 1=Low,2=Med,3=High
  status: TaskStatus;
  dueAt?: string; // ISO
  scheduledAt?: string; // ISO (start time for session)
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags?: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
}

export interface Settings {
  procrastinationCoeff: number; // e.g., 1.0 default, 1.5 means takes longer
}

export interface StoreState {
  tasks: Task[];
  sessions: TaskSession[];
  settings: Settings;
  trash?: (Task & { deletedAt: string })[];
}
