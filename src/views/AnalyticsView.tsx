import { useMemo } from 'react';
import { useTasksStore } from '../store/tasks';
import { differenceInMinutes, parseISO } from 'date-fns';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function AnalyticsView() {
  const store = useTasksStore();

  const stats = useMemo(() => {
    const completed = store.completedTasks;
    const total = completed.length;
    const avgEst = Math.round(
      completed.reduce((acc, t) => acc + (t.estimatedMinutes ?? 0), 0) / (total || 1),
    );
    const avgActual = Math.round(
      completed.reduce((acc, t) => acc + (t.actualMinutes ?? 0), 0) / (total || 1),
    );
    // naive lateness: minutes late past due
    const avgLateness = Math.round(
      completed.reduce((acc, t) => {
        if (!t.completedAt || !t.dueAt) return acc;
        const diff = differenceInMinutes(parseISO(t.completedAt), parseISO(t.dueAt));
        return acc + Math.max(0, diff);
      }, 0) / (total || 1),
    );
    const procrastinationCoeff = avgActual && avgEst ? Math.max(0.5, Math.min(5, avgActual / avgEst)) : 1;
    return { total, avgEst, avgActual, avgLateness, procrastinationCoeff };
  }, [store.completedTasks]);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Completed" value={String(stats.total)} />
        <Stat label="Avg Estimate" value={`${stats.avgEst}m`} />
        <Stat label="Avg Actual" value={`${stats.avgActual}m`} />
        <Stat label="Avg Lateness" value={`${stats.avgLateness}m`} />
      </div>

      <div className="card p-4">
        <div className="font-medium">Procrastination Coefficient</div>
        <div className="text-slate-600 text-sm mt-1">We suggest multiplying estimates by this factor.</div>
        <div className="text-4xl font-semibold mt-3">× {stats.procrastinationCoeff.toFixed(2)}</div>
      </div>

      <div className="card p-4">
        <div className="font-medium">Tip</div>
        <p className="text-slate-600 text-sm mt-1">
          Use the Quick Add box with natural language: "CS essay due tomorrow 17:00 ~2h #cs". Start a focus timer on the
          top task to track real time.
        </p>
      </div>
    </div>
  );
}

