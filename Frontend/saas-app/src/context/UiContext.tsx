import React, { createContext, useState, useContext, type ReactNode } from 'react';
interface UiContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export const UiProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirm({ message, onConfirm });
  };

  const handleConfirmAction = async () => {
    if (confirm) {
      await confirm.onConfirm();
    }
    setConfirm(null);
  };

  return (
    <UiContext.Provider value={{ showToast, showConfirm }}>
      {children}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded shadow-lg text-white z-[100] transition-all duration-300 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.message}
        </div>
      )}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-6">{confirm.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Cancel</button>
              <button onClick={handleConfirmAction} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
};

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) throw new Error('useUi must be used within a UiProvider');
  return context;
};