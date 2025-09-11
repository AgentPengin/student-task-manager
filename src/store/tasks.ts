import { useEffect, useMemo, useReducer } from 'react';
import type { StoreState, Task, TaskSession } from '../types';

const STORAGE_KEY = 'student-time-manager:v1';

type Action =
  | { type: 'create'; task: Task }
  | { type: 'update'; id: string; patch: Partial<Task> }
  | { type: 'delete'; id: string }
  | { type: 'toggleDone'; id: string; done: boolean }
  | { type: 'session:start'; session: TaskSession }
  | { type: 'session:end'; sessionId: string; endedAt: string }
  | { type: 'settings:update'; procrastinationCoeff: number };

function nowISO() {
  return new Date().toISOString();
}

function uid() {
  if ('randomUUID' in crypto) return (crypto as any).randomUUID();
  return 'id-' + Math.random().toString(36).slice(2);
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'create':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'update':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch, updatedAt: nowISO() } : t)),
      };
    case 'delete':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case 'toggleDone':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? {
                ...t,
                status: action.done ? 'done' : 'todo',
                completedAt: action.done ? nowISO() : undefined,
                updatedAt: nowISO(),
              }
            : t,
        ),
      };
    case 'session:start':
      return { ...state, sessions: [...state.sessions, action.session] };
    case 'session:end': {
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === action.sessionId ? { ...s, endedAt: action.endedAt } : s)),
      };
    }
    case 'settings:update':
      return { ...state, settings: { ...state.settings, procrastinationCoeff: action.procrastinationCoeff } };
    default:
      return state;
  }
}

const fallbackState: StoreState = {
  tasks: [],
  sessions: [],
  settings: { procrastinationCoeff: 1.0 },
};

function load(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackState;
    const data = JSON.parse(raw) as StoreState;
    return {
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
      settings: data.settings ?? { procrastinationCoeff: 1.0 },
    };
  } catch {
    return fallbackState;
  }
}

export function useTasksStore() {
  // Initialize from localStorage synchronously to avoid overwrite on mount
  const [state, dispatch] = useReducer(reducer, undefined as unknown as StoreState, () => load());

  // persist on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function createTask(p: Partial<Task> & { title: string }) {
    const task: Task = {
      id: uid(),
      title: p.title.trim(),
      description: p.description?.trim(),
      priority: p.priority ?? 2,
      status: 'todo',
      dueAt: p.dueAt,
      scheduledAt: p.scheduledAt,
      estimatedMinutes: p.estimatedMinutes,
      actualMinutes: p.actualMinutes ?? 0,
      tags: p.tags ?? [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    dispatch({ type: 'create', task });
  }

  function updateTask(id: string, patch: Partial<Task>) {
    dispatch({ type: 'update', id, patch });
  }

  function deleteTask(id: string) {
    dispatch({ type: 'delete', id });
  }

  function toggleDone(id: string, done: boolean) {
    dispatch({ type: 'toggleDone', id, done });
  }

  function startSession(taskId: string) {
    const session: TaskSession = {
      id: uid(),
      taskId,
      startedAt: nowISO(),
      minutes: 0,
    };
    dispatch({ type: 'session:start', session });
    return session.id;
  }

  function endSession(sessionId: string) {
    dispatch({ type: 'session:end', sessionId, endedAt: nowISO() });
  }

  function setProcrastinationCoeff(v: number) {
    dispatch({ type: 'settings:update', procrastinationCoeff: Math.max(0.5, Math.min(5, v)) });
  }

  // derived
  const openTasks = useMemo(() => state.tasks.filter((t) => t.status !== 'done'), [state.tasks]);
  const completedTasks = useMemo(() => state.tasks.filter((t) => t.status === 'done'), [state.tasks]);

  return {
    state,
    openTasks,
    completedTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleDone,
    startSession,
    endSession,
    setProcrastinationCoeff,
  };
}

export type TasksStore = ReturnType<typeof useTasksStore>;
