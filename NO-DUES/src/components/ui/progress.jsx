import * as React from "react";

// Simplified cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

const Progress = React.forwardRef(function Progress(
  { className, value = 0, ...props },
  ref
) {
  // Ensure value is between 0 and 100
  const progressValue = Math.min(100, Math.max(0, value || 0));
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-200", // bg-secondary replacement
        className
      )}
      role="progressbar"
      aria-valuenow={progressValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-black transition-all" // bg-primary replacement
        style={{
          transform: `translateX(-${100 - progressValue}%)`,
          transitionProperty: 'transform',
          transitionDuration: '400ms',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };