import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CollapsibleContext = React.createContext();

const Collapsible = ({ 
  children, 
  defaultOpen = false, 
  open: controlledOpen,
  onOpenChange,
  className,
  ...props 
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : isOpen;

  const setOpen = (value) => {
    if (!isControlled) {
      setIsOpen(value);
    }
    onOpenChange?.(value);
  };

  const toggle = () => setOpen(!open);

  return (
    <CollapsibleContext.Provider value={{ open, toggle }}>
      <div 
        className={cn("shadow-sm rounded-lg", className)}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

const CollapsibleTrigger = React.forwardRef(({ 
  children, 
  className,
  asChild = false,
  ...props 
}, ref) => {
  const { open, toggle } = React.useContext(CollapsibleContext);

  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      onClick: (e) => {
        children.props.onClick?.(e);
        toggle();
      },
      ref,
      className: cn(
        "flex items-center justify-between w-full p-4 hover:shadow-md transition-shadow",
        className
      ),
      ...props
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      className={cn(
        "flex items-center justify-between w-full p-4 hover:shadow-md transition-shadow",
        className
      )}
      {...props}
    >
      {children}
      {open ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );
});

const CollapsibleContent = React.forwardRef(({ 
  children, 
  className,
  ...props 
}, ref) => {
  const { open } = React.useContext(CollapsibleContext);
  const contentRef = React.useRef(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-300",
        className
      )}
      style={{
        height: open ? `${height}px` : 0,
        boxShadow: open ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
      }}
      {...props}
    >
      <div ref={contentRef} className="p-4">
        {children}
      </div>
    </div>
  );
});

export { Collapsible, CollapsibleTrigger, CollapsibleContent };