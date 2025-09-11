import QuickAdd from '../components/QuickAdd';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import FocusTimer from '../components/FocusTimer';
import { useTasksStore } from '../store/tasks';
import { isDueToday, isOverdue } from '../lib/date';
import { useState } from 'react';

export default function DoNow() {
  const store = useTasksStore();

  const sortTasks = (arr: typeof store.state.tasks) =>
    [...arr].sort((a, b) => {
      const da = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
      const db = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db; // earlier due first
      return (b.priority ?? 2) - (a.priority ?? 2); // higher priority first
    });
  const [query, setQuery] = useState('');
  const [prio, setPrio] = useState<0 | 1 | 2 | 3>(0); // 0=all
  const [showCompleted, setShowCompleted] = useState(false);

  const matchesFilter = (title: string, tags: string[] = []) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return title.toLowerCase().includes(q) || tags.some((t) => t.toLowerCase().includes(q));
  };

  const all = store.state.tasks.filter((t) => matchesFilter(t.title, t.tags) && (prio === 0 || (t.priority ?? 2) === prio));
  const overdue = sortTasks(all.filter((t) => isOverdue(t.dueAt)));
  const today = sortTasks(all.filter((t) => isDueToday(t.dueAt) && !isOverdue(t.dueAt)));
  const upcoming = sortTasks(all.filter((t) => !isDueToday(t.dueAt) && !isOverdue(t.dueAt)));

  const notDoneSorted = [...overdue, ...today, ...upcoming].filter((t) => t.status !== 'done');
  const top = notDoneSorted[0];

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      {/* Filters */}
      <div className="card p-3 md:p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input className="input md:col-span-3" placeholder="Search title or #tag" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input md:col-span-1" value={prio} onChange={(e) => setPrio(Number(e.target.value) as any)}>
          <option value={0}>All priorities</option>
          <option value={3}>High</option>
          <option value={2}>Medium</option>
          <option value={1}>Low</option>
        </select>
        <label className="inline-flex items-center gap-2 md:col-span-2">
          <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
          <span className="text-sm text-slate-700">Show Completed</span>
        </label>
      </div>
      <QuickAdd store={store} />
      <TaskForm store={store} />

      {top && <FocusTimer task={top} store={store} />}

      <Section title="Overdue" items={overdue.filter((t)=> showCompleted || t.status!=='done')} store={store} empty="No overdue tasks. Great job!" />
      <Section title="Today" items={today.filter((t)=> showCompleted || t.status!=='done')} store={store} empty="Nothing due today." />
      <Section title="Upcoming" items={upcoming.filter((t)=> showCompleted || t.status!=='done')} store={store} empty="No upcoming tasks." />

      {showCompleted && (
        <Section
          title="Completed"
          items={sortTasks(store.state.tasks.filter((t) => t.status === 'done'))}
          store={store}
          empty="No completed tasks yet."
        />
      )}
    </div>
  );
}

function Section({
  title,
  items,
  store,
  empty,
}: {
  title: string;
  items: ReturnType<typeof useTasksStore>['openTasks'];
  store: ReturnType<typeof useTasksStore>;
  empty: string;
}) {
  return (
    <section className="space-y-3">
      <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{title}</div>
      {items.length === 0 ? (
        <div className="card p-4 text-slate-500 text-sm">{empty}</div>
      ) : (
        <div className="grid gap-3">
          {items.map((t) => (
            <TaskItem key={t.id} task={t} store={store} />
          ))}
        </div>
      )}
    </section>
  );
}
