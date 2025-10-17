import * as React from "react";

// Toast Context
const ToastContext = React.createContext();

export const ToastProvider = ({ children, swipeThreshold = 50, duration = 5000 }) => {
  const [toasts, setToasts] = React.useState([]);
  const viewportRef = React.useRef(null);

  const addToast = (content, options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, content, ...options };
    
    setToasts((prev) => [...prev, newToast]);
    
    if (options.duration !== Infinity) {
      setTimeout(() => dismissToast(id), options.duration || duration);
    }
    
    return id;
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Close icon component
  const CloseIcon = () => (
    <svg
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
  );

  // Toast component
  const Toast = ({ toast }) => {
    const [swipeOffset, setSwipeOffset] = React.useState(0);
    const [isSwiping, setIsSwiping] = React.useState(false);
    const toastRef = React.useRef(null);

    const handleSwipeStart = (e) => {
      setIsSwiping(true);
      document.addEventListener('mousemove', handleSwipeMove);
      document.addEventListener('mouseup', handleSwipeEnd);
      document.addEventListener('touchmove', handleSwipeMove, { passive: false });
      document.addEventListener('touchend', handleSwipeEnd);
    };

    const handleSwipeMove = (e) => {
      if (!isSwiping) return;
      e.preventDefault();
      const clientX = e.clientX || e.touches[0].clientX;
      const rect = toastRef.current.getBoundingClientRect();
      const offsetX = clientX - rect.left - rect.width / 2;
      setSwipeOffset(offsetX);
    };

    const handleSwipeEnd = () => {
      setIsSwiping(false);
      if (Math.abs(swipeOffset) > swipeThreshold) {
        dismissToast(toast.id);
      } else {
        setSwipeOffset(0);
      }
      document.removeEventListener('mousemove', handleSwipeMove);
      document.removeEventListener('mouseup', handleSwipeEnd);
      document.removeEventListener('touchmove', handleSwipeMove);
      document.removeEventListener('touchend', handleSwipeEnd);
    };

    const variantClasses = {
      default: "bg-background text-foreground",
      destructive: "bg-destructive text-destructive-foreground"
    };

    return (
      <div
        ref={toastRef}
        className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md p-6 pr-8 shadow-lg transition-transform ${
          variantClasses[toast.variant || 'default']
        }`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onMouseDown={handleSwipeStart}
        onTouchStart={handleSwipeStart}
      >
        {toast.content}
        <button
          onClick={() => dismissToast(toast.id)}
          className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
        >
          <CloseIcon />
        </button>
      </div>
    );
  };

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      {children}
      <div
        ref={viewportRef}
        className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Toast Components
export const ToastViewport = ({ className, ...props }) => (
  <div className={className} {...props} />
);

export const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />;
});

export const ToastAction = React.forwardRef(({ className, ...props }, ref) => {
  return <button ref={ref} className={className} {...props} />;
});

export const ToastClose = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button ref={ref} className={className} {...props}>
      <svg
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
  );
});

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={`text-sm font-semibold ${className}`} {...props} />;
});

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={`text-sm opacity-90 ${className}`} {...props} />;
});

// Toast functions
export const toast = {
  default: (content, options) => ToastContext.addToast(content, options),
  success: (content, options) => ToastContext.addToast(content, { ...options, variant: 'default' }),
  destructive: (content, options) => ToastContext.addToast(content, { ...options, variant: 'destructive' }),
  dismiss: (id) => ToastContext.dismissToast(id),
};

// Hook to use toast context
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};