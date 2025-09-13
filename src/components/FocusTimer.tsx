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

function tryBeep() {
  try {
    const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const duration = 0.15; // seconds per beep
    const play = (delay: number, freq = 880) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.01);
    };
    play(0, 880);
    play(0.2, 660);
  } catch {}
}

export default function FocusTimer({ task, store, autoStart, onEnterFocusMode, variant = 'inline', sound }: { task: Task; store: TasksStore; autoStart?: boolean; onEnterFocusMode?: () => void; variant?: 'inline' | 'overlay'; sound?: boolean }) {
  const [duration, setDuration] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const autoStartedForTaskRef = useRef<string | null>(null);

  const remaining = Math.max(0, duration - elapsed);
  const pct = Math.min(100, Math.round(((duration - remaining) / duration) * 100));

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (autoStart && autoStartedForTaskRef.current !== task.id) {
      autoStartedForTaskRef.current = task.id;
      const t = setTimeout(() => start(), 150);
      return () => clearTimeout(t);
    }
  }, [autoStart, task.id]);

  function start() {
    if (running) return;
    setRunning(true);
    startedAtRef.current = Date.now() - elapsed * 1000;
    if (!sessionIdRef.current) sessionIdRef.current = store.startSession(task.id);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      if (!startedAtRef.current) return;
      const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const next = Math.min(duration, seconds);
      setElapsed(next);
      if (next >= duration) {
        finish();
      }
    }, 1000) as unknown as number;
  }

  function pause() {
    if (!running) return;
    setRunning(false);
    if (sessionIdRef.current) {
      store.endSession(sessionIdRef.current);
      sessionIdRef.current = null;
    }
    if (intervalRef.current) window.clearInterval(intervalRef.current);
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
    if (sound) tryBeep();
  }

  const outerGrid = variant === 'overlay'
    ? 'card p-6 grid grid-cols-1 gap-6 items-center'
    : 'card p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center';

  return (
    <div className={outerGrid}>
      <div className={variant === 'overlay' ? 'flex items-center gap-6 justify-center' : 'md:col-span-2 flex items-center gap-4'}>
        <div className="relative h-24 w-24">
          {(() => {
            const r = 18;
            const circumference = 2 * Math.PI * r;
            const offset = circumference * (1 - pct / 100);
            return (
              <svg className="h-24 w-24 rotate-[-90deg]" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r={r}
                  fill="none"
                  stroke="#5674ff"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
            );
          })()}
          <div className="absolute inset-0 grid place-items-center text-2xl font-semibold tabular-nums">{formatMMSS(remaining)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Focus Timer</div>
          <div className="text-slate-800 font-medium truncate max-w-[24ch]" title={task.title}>{task.title}</div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {running ? (
              <button className="btn-primary" onClick={pause}>Pause</button>
            ) : (
              <button className="btn-primary" onClick={start}>Start</button>
            )}
            {onEnterFocusMode && (
              <button className="btn-outline" onClick={onEnterFocusMode}>Full Focus</button>
            )}
            <button className="btn-outline" onClick={() => reset(25 * 60)}>25m</button>
            <button className="btn-outline" onClick={() => reset(50 * 60)}>50m</button>
            <button className="btn-outline" onClick={() => reset(15 * 60)}>15m</button>
            <button className="btn-outline" onClick={finish} disabled={remaining > 0}>Complete</button>
          </div>
        </div>
      </div>
      {variant === 'overlay' ? (
        <div className="w-full">
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
          <div className="text-sm text-slate-700 mt-2">{Math.round(duration / 60)} minutes</div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
