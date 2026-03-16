"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

type ToastVariant = "success" | "error" | "info" | "warn";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  exiting?: boolean;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-ft-success bg-ft-success/10 text-ft-success",
  error: "border-ft-danger bg-ft-danger/10 text-ft-danger",
  info: "border-ft-light bg-ft-light/10 text-ft-light",
  warn: "border-ft-warn bg-ft-warn/10 text-ft-warn",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded border font-mono text-sm shadow-lg backdrop-blur-sm transition-all duration-300 ${
        VARIANT_STYLES[toast.variant]
      } ${toast.exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="opacity-60 hover:opacity-100 text-xs ml-2"
      >
        &#10005;
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  const ctx: ToastContextType = {
    success: useCallback((msg: string) => addToast(msg, "success"), [addToast]),
    error: useCallback((msg: string) => addToast(msg, "error"), [addToast]),
    info: useCallback((msg: string) => addToast(msg, "info"), [addToast]),
    warn: useCallback((msg: string) => addToast(msg, "warn"), [addToast]),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-16 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={removeToast} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
