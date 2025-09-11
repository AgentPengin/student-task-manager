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
  const [duration, setDuration] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const remaining = Math.max(0, duration - elapsed);
  const pct = Math.min(100, Math.round((elapsed / duration) * 100));

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function loop() {
    if (!running) return;
    const now = performance.now();
    if (startedAtRef.current == null) startedAtRef.current = now;
    const delta = now - startedAtRef.current; // ms
    const seconds = Math.floor(delta / 1000);
    setElapsed(seconds);
    if (seconds >= duration) {
      finish();
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    setRunning(true);
    startedAtRef.current = performance.now() - elapsed * 1000;
    sessionIdRef.current = store.startSession(task.id);
    rafRef.current = requestAnimationFrame(loop);
  }

  function pause() {
    if (!running) return;
    setRunning(false);
    if (sessionIdRef.current) {
      store.endSession(sessionIdRef.current);
      sessionIdRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function reset(to = duration) {
    pause();
    setElapsed(0);
    setDuration(to);
  }

  function finish() {
    pause();
    const minutes = Math.round((elapsed || duration) / 60);
    store.updateTask(task.id, { actualMinutes: (task.actualMinutes ?? 0) + minutes });
  }

  return (
    <div className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div className="md:col-span-2 flex items-center gap-4">
        <div className="relative h-20 w-20">
          <svg className="h-20 w-20 rotate-[-90deg]" viewBox="0 0 36 36">
            <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <path
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
              fill="none"
              stroke="#5674ff"
              strokeWidth="4"
              strokeDasharray={`${pct}, 100`}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-xl font-semibold tabular-nums">{formatMMSS(remaining)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Focus Timer</div>
          <div className="text-slate-800 font-medium truncate max-w-[24ch]" title={task.title}>{task.title}</div>
          <div className="mt-2 flex items-center gap-2">
            {running ? (
              <button className="btn-primary" onClick={pause}>Pause</button>
            ) : (
              <button className="btn-primary" onClick={start}>Start</button>
            )}
            <button className="btn-outline" onClick={() => reset(25 * 60)}>25m</button>
            <button className="btn-outline" onClick={() => reset(50 * 60)}>50m</button>
            <button className="btn-outline" onClick={() => reset(15 * 60)}>15m</button>
            <button className="btn-outline" onClick={finish} disabled={remaining > 0}>Complete</button>
          </div>
        </div>
      </div>

      <div className="md:col-span-1">
        <label className="text-xs text-slate-500">Duration</label>
        <input
          type="range"
          min={5}
          max={120}
          step={5}
          value={Math.round(duration / 60)}
          onChange={(e) => setDuration(parseInt(e.target.value) * 60)}
          className="w-full"
        />
        <div className="text-sm text-slate-700 mt-1">{Math.round(duration / 60)} minutes</div>
      </div>
    </div>
  );
}
