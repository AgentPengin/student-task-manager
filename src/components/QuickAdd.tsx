import { useState } from 'react';
import { parseQuickAdd } from '../lib/parseQuickAdd';
import type { TasksStore } from '../store/tasks';

export default function QuickAdd({ store }: { store: TasksStore }) {
  const [text, setText] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const parsed = parseQuickAdd(text);
    store.createTask({
      title: parsed.title,
      dueAt: parsed.dueAt,
      estimatedMinutes: parsed.estimatedMinutes,
      tags: parsed.tags,
      priority: parsed.priority,
    });
    setText('');
  }

  return (
    <form onSubmit={onSubmit} className="card p-3 md:p-4 flex items-center gap-3">
      <input
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Quick add: e.g. 'Math HW due tomorrow 17:00 ~90m #math p3' or '!!!'"
      />
      <button type="submit" className="btn-primary">Add</button>
    </form>
  );
}
