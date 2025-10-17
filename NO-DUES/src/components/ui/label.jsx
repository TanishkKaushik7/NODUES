import * as React from "react";

const Label = React.forwardRef(function Label({ 
  className = "", 
  htmlFor, 
  children, 
  ...props 
}, ref) {
  // Vanilla JS implementation of the label variants
  const baseClasses = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
  
  // Simple class concatenation to replace 'cn' utility
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={combinedClasses}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";

export { Label };