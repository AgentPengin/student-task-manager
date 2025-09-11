import { clsx } from 'clsx';
import type { Task } from '../types';
import type { TasksStore } from '../store/tasks';
import { fmtDate, fmtTime, isDueToday, isOverdue } from '../lib/date';
import { useState } from 'react';
import { useSnackbar } from './Snackbar';

export default function TaskItem({ task, store, onFocusSelect }: { task: Task; store: TasksStore; onFocusSelect?: (id: string) => void }) {
  const { show } = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState<string>(task.dueAt ? task.dueAt.slice(0, 10) : '');
  const [dueTime, setDueTime] = useState<string>(task.dueAt ? new Date(task.dueAt).toTimeString().slice(0, 5) : '');
  const [tags, setTags] = useState<string>((task.tags ?? []).join(', '));
  const overdue = isOverdue(task.dueAt);
  const dueToday = isDueToday(task.dueAt);
  return (
    <div className="card p-3 md:p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
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
            {editing ? (
              <input
                className="input max-w-xl"
                value={title}
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const newTitle = title.trim() || task.title;
                    store.updateTask(task.id, { title: newTitle });
                    setEditing(false);
                  }
                  if (e.key === 'Escape') {
                    setTitle(task.title);
                    setEditing(false);
                  }
                }}
                onBlur={() => {
                  const newTitle = title.trim() || task.title;
                  if (newTitle !== task.title) store.updateTask(task.id, { title: newTitle });
                  setEditing(false);
                }}
              />
            ) : (
              <button
                className={clsx('truncate font-medium text-left', task.status === 'done' && 'line-through text-slate-400')}
                onClick={() => setEditing(true)}
                title="Click to edit title"
              >
                {task.title}
              </button>
            )}
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
          {onFocusSelect && (
            <button className="btn-outline" onClick={() => onFocusSelect(task.id)}>
              Focus
            </button>
          )}
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
          <button
            className="btn-outline"
            onClick={() => {
              // Snooze to tomorrow 18:00
              const d = new Date();
              d.setDate(d.getDate() + 1);
              d.setHours(18, 0, 0, 0);
              store.updateTask(task.id, { dueAt: d.toISOString() });
            }}
          >
            Snooze → Tomorrow 18:00
          </button>
          <button
            className="btn-outline"
            onClick={() => {
              store.softDeleteTask(task.id);
              show({
                message: 'Task deleted',
                actionLabel: 'Undo',
                onAction: () => store.restoreTask(task.id),
              });
            }}
          >
            Delete
          </button>
          <button className="btn-outline" onClick={() => setEditing((v) => !v)}>
            {editing ? 'Close' : 'Edit'}
          </button>
        </div>
      </div>

      {editing && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            className="input md:col-span-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              const newTitle = title.trim() || task.title;
              if (newTitle !== task.title) store.updateTask(task.id, { title: newTitle });
            }}
          />
          <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <input className="input" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
          <input className="input md:col-span-2" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2" />
          <div className="md:col-span-4" />
          <button
            className="btn-primary md:col-span-2"
            onClick={() => {
              let dueAt = task.dueAt;
              if (dueDate) {
                const d = new Date(dueDate);
                if (dueTime) {
                  const [h, m] = dueTime.split(':').map((x) => parseInt(x));
                  d.setHours(h, m, 0, 0);
                } else {
                  d.setHours(18, 0, 0, 0);
                }
                dueAt = d.toISOString();
              } else {
                dueAt = undefined;
              }
              const tagList = tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);
              store.updateTask(task.id, { title: title.trim() || task.title, dueAt, tags: tagList });
              setEditing(false);
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
