import * as React from "react";

const toggleVariants = {
  base: [
    "inline-flex items-center justify-center rounded-md text-sm font-medium",
    "ring-offset-background transition-colors",
    "hover:bg-muted hover:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
  ].join(" "),
  variants: {
    default: "bg-transparent",
    outline: [
      "border border-input bg-transparent",
      "hover:bg-accent hover:text-accent-foreground"
    ].join(" ")
  },
  sizes: {
    default: "h-10 px-3",
    sm: "h-9 px-2.5",
    lg: "h-11 px-5"
  }
};

const Toggle = React.forwardRef(({
  className = "",
  variant = "default",
  size = "default",
  pressed,
  defaultPressed,
  onPressedChange,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = React.useState(defaultPressed || false);
  const isControlled = pressed !== undefined;
  const currentPressed = isControlled ? pressed : isPressed;

  const handleToggle = () => {
    const newValue = !currentPressed;
    if (!isControlled) {
      setIsPressed(newValue);
    }
    if (onPressedChange) {
      onPressedChange(newValue);
    }
  };

  const getVariantClasses = () => {
    return [
      toggleVariants.base,
      toggleVariants.variants[variant],
      toggleVariants.sizes[size],
      currentPressed ? "bg-accent text-accent-foreground" : "",
      className
    ].join(" ");
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-pressed={currentPressed}
      className={getVariantClasses()}
      onClick={handleToggle}
      data-state={currentPressed ? "on" : "off"}
      {...props}
    />
  );
});
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };