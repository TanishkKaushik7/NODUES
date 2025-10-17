import * as React from "react";

const Slider = React.forwardRef(({ 
  className = "",
  value: propValue,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  ...props 
}, ref) => {
  const [value, setValue] = React.useState(defaultValue || propValue || [min]);
  const sliderRef = React.useRef(null);
  const thumbRef = React.useRef(null);
  const isControlled = propValue !== undefined;

  const currentValue = isControlled ? propValue : value;

  React.useImperativeHandle(ref, () => ({
    value: currentValue,
    setValue: (val) => {
      if (!isControlled) {
        setValue(val);
      }
      if (onValueChange) {
        onValueChange(val);
      }
    }
  }));

  const handleChange = (newValue) => {
    if (!isControlled) {
      setValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const calculatePercentage = (val) => {
    return ((val - min) / (max - min)) * 100;
  };

  const handleTrackClick = (e) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    
    handleChange([steppedValue]);
  };

  const handleThumbDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startValue = currentValue[0];

    const handleMouseMove = (moveEvent) => {
      if (!sliderRef.current) return;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const offsetX = moveEvent.clientX - rect.left;
      const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      
      handleChange([steppedValue]);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={sliderRef}
      className={`relative flex w-full touch-none select-none items-center ${className}`}
      onClick={handleTrackClick}
      {...props}
    >
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div 
          className="absolute h-full bg-primary"
          style={{ width: `${calculatePercentage(currentValue[0])}%` }}
        />
      </div>
      <div
        ref={thumbRef}
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md shadow-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        style={{ left: `${calculatePercentage(currentValue[0])}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleThumbDrag}
        tabIndex={0}
      />
    </div>
  );
});

Slider.displayName = "Slider";

export { Slider };