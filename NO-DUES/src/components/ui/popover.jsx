import * as React from "react";
import { useEffect, useRef, useState } from "react";

// Simplified cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Custom Popover implementation
const PopoverContext = React.createContext();

const Popover = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = ({ children, asChild = false, ...props }) => {
  const { setIsOpen } = React.useContext(PopoverContext);
  
  const handleClick = () => {
    setIsOpen(prev => !prev);
  };

  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      onClick: handleClick,
      ...props
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={useContext(PopoverContext).isOpen}
      {...props}
    >
      {children}
    </button>
  );
};

const PopoverContent = React.forwardRef(
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(PopoverContext);
    const contentRef = useRef(null);
    const triggerRef = useRef(null);

    // Handle click outside to close
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (contentRef.current && !contentRef.current.contains(event.target) &&
            triggerRef.current && !triggerRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, setIsOpen]);

    // Animation styles
    const getAnimationStyles = (isOpen) => {
      const base = "transition-all duration-200 ease-in-out";
      if (!isOpen) return `${base} opacity-0 scale-95`;
      return `${base} opacity-100 scale-100`;
    };

    // Positioning logic
    const getPositionStyles = (align) => {
      const positions = {
        center: "left-1/2 -translate-x-1/2",
        start: "left-0",
        end: "right-0"
      };
      return positions[align] || positions.center;
    };

    if (!isOpen) return null;

    return (
      <div
        ref={ref || contentRef}
        className={cn(
          "z-50 w-72 rounded-md bg-white p-4 text-gray-900 shadow-lg outline-none",
          getAnimationStyles(isOpen),
          getPositionStyles(align),
          className
        )}
        style={{ marginTop: `${sideOffset}px` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };