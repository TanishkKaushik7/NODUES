import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

const Checkbox = React.forwardRef(({ 
  className,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  ...props 
}, ref) => {
  const [isChecked, setIsChecked] = React.useState(defaultChecked || false);

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleChange = (e) => {
    if (disabled) return;
    const newChecked = !isChecked;
    if (checked === undefined) {
      setIsChecked(newChecked);
    }
    onCheckedChange?.(newChecked);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleChange}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm",
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "shadow-sm hover:shadow-md transition-shadow",
        isChecked ? "bg-primary text-primary-foreground shadow-md" : "bg-background shadow-sm",
        className
      )}
      data-state={isChecked ? "checked" : "unchecked"}
      {...props}
    >
      {isChecked && <Check className="h-4 w-4" />}
    </button>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };