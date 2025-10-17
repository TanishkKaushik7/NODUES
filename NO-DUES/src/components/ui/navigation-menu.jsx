import * as React from "react";
import { useState, useRef, useEffect } from "react";

// Helper function to replace 'cn'
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Custom ChevronDown icon to replace lucide-react
const ChevronDownIcon = ({ className }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className={className}
  >
    <path
      d="M6 9l6 6 6-6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Animation styles
const animationStyles = {
  fadeIn: {
    animation: "fadeIn 150ms ease-out",
  },
  fadeOut: {
    animation: "fadeOut 150ms ease-in",
  },
  slideInFromLeft: {
    animation: "slideInFromLeft 200ms ease-out",
  },
  slideInFromRight: {
    animation: "slideInFromRight 200ms ease-out",
  },
  slideOutToLeft: {
    animation: "slideOutToLeft 200ms ease-in",
  },
  slideOutToRight: {
    animation: "slideOutToRight 200ms ease-in",
  },
  zoomIn: {
    animation: "zoomIn 200ms ease-out",
  },
  zoomOut: {
    animation: "zoomOut 200ms ease-in",
  },
};



// Context for navigation menu
const NavigationMenuContext = React.createContext();

// Trigger style function to replace cva
const navigationMenuTriggerStyle = (className = "") => cn(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
  className
);

const NavigationMenu = React.forwardRef(({ className, children, ...props }, ref) => {
  const [activeItem, setActiveItem] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const viewportRef = useRef(null);

  useEffect(() => {
    // Add animation styles to head
    const style = document.createElement("style");
    style.innerHTML = animationCSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const updateViewportSize = () => {
    if (viewportRef.current) {
      setViewportHeight(viewportRef.current.offsetHeight);
      setViewportWidth(viewportRef.current.offsetWidth);
    }
  };

  return (
    <NavigationMenuContext.Provider value={{ activeItem, setActiveItem, viewportHeight, viewportWidth }}>
      <div
        ref={ref}
        className={cn(
          "relative z-10 flex max-w-max flex-1 items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
        <NavigationMenuViewport ref={viewportRef} />
      </div>
    </NavigationMenuContext.Provider>
  );
});
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn(
        "group flex flex-1 list-none items-center justify-center space-x-1",
        className
      )}
      {...props}
    />
  );
});
NavigationMenuList.displayName = "NavigationMenuList";

const NavigationMenuItem = ({ children, ...props }) => {
  const { setActiveItem } = React.useContext(NavigationMenuContext);
  return (
    <li
      onMouseEnter={() => setActiveItem(props.value)}
      onMouseLeave={() => setActiveItem(null)}
      {...props}
    >
      {children}
    </li>
  );
};

const NavigationMenuTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <button
      ref={ref}
      className={navigationMenuTriggerStyle(className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className={`relative top-[1px] ml-1 h-3 w-3 transition duration-200 ${isOpen ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
});
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

const NavigationMenuContent = React.forwardRef(({ className, motion = "from-start", ...props }, ref) => {
  const { activeItem, viewportWidth } = React.useContext(NavigationMenuContext);
  const [isVisible, setIsVisible] = useState(false);
  const [animation, setAnimation] = useState("");
  const contentRef = useRef(null);

  useEffect(() => {
    if (activeItem) {
      setIsVisible(true);
      setAnimation(`data-motion=${motion}`);
    } else {
      setAnimation("data-motion=to-start");
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [activeItem, motion]);

  if (!isVisible) return null;

  const getAnimationStyle = () => {
    switch (animation) {
      case "data-motion=from-start":
        return animationStyles.slideInFromLeft;
      case "data-motion=from-end":
        return animationStyles.slideInFromRight;
      case "data-motion=to-start":
        return animationStyles.slideOutToLeft;
      case "data-motion=to-end":
        return animationStyles.slideOutToRight;
      default:
        return {};
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "left-0 top-0 w-full md:absolute md:w-auto",
        className
      )}
      style={{
        ...getAnimationStyle(),
        ...(viewportWidth && { "--radix-navigation-menu-viewport-width": `${viewportWidth}px` }),
      }}
      {...props}
    />
  );
});
NavigationMenuContent.displayName = "NavigationMenuContent";

const NavigationMenuLink = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn(
        "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    />
  );
});
NavigationMenuLink.displayName = "NavigationMenuLink";

const NavigationMenuViewport = React.forwardRef(({ className, ...props }, ref) => {
  const { activeItem } = React.useContext(NavigationMenuContext);
  const [isOpen, setIsOpen] = useState(false);
  const [animation, setAnimation] = useState("");

  useEffect(() => {
    if (activeItem) {
      setIsOpen(true);
      setAnimation("data-state=open");
    } else {
      setAnimation("data-state=closed");
      const timer = setTimeout(() => setIsOpen(false), 200);
      return () => clearTimeout(timer);
    }
  }, [activeItem]);

  if (!isOpen) return null;

  return (
    <div className={cn("absolute left-0 top-full flex justify-center")}>
      <div
        ref={ref}
        className={cn(
          "origin-top-center relative mt-1.5 w-full overflow-hidden rounded-md bg-popover text-popover-foreground shadow-lg md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
          animation === "data-state=open" ? animationStyles.zoomIn : animationStyles.zoomOut
        )}
        style={{
          height: "var(--radix-navigation-menu-viewport-height)",
        }}
        {...props}
      />
    </div>
  );
});
NavigationMenuViewport.displayName = "NavigationMenuViewport";

const NavigationMenuIndicator = React.forwardRef(({ className, ...props }, ref) => {
  const { activeItem } = React.useContext(NavigationMenuContext);
  const [isVisible, setIsVisible] = useState(false);
  const [animation, setAnimation] = useState("");

  useEffect(() => {
    if (activeItem) {
      setIsVisible(true);
      setAnimation("data-state=visible");
    } else {
      setAnimation("data-state=hidden");
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [activeItem]);

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className,
        animation === "data-state=visible" ? animationStyles.fadeIn : animationStyles.fadeOut
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </div>
  );
});
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};