import * as React from "react";
import { Dot } from "lucide-react";
import { cn } from "../../lib/utils";

const OTPInputContext = React.createContext({
  slots: [],
  setSlots: () => {},
  activeIndex: -1,
  setActiveIndex: () => {},
  value: "",
  setValue: () => {},
  maxLength: 6,
});

const InputOTP = React.forwardRef(function InputOTP(
  { className, containerClassName, maxLength = 6, value = "", onChange, ...props },
  ref
) {
  const [slots, setSlots] = React.useState(Array(maxLength).fill({ char: null, hasFakeCaret: false }));
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [internalValue, setInternalValue] = React.useState(value);

  const handleChange = (newValue) => {
    setInternalValue(newValue);
    if (onChange) onChange(newValue);
    
    // Update slots
    const newSlots = Array(maxLength).fill({ char: null, hasFakeCaret: false });
    for (let i = 0; i < newValue.length && i < maxLength; i++) {
      newSlots[i] = { char: newValue[i], hasFakeCaret: i === newValue.length - 1 };
    }
    setSlots(newSlots);
    setActiveIndex(Math.min(newValue.length, maxLength - 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      if (internalValue.length > 0) {
        handleChange(internalValue.slice(0, -1));
      }
    } else if (/^[0-9]$/.test(e.key) && internalValue.length < maxLength) {
      handleChange(internalValue + e.key);
    }
  };

  React.useEffect(() => {
    handleChange(value);
  }, [value]);

  return (
    <OTPInputContext.Provider
      value={{
        slots,
        setSlots,
        activeIndex,
        setActiveIndex,
        value: internalValue,
        setValue: handleChange,
        maxLength,
      }}
    >
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 has-[:disabled]:opacity-50",
          containerClassName
        )}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        {...props}
      >
        {props.children}
      </div>
    </OTPInputContext.Provider>
  );
});
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef(function InputOTPGroup(
  { className, ...props }, ref
) {
  return (
    <div ref={ref} className={cn("flex items-center", className)} {...props} />
  );
});
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef(function InputOTPSlot(
  { index, className, ...props }, ref
) {
  const { slots, activeIndex } = React.useContext(OTPInputContext);
  const { char, hasFakeCaret } = slots[index] || {};
  const isActive = index === activeIndex;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef(function InputOTPSeparator(
  { className, ...props }, ref
) {
  return (
    <div ref={ref} role="separator" className={className} {...props}>
      <Dot />
    </div>
  );
});
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };