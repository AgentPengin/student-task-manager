import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">TS</div>
          <div>
            <div className="font-semibold leading-tight">TimeStream</div>
            <div className="text-xs text-slate-500">Student time manager</div>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm bg-white/70 rounded-xl p-1">
          <Tab to="/" label="Do Now" />
          <Tab to="/calendar" label="Calendar" />
          <Tab to="/analytics" label="Analytics" />
        </nav>
      </div>
    </header>
  );
}

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => {
        const active = 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow';
        const base = 'pill hover:bg-slate-100 text-slate-700';
        return isActive ? `pill ${active}` : base;
      }}
    >
      {label}
    </NavLink>
  );
}
