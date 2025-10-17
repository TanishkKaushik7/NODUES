import * as React from "react";

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
});

const toggleVariants = {
  default: "bg-transparent hover:bg-muted hover:text-muted-foreground",
  outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  size: {
    default: "h-10 px-3",
    sm: "h-9 px-2.5",
    lg: "h-11 px-5",
  },
};

const ToggleGroup = React.forwardRef(({
  className = "",
  variant = "default",
  size = "default",
  type = "single",
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}, ref) => {
  const [localValue, setLocalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : localValue;

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setLocalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div
      ref={ref}
      className={`flex items-center justify-center gap-1 ${className}`}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ 
        variant, 
        size,
        type,
        value: currentValue,
        onValueChange: handleValueChange
      }}>
        {children}
      </ToggleGroupContext.Provider>
    </div>
  );
});
ToggleGroup.displayName = "ToggleGroup";

const ToggleGroupItem = React.forwardRef(({
  className = "",
  value,
  children,
  variant: propVariant,
  size: propSize,
  ...props
}, ref) => {
  const context = React.useContext(ToggleGroupContext);
  const variant = propVariant || context.variant;
  const size = propSize || context.size;
  const isActive = context.value === value || 
                  (Array.isArray(context.value) && context.value.includes(value));

  const handleClick = () => {
    if (context.type === "single") {
      context.onValueChange(value === context.value ? "" : value);
    } else {
      const currentValues = Array.isArray(context.value) ? context.value : [];
      const newValue = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      context.onValueChange(newValue);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-pressed={isActive}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        disabled:pointer-events-none disabled:opacity-50
        ${toggleVariants[variant]} 
        ${toggleVariants.size[size]}
        ${isActive ? 'bg-accent text-accent-foreground' : ''}
        ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };