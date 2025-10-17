import * as React from "react";
import { useEffect, useRef } from "react";

// Simplified cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Custom Radio Group Context
const RadioGroupContext = React.createContext();

const RadioGroup = React.forwardRef(function RadioGroup(
  { className, value, defaultValue, onValueChange, ...props },
  ref
) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');

  const handleValueChange = (newValue) => {
    setInternalValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  return (
    <RadioGroupContext.Provider value={{ value: value || internalValue, onValueChange: handleValueChange }}>
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      />
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

// Custom Radio Indicator (replacing Circle icon from lucide-react)
const RadioIndicator = () => (
  <div className="flex items-center justify-center">
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className="fill-current text-current"
    >
      <circle cx="5" cy="5" r="5" />
    </svg>
  </div>
);

const RadioGroupItem = React.forwardRef(function RadioGroupItem(
  { className, value, disabled = false, ...props },
  ref
) {
  const { value: groupValue, onValueChange } = React.useContext(RadioGroupContext);
  const inputRef = useRef(null);

  const isChecked = groupValue === value;

  // Focus visible polyfill for better accessibility
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        input.click();
      }
    };

    input.addEventListener('keydown', handleKeyDown);
    return () => input.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isChecked}
      disabled={disabled}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border-2 border-gray-300 shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "border-blue-500" : "hover:border-gray-400",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      <input
        ref={inputRef}
        type="radio"
        className="sr-only"
        value={value}
        checked={isChecked}
        onChange={() => {}}
        disabled={disabled}
      />
      {isChecked && <RadioIndicator />}
    </button>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };