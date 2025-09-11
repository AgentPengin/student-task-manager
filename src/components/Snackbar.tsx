import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Snackbar = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const SnackbarCtx = createContext<{
  show: (s: Snackbar) => void;
} | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snack, setSnack] = useState<Snackbar | null>(null);
  const [visible, setVisible] = useState(false);

  const show = useCallback((s: Snackbar) => {
    setSnack(s);
    setVisible(true);
    window.clearTimeout((show as any)._t);
    (show as any)._t = window.setTimeout(() => setVisible(false), 4500);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <SnackbarCtx.Provider value={api}>
      {children}
      <div
        className={`fixed left-4 bottom-4 transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {snack && (
          <div className="card px-4 py-3 flex items-center gap-3 shadow-lg">
            <div className="text-sm text-slate-800">{snack.message}</div>
            {snack.actionLabel && snack.onAction && (
              <button
                className="btn-outline text-sm"
                onClick={() => {
                  setVisible(false);
                  snack.onAction?.();
                }}
              >
                {snack.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </SnackbarCtx.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarCtx);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

