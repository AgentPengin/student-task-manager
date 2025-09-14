import { clsx } from 'clsx';
import type { Task } from '../types';
import type { TasksStore } from '../store/tasks';
import { fmtDate, fmtTime, isDueToday, isOverdue } from '../lib/date';
import { useRef, useState } from 'react';
import { EllipsisVertical, AlarmClock, Pencil, Trash2, ArrowUp, ArrowDown, CheckSquare } from 'lucide-react';
import { useSnackbar } from './Snackbar';

export default function TaskItem({ task, store, onFocusSelect }: { task: Task; store: TasksStore; onFocusSelect?: (id: string) => void }) {
  const { show } = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState<string>(task.dueAt ? task.dueAt.slice(0, 10) : '');
  const [dueTime, setDueTime] = useState<string>(task.dueAt ? new Date(task.dueAt).toTimeString().slice(0, 5) : '');
  const [tags, setTags] = useState<string>((task.tags ?? []).join(', '));
  const [subTitle, setSubTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [subOpen, setSubOpen] = useState((task.subtasks?.length ?? 0) > 0);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const overdue = isOverdue(task.dueAt);
  const dueToday = isDueToday(task.dueAt);

  const subTotal = (task.subtasks ?? []).length;
  const subDone = (task.subtasks ?? []).filter((s) => s.done).length;
  const subPct = subTotal ? Math.round((subDone / subTotal) * 100) : 0;
  const priorityColor = task.priority >= 3 ? 'border-l-red-500' : task.priority === 2 ? 'border-l-amber-500' : 'border-l-emerald-500';

  return (
    <div className={clsx('card p-3 md:p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow border-l-4 overflow-visible', priorityColor, menuOpen && 'relative z-50')}>
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
            {task.tags && task.tags.length > 3 && (
              <span className="tag">+{task.tags.length - 3}</span>
            )}
            {task.priority >= 3 && <span className="tag bg-red-100 text-red-700">High</span>}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            {task.dueAt && (
              <span
                className={clsx(
                  'tag',
                  overdue && 'bg-red-100 text-red-700',
                  !overdue && dueToday && 'bg-amber-100 text-amber-800',
                  !overdue && !dueToday && 'bg-slate-100 text-slate-700',
                )}
              >
                {overdue ? 'Overdue' : dueToday ? 'Today' : `Due ${fmtDate(task.dueAt)} ${fmtTime(task.dueAt)}`}
              </span>
            )}
            {typeof task.estimatedMinutes === 'number' && (
              <span className="tag">est {task.estimatedMinutes}m</span>
            )}
            {subTotal > 0 && <span className="tag">{subDone}/{subTotal}</span>}
          </div>
          {subTotal > 0 && (
            <div className="mt-1 h-1 w-full rounded bg-slate-100 overflow-hidden">
              <div className="h-full bg-brand-500" style={{ width: `${subPct}%` }} />
            </div>
          )}
        </div>
        <div className="shrink-0 flex items-start gap-2">
          {onFocusSelect && (
            <button className="btn-outline" onClick={() => onFocusSelect(task.id)} aria-label="Focus this task">
              <CheckSquare size={18} className="text-brand-600" /> Focus
            </button>
          )}
          <div className="relative" ref={menuRef}>
            <button className="btn-outline" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              <EllipsisVertical size={18} className="text-slate-500" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-48 card p-1 z-50 shadow-lg max-h-60 overflow-auto">
                <button className="btn w-full justify-start" onClick={() => { setEditing(true); setMenuOpen(false); }}>
                  <Pencil size={18} className="text-amber-600" /> Edit
                </button>
                <button className="btn w-full justify-start" onClick={() => {
                  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(18,0,0,0);
                  store.updateTask(task.id, { dueAt: d.toISOString() }); setMenuOpen(false);
                }}><AlarmClock size={16} /> Snooze → Tomorrow 18:00</button>
                <button className="btn w-full justify-start" onClick={() => {
                  const current = task.priority ?? 2; const next = Math.min(3, current + 1) as 1 | 2 | 3;
                  store.updateTask(task.id, { priority: next }); setMenuOpen(false);
                }}><ArrowUp size={18} className="text-violet-600" /> Increase Priority</button>
                <button className="btn w-full justify-start" onClick={() => {
                  const current = task.priority ?? 2; const next = Math.max(1, current - 1) as 1 | 2 | 3;
                  store.updateTask(task.id, { priority: next }); setMenuOpen(false);
                }}><ArrowDown size={18} className="text-amber-600" /> Decrease Priority</button>
                <button className="btn w-full justify-start" onClick={() => {
                  store.softDeleteTask(task.id); setMenuOpen(false);
                  show({ message: 'Task deleted', actionLabel: 'Undo', onAction: () => store.restoreTask(task.id) });
                }}><Trash2 size={18} className="text-rose-600" /> Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible subtasks header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">Subtasks</div>
        <button className="btn-outline" onClick={() => setSubOpen((v) => !v)}>{subOpen ? 'Hide' : 'Show'}</button>
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

      {/* Subtasks */}
      {subOpen && (
      <div className="mt-2 space-y-2">
        {(task.subtasks ?? []).length === 0 && (
          <div className="text-xs text-slate-400">No subtasks yet.</div>
        )}
        {(task.subtasks ?? []).map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <input
              className="h-4 w-4"
              type="checkbox"
              checked={s.done}
              onChange={(e) => store.toggleSubtask(task.id, s.id, e.target.checked)}
            />
            {editing ? (
              <input
                className="input flex-1"
                defaultValue={s.title}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== s.title) store.updateSubtaskTitle(task.id, s.id, v);
                }}
              />
            ) : (
              <span className={clsx('flex-1', s.done && 'line-through text-slate-400')}>{s.title}</span>
            )}
            {editing && (
              <button className="btn-outline" onClick={() => store.deleteSubtask(task.id, s.id)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            className="input flex-1"
            placeholder="Add subtask and press Enter"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const v = subTitle.trim();
                if (v) {
                  store.addSubtask(task.id, v);
                  setSubTitle('');
                }
              }
            }}
          />
          <button
            className="btn-outline"
            onClick={() => {
              const v = subTitle.trim();
              if (!v) return;
              store.addSubtask(task.id, v);
              setSubTitle('');
            }}
          >
            Add
          </button>
        </div>
      </div>
      )}
    </div>
  );
}



