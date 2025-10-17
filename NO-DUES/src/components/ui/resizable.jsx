import * as React from "react";
import { useState, useEffect, useRef } from "react";

// Simplified cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Custom GripVertical icon (replacing lucide-react)
const GripVertical = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

const ResizablePanelGroup = ({ 
  className, 
  direction = "horizontal", 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        "flex h-full w-full",
        direction === "vertical" ? "flex-col" : "",
        className
      )}
      data-panel-group-direction={direction}
      {...props}
    >
      {children}
    </div>
  );
};

const ResizablePanel = ({ 
  className, 
  defaultSize = 50, 
  minSize = 10, 
  children, 
  ...props 
}) => {
  const [size, setSize] = useState(defaultSize);
  const panelRef = useRef(null);

  return (
    <div
      ref={panelRef}
      className={cn("relative", className)}
      style={{
        flexBasis: `${size}%`,
        minWidth: direction === "horizontal" ? `${minSize}%` : undefined,
        minHeight: direction === "vertical" ? `${minSize}%` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

const ResizableHandle = ({ 
  withHandle = true, 
  className, 
  onResize, 
  ...props 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentPos, setCurrentPos] = useState(0);
  const handleRef = useRef(null);
  const groupDirection = "horizontal"; // Would normally get from context

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const pos = groupDirection === "horizontal" ? e.clientX : e.clientY;
      setCurrentPos(pos);
      if (onResize) onResize(pos - startPos);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, groupDirection, onResize]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos(groupDirection === "horizontal" ? e.clientX : e.clientY);
    setCurrentPos(groupDirection === "horizontal" ? e.clientX : e.clientY);
  };

  return (
    <div
      ref={handleRef}
      className={cn(
        "relative flex items-center justify-center",
        "bg-gray-200 hover:bg-gray-300 transition-colors",
        groupDirection === "horizontal" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
        className
      )}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {withHandle && (
        <div className={cn(
          "z-10 flex items-center justify-center rounded-sm bg-gray-400",
          groupDirection === "horizontal" ? "h-4 w-3" : "w-4 h-3"
        )}>
          <GripVertical />
        </div>
      )}
    </div>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };