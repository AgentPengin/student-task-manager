import { useEffect, useRef, useState } from 'react';
import type { Task } from '../types';
import type { TasksStore } from '../store/tasks';
import catStudy from '../../assets/catstudy.gif';
import catWater from '../../assets/catwater.gif';
import catChill from '../../assets/catchill.gif';

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
    const duration = 0.15;
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
  // Overall target minutes (user controlled)
  const [totalMinutes, setTotalMinutes] = useState(60);
  const totalSeconds = totalMinutes * 60;

  // Overall elapsed time across segments
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  // Segment machine
  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [focusCount, setFocusCount] = useState(0);
  // lengths are computed per segment; we don't need to persist total in state
  const [segElapsed, setSegElapsed] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const segStartedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const autoStartedForTaskRef = useRef<string | null>(null);
  const [focusAccumBase, setFocusAccumBase] = useState(0);

  const overallUsed = Math.min(totalSeconds, totalElapsed + segElapsed);
  const overallRemaining = Math.max(0, totalSeconds - overallUsed);
  const pct = totalSeconds > 0 ? Math.min(100, Math.round((overallUsed / totalSeconds) * 100)) : 0;

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

  function computeNextSegTotal(nextPhase: 'focus' | 'break', nextFocusCount: number) {
    const remaining = Math.max(0, totalSeconds - totalElapsed);
    if (remaining <= 0) return 0;
    if (nextPhase === 'focus') return Math.min(25 * 60, remaining);
    const breakLen = nextFocusCount > 0 && nextFocusCount % 3 === 0 ? 15 * 60 : 5 * 60;
    return Math.min(breakLen, remaining);
  }

  function startSegment() {
    const seg = computeNextSegTotal(phase, focusCount);
    if (seg <= 0) return finish();
    setSegElapsed(0);
    segStartedAtRef.current = Date.now();
    if (!sessionIdRef.current) sessionIdRef.current = store.startSession(task.id);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      if (!segStartedAtRef.current) return;
      const seconds = Math.floor((Date.now() - segStartedAtRef.current) / 1000);
      const next = Math.min(seg, seconds);
      setSegElapsed(next);
      if (next >= seg) completeSegment(seg);
    }, 1000) as unknown as number;
  }

  function start() {
    if (running) return;
    setRunning(true);
    startSegment();
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

  function resetAll(toMinutes = totalMinutes) {
    pause();
    setTotalMinutes(toMinutes);
    setTotalElapsed(0);
    setPhase('focus');
    setFocusCount(0);
    setSegElapsed(0);
    setFocusAccumBase(0);
  }

  function completeSegment(segUsed: number) {
    setTotalElapsed((t) => t + segUsed);
    if (phase === 'focus') setFocusAccumBase((b) => b + segUsed);

    const nextTotal = totalElapsed + segUsed;
    if (nextTotal >= totalSeconds) {
      finish();
      return;
    }
    if (phase === 'focus') {
      setPhase('break');
      setFocusCount((c) => c + 1);
    } else {
      setPhase('focus');
    }
    segStartedAtRef.current = null;
    startSegment();
  }

  function finish() {
    pause();
    const totalFocus = focusAccumBase + (phase === 'focus' ? segElapsed : 0);
    const minutes = Math.round(totalFocus / 60);
    store.updateTask(task.id, { actualMinutes: (task.actualMinutes ?? 0) + minutes });
    if (sound) tryBeep();
  }

  const outerGrid = variant === 'overlay'
    ? 'card p-8 grid grid-cols-1 gap-6 items-center'
    : 'card p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center';

  // phase label + color + emoji
  const isLongBreak = phase === 'break' && focusCount > 0 && focusCount % 3 === 0;
  const phaseText = phase === 'focus' ? 'Focus' : isLongBreak ? 'Long break' : 'Short break';
  const phaseColor = phase === 'focus' ? 'text-red-600' : isLongBreak ? 'text-emerald-600' : 'text-amber-600';
  const phaseEmoji = phase === 'focus' ? '🐱📚' : isLongBreak ? '🐱🛌' : '🐱☕';

  return (
    <div className={outerGrid}>
      <div className={variant === 'overlay' ? 'flex items-center gap-8 justify-center' : 'md:col-span-2 flex items-center gap-6'}>
        <div className="flex flex-col items-center">
          <div className={variant === 'overlay' ? 'relative h-64 w-64' : 'relative h-40 w-40'}>
          {(() => {
            const r = variant === 'overlay' ? 28 : 22;
            const circumference = 2 * Math.PI * r;
            const offset = circumference * (1 - pct / 100);
            return (
              <svg className={variant === 'overlay' ? 'h-64 w-64 rotate-[-90deg]' : 'h-40 w-40 rotate-[-90deg]'} viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <circle
                  cx="32"
                  cy="32"
                  r={r}
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            );
          })()}
          <div className={variant === 'overlay' ? 'absolute inset-0 grid place-items-center text-5xl font-extrabold tabular-nums' : 'absolute inset-0 grid place-items-center text-3xl font-semibold tabular-nums'}>{formatMMSS(overallRemaining)}</div>
          </div>
          <div className={`mt-2 text-sm font-semibold ${phaseColor}`}>{phaseEmoji} {phaseText}</div>
          {phase === 'focus' ? (
            <img
              src={catStudy}
              alt="Study cat"
              className={variant === 'overlay' ? 'mt-2 w-28 h-28 object-contain' : 'mt-2 w-16 h-16 object-contain'}
            />
          ) : isLongBreak ? (
            <img
              src={catChill}
              alt="Long break cat"
              className={variant === 'overlay' ? 'mt-2 w-28 h-28 object-contain' : 'mt-2 w-16 h-16 object-contain'}
            />
          ) : (
            <img
              src={catWater}
              alt="Short break cat"
              className={variant === 'overlay' ? 'mt-2 w-28 h-28 object-contain' : 'mt-2 w-16 h-16 object-contain'}
            />
          )}
        </div>
        <div>
          <div className="text-xs text-slate-600">Focus Timer</div>
          <div className="text-slate-800 font-semibold truncate max-w-[32ch]" title={task.title}>{task.title}</div>
          <div className="mt-2 text-xs text-slate-600">Overall left {Math.ceil(overallRemaining/60)}m</div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {running ? (
              <button className="btn btn-gradient" onClick={pause}>Pause</button>
            ) : (
              <button className="btn btn-gradient" onClick={start}>Start</button>
            )}
            {onEnterFocusMode && (
              <button className="btn-outline" onClick={onEnterFocusMode}>Full Focus</button>
            )}
            <button className="btn-outline" onClick={() => resetAll(25)}>25m total</button>
            <button className="btn-outline" onClick={() => resetAll(50)}>50m total</button>
            <button className="btn-outline" onClick={() => resetAll(60)}>60m total</button>
            <button className="btn-outline" onClick={finish} disabled={overallRemaining > 0}>Complete</button>
          </div>
        </div>
      </div>
      {variant === 'overlay' ? (
        <div className="w-full">
          <label className="text-xs text-slate-500">Total Duration</label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={totalMinutes}
            onChange={(e) => setTotalMinutes(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-slate-700 mt-2">{totalMinutes} minutes</div>
        </div>
      ) : (
        <div className="md:col-span-1">
          <label className="text-xs text-slate-500">Total Duration</label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={totalMinutes}
            onChange={(e) => setTotalMinutes(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-slate-700 mt-1">{totalMinutes} minutes</div>
        </div>
      )}
    </div>
  );
}
