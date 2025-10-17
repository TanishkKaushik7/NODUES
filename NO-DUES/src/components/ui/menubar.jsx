import * as React from "react";
import { useState, useRef, useEffect } from "react";

// Helper function to replace 'cn'
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Custom icons to replace lucide-react
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="0" />
  </svg>
);

// Context for menu management
const MenuContext = React.createContext();
const SubMenuContext = React.createContext();

// Portal implementation
const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef(null);

  useEffect(() => {
    portalRef.current = document.createElement("div");
    document.body.appendChild(portalRef.current);
    setMounted(true);
    return () => {
      document.body.removeChild(portalRef.current);
    };
  }, []);

  return mounted ? ReactDOM.createPortal(children, portalRef.current) : null;
};

// Animation styles
const animationStyles = {
  fadeIn: {
    opacity: 1,
    transition: "opacity 100ms ease-out",
  },
  fadeOut: {
    opacity: 0,
    transition: "opacity 75ms ease-in",
  },
  zoomIn: {
    transform: "scale(1)",
    transition: "transform 100ms ease-out",
  },
  zoomOut: {
    transform: "scale(0.95)",
    transition: "transform 75ms ease-in",
  },
  slideInFromTop: {
    transform: "translateY(-5px)",
    transition: "transform 100ms ease-out",
  },
  slideInFromRight: {
    transform: "translateX(5px)",
    transition: "transform 100ms ease-out",
  },
  slideInFromBottom: {
    transform: "translateY(5px)",
    transition: "transform 100ms ease-out",
  },
  slideInFromLeft: {
    transform: "translateX(-5px)",
    transition: "transform 100ms ease-out",
  },
};

// Menu components
const Menubar = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-10 items-center space-x-1 rounded-md bg-background p-1 shadow-sm",
        className
      )}
      role="menubar"
      {...props}
    >
      {children}
    </div>
  );
});
Menubar.displayName = "Menubar";

const MenubarMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div 
        ref={menuRef} 
        className="relative" 
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
};

const MenubarTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { setOpen, open } = React.useContext(MenuContext);
  
  const handleClick = () => setOpen(prev => !prev);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <button
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground shadow-sm",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-haspopup="menu"
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  );
});
MenubarTrigger.displayName = "MenubarTrigger";

const MenubarContent = React.forwardRef(
  ({ className, align = "start", sideOffset = 8, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(MenuContext);
    const [animationState, setAnimationState] = useState("closed");
    const contentRef = useRef(null);

    useEffect(() => {
      if (open) {
        setAnimationState("opening");
        const timer = setTimeout(() => setAnimationState("open"), 10);
        return () => clearTimeout(timer);
      } else {
        setAnimationState("closing");
        const timer = setTimeout(() => setAnimationState("closed"), 100);
        return () => clearTimeout(timer);
      }
    }, [open]);

    useEffect(() => {
      if (contentRef.current && open) {
        contentRef.current.focus();
      }
    }, [open]);

    if (!open && animationState === "closed") return null;

    const getAnimationStyles = () => {
      const baseStyles = {
        opacity: animationState === "opening" || animationState === "open" ? 1 : 0,
        transform: animationState === "opening" || animationState === "open" ? "scale(1)" : "scale(0.95)",
      };
      
      return {
        ...baseStyles,
        ...(animationState === "opening" && animationStyles.fadeIn),
        ...(animationState === "closing" && animationStyles.fadeOut),
      };
    };

    return (
      <Portal>
        <div
          ref={ref}
          className={cn(
            "z-50 min-w-[12rem] overflow-hidden rounded-md bg-popover p-1 text-popover-foreground shadow-lg",
            className
          )}
          style={{
            position: "absolute",
            top: `calc(100% + ${sideOffset}px)`,
            left: align === "start" ? "0" : "auto",
            right: align === "end" ? "0" : "auto",
            ...getAnimationStyles()
          }}
          tabIndex={-1}
          role="menu"
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  }
);
MenubarContent.displayName = "MenubarContent";

const MenubarItem = React.forwardRef(({ className, inset, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      role="menuitem"
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>
  );
});
MenubarItem.displayName = "MenubarItem";

const MenubarCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <CheckIcon />}
      </span>
      {children}
    </div>
  );
});
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

const MenubarRadioItem = React.forwardRef(({ className, children, checked, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={-1}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <CircleIcon />}
      </span>
      {children}
    </div>
  );
});
MenubarRadioItem.displayName = "MenubarRadioItem";

const MenubarSub = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <SubMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </SubMenuContext.Provider>
  );
};

const MenubarSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => {
  const { setOpen } = React.useContext(SubMenuContext);
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      onClick={() => setOpen(true)}
      role="menuitem"
      tabIndex={-1}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </div>
  );
});
MenubarSubTrigger.displayName = "MenubarSubTrigger";

const MenubarSubContent = React.forwardRef(({ className, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SubMenuContext);
  const [animationState, setAnimationState] = useState("closed");
  const contentRef = useRef(null);

  useEffect(() => {
    if (open) {
      setAnimationState("opening");
      const timer = setTimeout(() => setAnimationState("open"), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimationState("closing");
      const timer = setTimeout(() => setAnimationState("closed"), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!open && animationState === "closed") return null;

  const getAnimationStyles = () => {
    const baseStyles = {
      opacity: animationState === "opening" || animationState === "open" ? 1 : 0,
      transform: animationState === "opening" || animationState === "open" ? "scale(1)" : "scale(0.95)",
    };
    
    return {
      ...baseStyles,
      ...(animationState === "opening" && animationStyles.fadeIn),
      ...(animationState === "closing" && animationStyles.fadeOut),
    };
  };

  return (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md bg-popover p-1 text-popover-foreground shadow-lg",
        className
      )}
      style={{
        position: "absolute",
        left: "100%",
        top: 0,
        ...getAnimationStyles()
      }}
      role="menu"
      {...props}
    >
      {props.children}
    </div>
  );
});
MenubarSubContent.displayName = "MenubarSubContent";

const MenubarLabel = React.forwardRef(({ className, inset, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      role="presentation"
      {...props}
    />
  );
});
MenubarLabel.displayName = "MenubarLabel";

const MenubarSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      role="separator"
      {...props}
    />
  );
});
MenubarSeparator.displayName = "MenubarSeparator";

const MenubarShortcut = ({ className, ...props }) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  );
};
MenubarShortcut.displayName = "MenubarShortcut";

// Group and RadioGroup components
const MenubarGroup = ({ children }) => (
  <div role="group">{children}</div>
);

const MenubarRadioGroup = ({ children, ...props }) => (
  <div role="radiogroup" {...props}>
    {children}
  </div>
);

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  Portal as MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};