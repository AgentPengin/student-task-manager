import { clsx } from 'clsx';
import type { Task } from '../types';
import type { TasksStore } from '../store/tasks';
import { fmtDate, fmtTime, isDueToday, isOverdue } from '../lib/date';

export default function TaskItem({ task, store }: { task: Task; store: TasksStore }) {
  const overdue = isOverdue(task.dueAt);
  const dueToday = isDueToday(task.dueAt);
  return (
    <div className="card p-3 md:p-4 flex items-center gap-3">
      <button
        aria-label="toggle done"
        onClick={() => store.toggleDone(task.id, task.status !== 'done')}
        className={clsx(
          'h-5 w-5 rounded border flex items-center justify-center',
          task.status === 'done' ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300',
        )}
      >
        {task.status === 'done' ? '✓' : ''}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={clsx('truncate font-medium', task.status === 'done' && 'line-through text-slate-400')}>{task.title}</div>
          {task.tags?.slice(0, 3).map((t) => (
            <span key={t} className="tag">#{t}</span>
          ))}
          {task.priority >= 3 && <span className="tag bg-red-100 text-red-700">High</span>}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {task.dueAt && (
            <>
              <span className={clsx(overdue && 'text-red-600', dueToday && 'text-amber-700')}>
                Due {fmtDate(task.dueAt)} {fmtTime(task.dueAt)}
              </span>
              {task.estimatedMinutes ? <span> • est {task.estimatedMinutes}m</span> : null}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn-outline"
          onClick={() => {
            const current = task.priority ?? 2;
            const next = Math.min(3, current + 1) as 1 | 2 | 3;
            store.updateTask(task.id, { priority: next });
          }}
        >
          +Priority
        </button>
        <button className="btn-outline" onClick={() => store.deleteTask(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
