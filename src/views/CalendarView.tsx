import { addDays, addMonths, format, isSameDay, startOfMonth, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';
import { useTasksStore } from '../store/tasks';
import { parseISO } from 'date-fns';
import TaskItem from '../components/TaskItem';

function startOfMonthGrid(d: Date) {
  const first = startOfMonth(d);
  const start = startOfWeek(first, { weekStartsOn: 1 }); // Mon
  return start;
}

function buildMonthGrid(d: Date) {
  const start = startOfMonthGrid(d);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

export default function CalendarView() {
  const store = useTasksStore();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const days = useMemo(() => buildMonthGrid(month), [month]);
  const selectedTasks = useMemo(
    () =>
      selected
        ? store.state.tasks.filter((t) => t.dueAt && isSameDay(parseISO(t.dueAt), selected))
        : [],
    [selected, store.state.tasks],
  );

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">{format(month, 'MMMM yyyy')}</div>
          <div className="text-xs text-slate-500">Click a date to see tasks due</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline" onClick={() => setMonth(addMonths(month, -1))}>Prev</button>
          <button className="btn-outline" onClick={() => setMonth(new Date())}>Today</button>
          <button className="btn-outline" onClick={() => setMonth(addMonths(month, 1))}>Next</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-xs text-slate-500 text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          const tasks = store.state.tasks.filter((t) => t.dueAt && isSameDay(parseISO(t.dueAt), d));
          const inMonth = d.getMonth() === month.getMonth();
          const isSelected = selected && isSameDay(d, selected);
          return (
            <button
              type="button"
              key={idx}
              onClick={() => setSelected(d)}
              className={`text-left card p-2 min-h-24 w-full ${inMonth ? '' : 'opacity-50'} ${
                isSelected ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              <div className="text-xs font-medium text-slate-600">{format(d, 'd')}</div>
              <div className="mt-1 space-y-1">
                {tasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="text-xs truncate px-2 py-1 rounded bg-brand-50 text-brand-900">
                    {t.title}
                  </div>
                ))}
                {tasks.length > 3 && (
                  <div className="text-xs text-slate-500">+{tasks.length - 3} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            {format(selected, 'EEE, MMM d')} — Tasks
          </div>
          {selectedTasks.length === 0 ? (
            <div className="card p-4 text-slate-500 text-sm">No tasks due this day.</div>
          ) : (
            <div className="grid gap-3">
              {selectedTasks.map((t) => (
                <TaskItem key={t.id} task={t} store={store} />)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
