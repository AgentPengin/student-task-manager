import QuickAdd from '../components/QuickAdd';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import FocusTimer from '../components/FocusTimer';
import { useTasksStore } from '../store/tasks';
import { isDueToday, isOverdue } from '../lib/date';

export default function DoNow() {
  const store = useTasksStore();

  const sortTasks = (arr: typeof store.state.tasks) =>
    [...arr].sort((a, b) => {
      const da = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
      const db = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db; // earlier due first
      return (b.priority ?? 2) - (a.priority ?? 2); // higher priority first
    });
  const all = store.state.tasks;
  const overdue = sortTasks(all.filter((t) => isOverdue(t.dueAt)));
  const today = sortTasks(all.filter((t) => isDueToday(t.dueAt) && !isOverdue(t.dueAt)));
  const upcoming = sortTasks(all.filter((t) => !isDueToday(t.dueAt) && !isOverdue(t.dueAt)));

  const notDoneSorted = [...overdue, ...today, ...upcoming].filter((t) => t.status !== 'done');
  const top = notDoneSorted[0];

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <QuickAdd store={store} />
      <TaskForm store={store} />

      {top && <FocusTimer task={top} store={store} />}

      <Section title="Overdue" items={overdue} store={store} empty="No overdue tasks. Great job!" />
      <Section title="Today" items={today} store={store} empty="Nothing due today." />
      <Section title="Upcoming" items={upcoming} store={store} empty="No upcoming tasks." />
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
