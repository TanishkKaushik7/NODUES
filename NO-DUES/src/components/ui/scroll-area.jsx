import * as React from "react";
import { useEffect, useRef, useState } from "react";

// Simplified cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

const ScrollArea = React.forwardRef(function ScrollArea(
  { className, children, ...props }, 
  ref
) {
  const viewportRef = useRef(null);
  const [showScrollbar, setShowScrollbar] = useState({
    vertical: false,
    horizontal: false
  });

  // Check if content overflows
  useEffect(() => {
    const checkOverflow = () => {
      if (viewportRef.current) {
        const { clientHeight, scrollHeight, clientWidth, scrollWidth } = viewportRef.current;
        setShowScrollbar({
          vertical: scrollHeight > clientHeight,
          horizontal: scrollWidth > clientWidth
        });
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, [children]);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div 
        ref={viewportRef}
        className="h-full w-full rounded-[inherit] overflow-auto scrollbar-hide"
      >
        {children}
      </div>
      
      {showScrollbar.vertical && (
        <ScrollBar orientation="vertical" />
      )}
      
      {showScrollbar.horizontal && (
        <ScrollBar orientation="horizontal" />
      )}
    </div>
  );
});
ScrollArea.displayName = "ScrollArea";

const ScrollBar = React.forwardRef(function ScrollBar(
  { className, orientation = "vertical", ...props }, 
  ref
) {
  const thumbRef = useRef(null);
  const scrollbarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [thumbSize, setThumbSize] = useState(0);
  const [thumbPosition, setThumbPosition] = useState(0);

  // Calculate thumb size and position
  useEffect(() => {
    const scrollbar = scrollbarRef.current?.parentElement;
    const viewport = scrollbar?.previousElementSibling;
    
    if (!scrollbar || !viewport) return;

    const updateThumb = () => {
      if (orientation === "vertical") {
        const ratio = viewport.clientHeight / viewport.scrollHeight;
        const newThumbSize = Math.max(20, ratio * scrollbar.clientHeight);
        const newPosition = (viewport.scrollTop / viewport.scrollHeight) * scrollbar.clientHeight;
        setThumbSize(newThumbSize);
        setThumbPosition(newPosition);
      } else {
        const ratio = viewport.clientWidth / viewport.scrollWidth;
        const newThumbSize = Math.max(20, ratio * scrollbar.clientWidth);
        const newPosition = (viewport.scrollLeft / viewport.scrollWidth) * scrollbar.clientWidth;
        setThumbSize(newThumbSize);
        setThumbPosition(newPosition);
      }
    };

    viewport.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);
    updateThumb();

    return () => {
      viewport.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
    };
  }, [orientation]);

  // Handle thumb dragging
  useEffect(() => {
    if (!isDragging) return;

    const scrollbar = scrollbarRef.current?.parentElement;
    const viewport = scrollbar?.previousElementSibling;
    
    if (!scrollbar || !viewport) return;

    const handleMouseMove = (e) => {
      const rect = scrollbar.getBoundingClientRect();
      let newPosition;
      
      if (orientation === "vertical") {
        newPosition = e.clientY - rect.top - (startPos - thumbPosition);
        const maxPosition = scrollbar.clientHeight - thumbSize;
        const scrollRatio = Math.min(maxPosition, Math.max(0, newPosition)) / maxPosition;
        viewport.scrollTop = scrollRatio * (viewport.scrollHeight - viewport.clientHeight);
      } else {
        newPosition = e.clientX - rect.left - (startPos - thumbPosition);
        const maxPosition = scrollbar.clientWidth - thumbSize;
        const scrollRatio = Math.min(maxPosition, Math.max(0, newPosition)) / maxPosition;
        viewport.scrollLeft = scrollRatio * (viewport.scrollWidth - viewport.clientWidth);
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, thumbPosition, thumbSize, orientation]);

  const handleThumbMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos(orientation === "vertical" ? e.clientY : e.clientX);
  };

  return (
    <div
      ref={scrollbarRef}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" 
          ? "h-full w-2.5 p-[1px]" 
          : "h-2.5 w-full p-[1px]",
        className
      )}
      {...props}
    >
      <div
        ref={ref}
        className="relative flex-1"
        onClick={(e) => {
          // Handle track click for jumping scroll position
          const scrollbar = e.currentTarget.parentElement?.parentElement;
          const viewport = scrollbar?.previousElementSibling;
          if (!viewport) return;

          const rect = e.currentTarget.getBoundingClientRect();
          const clickPos = orientation === "vertical" 
            ? e.clientY - rect.top 
            : e.clientX - rect.left;
          const thumbCenter = thumbPosition + (thumbSize / 2);
          
          if (orientation === "vertical") {
            const scrollRatio = (clickPos - (thumbSize / 2)) / (rect.height - thumbSize);
            viewport.scrollTop = scrollRatio * (viewport.scrollHeight - viewport.clientHeight);
          } else {
            const scrollRatio = (clickPos - (thumbSize / 2)) / (rect.width - thumbSize);
            viewport.scrollLeft = scrollRatio * (viewport.scrollWidth - viewport.clientWidth);
          }
        }}
      >
        <div
          ref={thumbRef}
          className={cn(
            "relative rounded-full bg-gray-400 hover:bg-gray-500",
            "transition-colors duration-200",
            isDragging && "bg-gray-600"
          )}
          style={{
            [orientation === "vertical" ? "height" : "width"]: `${thumbSize}px`,
            [orientation === "vertical" ? "top" : "left"]: `${thumbPosition}px`,
            [orientation === "vertical" ? "width" : "height"]: "100%",
          }}
          onMouseDown={handleThumbMouseDown}
        />
      </div>
    </div>
  );
});
ScrollBar.displayName = "ScrollBar";



export { ScrollArea, ScrollBar };