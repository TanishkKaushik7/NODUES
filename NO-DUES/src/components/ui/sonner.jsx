import * as React from "react";

// Toast context for managing toasts
const ToastContext = React.createContext();

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const [theme, setTheme] = React.useState("light");

  // Detect system theme
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setTheme(e.matches ? "dark" : "light");
    
    setTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const addToast = (message, options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, ...options };
    
    setToasts((prev) => [...prev, newToast]);
    
    if (options.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, options.duration || 4000);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const updateToast = (id, newData) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...newData } : toast))
    );
  };

  // Store functions in ref to avoid recreating them
  const toastFunctions = React.useRef({
    addToast,
    removeToast,
    updateToast
  });

  // Update ref when functions change
  React.useEffect(() => {
    toastFunctions.current = {
      addToast,
      removeToast,
      updateToast
    };
  }, [addToast, removeToast, updateToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            theme={theme}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Toast component
function Toast({ toast, theme, onDismiss }) {
  return (
    <div className={`flex items-center w-full max-w-sm p-4 rounded-lg border shadow-lg transition-all ${
      theme === "dark" 
        ? "bg-gray-900 text-white border-gray-700" 
        : "bg-white text-gray-900 border-gray-200"
    }`}>
      <div className="flex-1">
        {toast.title && <div className="font-medium">{toast.title}</div>}
        <div className={`text-sm ${
          theme === "dark" ? "text-gray-300" : "text-gray-500"
        }`}>
          {toast.message}
        </div>
      </div>
      {toast.action && (
        <button
          onClick={() => {
            toast.action.onClick();
            onDismiss();
          }}
          className={`ml-4 px-3 py-1 rounded-md text-sm font-medium ${
            theme === "dark"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        className={`ml-2 p-1 rounded-full ${
          theme === "dark"
            ? "hover:bg-gray-700 text-gray-300"
            : "hover:bg-gray-100 text-gray-500"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

// Toast functions manager
const toastFunctions = {
  addToast: () => console.warn("ToastProvider not initialized"),
  removeToast: () => console.warn("ToastProvider not initialized"),
  updateToast: () => console.warn("ToastProvider not initialized")
};

// Custom toast function
export const toast = {
  success: (message, options) => {
    return toastFunctions.addToast(message, { ...options, type: "success" });
  },
  error: (message, options) => {
    return toastFunctions.addToast(message, { ...options, type: "error" });
  },
  info: (message, options) => {
    return toastFunctions.addToast(message, { ...options, type: "info" });
  },
  warning: (message, options) => {
    return toastFunctions.addToast(message, { ...options, type: "warning" });
  },
  message: (message, options) => {
    return toastFunctions.addToast(message, options);
  },
  dismiss: (id) => {
    toastFunctions.removeToast(id);
  },
  promise: (promise, messages, options) => {
    const id = toastFunctions.addToast(messages.loading, { ...options, duration: Infinity });
    
    promise
      .then(() => {
        toastFunctions.updateToast(id, { message: messages.success, duration: 4000 });
      })
      .catch(() => {
        toastFunctions.updateToast(id, { message: messages.error, duration: 4000 });
      });
      
    return id;
  }
};

// Hook to connect toast functions
export function useToastFunctions() {
  const context = React.useContext(ToastContext);
  
  React.useEffect(() => {
    if (context) {
      toastFunctions.addToast = context.addToast;
      toastFunctions.removeToast = context.removeToast;
      toastFunctions.updateToast = context.updateToast;
    }
  }, [context]);

  return context;
}

// Toaster component to initialize toast functions
export function Toaster() {
  useToastFunctions();
  return null;
}