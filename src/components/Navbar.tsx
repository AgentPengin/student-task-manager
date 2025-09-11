import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">TS</div>
          <div>
            <div className="font-semibold leading-tight">TimeStream</div>
            <div className="text-xs text-slate-500">Student time manager</div>
          </div>
        </div>
        <nav className="flex items-center gap-1 text-sm">
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
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-md ${isActive ? 'bg-brand-100 text-brand-800' : 'hover:bg-slate-100 text-slate-700'}`
      }
    >
      {label}
    </NavLink>
  );
}

