import type { Task } from '../types';
import type { TasksStore } from '../store/tasks';
import FocusTimer from './FocusTimer';
import { useEffect } from 'react';

export default function FocusOverlay({
  open,
  task,
  store,
  onClose,
}: {
  open: boolean;
  task: Task | null;
  store: TasksStore;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-none" />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          className={`w-full max-w-2xl transition-all duration-300 ${
            open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
          }`}
        >
          <div className="relative z-10 card p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-700">Focus Mode</div>
              <button className="btn-outline" onClick={onClose}>Exit</button>
            </div>
            {task && <FocusTimer task={task} store={store} autoStart variant="overlay" />}
            {!task && <div className="text-slate-600">No task selected.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
