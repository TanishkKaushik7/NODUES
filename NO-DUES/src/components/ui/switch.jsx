import * as React from "react";

const Switch = React.forwardRef(({ 
  className = "",
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  ...props 
}, ref) => {
  const [isChecked, setIsChecked] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : isChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !currentChecked;
    if (!isControlled) {
      setIsChecked(newValue);
    }
    if (onCheckedChange) {
      onCheckedChange(newValue);
    }
  };

  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={currentChecked}
      disabled={disabled}
      onClick={handleToggle}
      className={`
        peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent 
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
        focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed 
        disabled:opacity-50 ${currentChecked ? 'bg-white' : 'bg-white'} ${className}
      `}
      {...props}
    >
      <span
        className={`
          pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform 
          ${currentChecked ? 'translate-x-5 bg-blue-500' : 'translate-x-0 bg-gray-400'}
        `}
      />
    </button>
  );
});

Switch.displayName = "Switch";

export { Switch };