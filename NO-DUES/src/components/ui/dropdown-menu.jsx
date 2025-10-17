import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

// Context for managing dropdown state
const DropdownContext = React.createContext({
  isOpen: false,
  setIsOpen: () => {},
  subMenuOpen: {},
  setSubMenuOpen: () => {},
  position: { x: 0, y: 0 },
  setPosition: () => {}
});

const DropdownMenu = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [subMenuOpen, setSubMenuOpen] = React.useState({});
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSubMenuOpen({});
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider 
      value={{ 
        isOpen, 
        setIsOpen, 
        subMenuOpen, 
        setSubMenuOpen,
        position,
        setPosition
      }}
    >
      <div 
        ref={triggerRef}
        className="relative inline-block" 
        {...props}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const useDropdown = () => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be wrapped in a <DropdownMenu>");
  }
  return context;
};

const DropdownMenuTrigger = React.forwardRef(({ children, ...props }, ref) => {
  const { setIsOpen, isOpen, setPosition } = useDropdown();
  const triggerRef = React.useRef(null);

  React.useImperativeHandle(ref, () => triggerRef.current);

  const handleClick = (e) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY
      });
    }
    setIsOpen(!isOpen);
  };

  return React.cloneElement(React.Children.only(children), {
    ref: (node) => {
      triggerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    onClick: handleClick,
    ...props
  });
});

const DropdownMenuContent = React.forwardRef(({ 
  className, 
  sideOffset = 4, 
  children, 
  ...props 
}, ref) => {
  const { isOpen, position } = useDropdown();
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.left = `${position.x}px`;
      contentRef.current.style.top = `${position.y + sideOffset}px`;
    }
  }, [isOpen, position, sideOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={(node) => {
        contentRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden rounded-md bg-popover p-1 text-popover-foreground shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const DropdownMenuItem = React.forwardRef(({ 
  className, 
  inset, 
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "transition-colors focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const DropdownMenuCheckboxItem = React.forwardRef(({ 
  className, 
  children, 
  checked, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "transition-colors focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});

const DropdownMenuRadioItem = React.forwardRef(({ 
  className, 
  children, 
  checked, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "transition-colors focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Circle className="h-2 w-2 fill-current" />}
      </span>
      {children}
    </div>
  );
});

const DropdownMenuLabel = React.forwardRef(({ 
  className, 
  inset, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
});

const DropdownMenuSeparator = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
});

const DropdownMenuShortcut = ({ className, ...props }) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};

// Submenu components
const DropdownMenuSub = ({ children }) => {
  return <>{children}</>;
};

const DropdownMenuSubTrigger = React.forwardRef(({ 
  className, 
  inset, 
  children, 
  ...props 
}, ref) => {
  const { subMenuOpen, setSubMenuOpen } = useDropdown();
  const subTriggerRef = React.useRef(null);
  const subMenuId = React.useId();

  const handleMouseEnter = () => {
    setSubMenuOpen(prev => ({ ...prev, [subMenuId]: true }));
  };

  const handleMouseLeave = () => {
    setSubMenuOpen(prev => ({ ...prev, [subMenuId]: false }));
  };

  return (
    <div
      ref={(node) => {
        subTriggerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-accent data-[state=open]:bg-accent",
        inset && "pl-8",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
      {subMenuOpen[subMenuId] && (
        <DropdownMenuSubContent
          style={{
            left: subTriggerRef.current?.offsetWidth,
            top: 0
          }}
        >
          {props.subContent}
        </DropdownMenuSubContent>
      )}
    </div>
  );
});

const DropdownMenuSubContent = React.forwardRef(({ 
  className, 
  children, 
  style, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md bg-popover p-1 text-popover-foreground shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
});

const DropdownMenuGroup = ({ children }) => {
  return <div className="flex flex-col gap-1">{children}</div>;
};

const DropdownMenuRadioGroup = ({ children }) => {
  return <div className="flex flex-col gap-1">{children}</div>;
};

// Portal is just a pass-through in this implementation
const DropdownMenuPortal = ({ children }) => {
  return <>{children}</>;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};