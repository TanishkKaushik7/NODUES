import * as React from "react";

const Textarea = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  const baseClasses = [
    "flex min-h-[80px] w-full rounded-md bg-background px-3 py-2 text-sm border border-gray-200",
    "ring-offset-background placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className
  ].join(" ");

  return (
    <textarea
      className={baseClasses}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };