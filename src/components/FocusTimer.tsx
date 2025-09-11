import { useEffect, useRef, useState } from 'react';
import type { Task } from '../types';
import type { TasksStore } from '../store/tasks';

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function FocusTimer({ task, store }: { task: Task; store: TasksStore }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) {
      // end session
      setRunning(false);
      if (sessionIdRef.current) {
        store.endSession(sessionIdRef.current);
        sessionIdRef.current = null;
      }
      // auto add 25m to actualMinutes
      const m = (task.actualMinutes ?? 0) + 25;
      store.updateTask(task.id, { actualMinutes: m });
    }
  }, [seconds, running]);

  function toggle() {
    if (running) {
      setRunning(false);
      if (sessionIdRef.current) {
        store.endSession(sessionIdRef.current);
        sessionIdRef.current = null;
      }
    } else {
      setRunning(true);
      sessionIdRef.current = store.startSession(task.id);
    }
  }

  function reset(sec = 25 * 60) {
    setSeconds(sec);
    setRunning(false);
  }

  return (
    <div className="card p-4 flex items-center justify-between gap-4">
      <div>
        <div className="text-xs text-slate-500">Focus Timer</div>
        <div className="text-3xl font-semibold tabular-nums">{formatMMSS(seconds)}</div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-primary" onClick={toggle}>{running ? 'Pause' : 'Start'}</button>
        <button className="btn-outline" onClick={() => reset(25 * 60)}>Pomodoro</button>
        <button className="btn-outline" onClick={() => reset(50 * 60)}>50m</button>
        <button className="btn-outline" onClick={() => reset(15 * 60)}>15m</button>
      </div>
    </div>
  );
}

