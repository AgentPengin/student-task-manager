import { useState } from 'react';
import type { TasksStore } from '../store/tasks';

export default function TaskForm({ store }: { store: TasksStore }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [estimate, setEstimate] = useState<number>(60);
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [tags, setTags] = useState<string>('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    let dueAt: string | undefined;
    if (due) {
      const d = new Date(due);
      if (time) {
        const [h, m] = time.split(':').map((x) => parseInt(x));
        d.setHours(h, m, 0, 0);
      } else {
        d.setHours(18, 0, 0, 0);
      }
      dueAt = d.toISOString();
    }
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    store.createTask({ title, dueAt, estimatedMinutes: estimate, priority, tags: tagList });
    setTitle('');
    setDue('');
    setTime('');
    setEstimate(60);
    setPriority(2);
    setTags('');
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
      <input className="input md:col-span-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <input
        className="input"
        type="number"
        min={5}
        step={5}
        value={estimate}
        onChange={(e) => setEstimate(parseInt(e.target.value))}
        placeholder="Estimate (min)"
      />
      <select className="input" value={priority} onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}>
        <option value={1}>Low</option>
        <option value={2}>Medium</option>
        <option value={3}>High</option>
      </select>
      <input className="input md:col-span-2" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
      <div className="md:col-span-4" />
      <button className="btn-primary md:col-span-2" type="submit">Create Task</button>
    </form>
  );
}
