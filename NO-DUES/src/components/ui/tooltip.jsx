import * as React from "react";

const TooltipContext = React.createContext();

const TooltipProvider = ({ delayDuration = 300, skipDelayDuration = 300, children }) => {
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [timeoutId, setTimeoutId] = React.useState(null);

  const showTooltip = (content, target) => {
    clearTimeout(timeoutId);
    const rect = target.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX + (rect.width / 2)
    });
    setContent(content);
    
    const id = setTimeout(() => {
      setOpen(true);
    }, delayDuration);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setOpen(false);
  };

  return (
    <TooltipContext.Provider value={{ open, showTooltip, hideTooltip, content, position }}>
      {children}
    </TooltipContext.Provider>
  );
};

const Tooltip = ({ children }) => {
  return <>{children}</>;
};

const TooltipTrigger = React.forwardRef(({ asChild, children, content, ...props }, ref) => {
  const { showTooltip, hideTooltip } = React.useContext(TooltipContext);
  const child = React.Children.only(children);
  
  const handleMouseEnter = (e) => {
    if (child.props.onMouseEnter) child.props.onMouseEnter(e);
    if (content) showTooltip(content, e.currentTarget);
  };

  const handleMouseLeave = (e) => {
    if (child.props.onMouseLeave) child.props.onMouseLeave(e);
    hideTooltip();
  };

  return React.cloneElement(child, {
    ref,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...props
  });
});

const TooltipContent = React.forwardRef(({ 
  className = "", 
  side = "top", 
  sideOffset = 4, 
  align = "center",
  children, 
  ...props 
}, ref) => {
  const { open, content, position } = React.useContext(TooltipContext);
  
  if (!open) return null;

  const alignment = {
    top: `bottom-full left-1/2 -translate-x-1/2 mb-${sideOffset}`,
    right: `left-full top-1/2 -translate-y-1/2 ml-${sideOffset}`,
    bottom: `top-full left-1/2 -translate-x-1/2 mt-${sideOffset}`,
    left: `right-full top-1/2 -translate-y-1/2 mr-${sideOffset}`,
  };

  return (
    <div
      ref={ref}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className={`
        fixed z-50 max-w-xs rounded-md bg-popover px-3 py-1.5 text-sm 
        text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 
        ${alignment[side]} ${className}
      `}
      {...props}
    >
      {children || content}
    </div>
  );
});

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };