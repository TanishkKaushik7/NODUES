import * as React from "react";
import { cn } from "../../lib/utils";

const HoverCardContext = React.createContext({
  open: false,
  setOpen: () => {},
});

const HoverCard = ({ children, ...props }) => {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef(null);
  const hoverRef = React.useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 100);
  };

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <HoverCardContext.Provider value={{ open, setOpen }}>
      <div
        ref={hoverRef}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
};

const useHoverCard = () => {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error("HoverCard components must be wrapped in a <HoverCard>");
  }
  return context;
};

const HoverCardTrigger = React.forwardRef(({ children, ...props }, ref) => {
  const { setOpen } = useHoverCard();
  
  return React.cloneElement(React.Children.only(children), {
    ref,
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    ...props
  });
});

const HoverCardContent = React.forwardRef(({
  className,
  align = "center",
  sideOffset = 4,
  children,
  ...props
}, ref) => {
  const { open } = useHoverCard();
  const contentRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  // Position the content relative to the trigger
  React.useEffect(() => {
    if (open && contentRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      let top = triggerRect.bottom + sideOffset;
      let left = triggerRect.left;

      // Handle alignment
      if (align === "center") {
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
      } else if (align === "end") {
        left = triggerRect.right - contentRect.width;
      }

      // Adjust for window edges
      if (left + contentRect.width > window.innerWidth) {
        left = window.innerWidth - contentRect.width - 8;
      }
      if (left < 0) left = 8;

      contentRef.current.style.top = `${top + window.scrollY}px`;
      contentRef.current.style.left = `${left + window.scrollX}px`;
    }
  }, [open, align, sideOffset]);

  if (!open) return null;

  return (
    <div
      ref={(node) => {
        contentRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "fixed z-50 w-64 rounded-md bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </div>
  );
});

export { HoverCard, HoverCardTrigger, HoverCardContent };