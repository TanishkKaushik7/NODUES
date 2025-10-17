import * as React from "react";
import { cn } from "../../lib/utils";

// Context for managing drawer state
const DrawerContext = React.createContext({
  isOpen: false,
  setIsOpen: () => {},
  shouldScaleBackground: false
});

const Drawer = function Drawer({ 
  shouldScaleBackground = true, 
  children,
  ...props 
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <DrawerContext.Provider value={{ isOpen, setIsOpen, shouldScaleBackground }}>
      <div {...props}>{children}</div>
    </DrawerContext.Provider>
  );
};
Drawer.displayName = "Drawer";

const useDrawer = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be wrapped in a <Drawer>");
  }
  return context;
};

const DrawerTrigger = React.forwardRef(function DrawerTrigger({ 
  children, 
  ...props 
}, ref) {
  const { setIsOpen } = useDrawer();
  
  return React.cloneElement(React.Children.only(children), {
    ref,
    onClick: () => setIsOpen(true),
    ...props
  });
});

const DrawerClose = React.forwardRef(function DrawerClose({ 
  children, 
  ...props 
}, ref) {
  const { setIsOpen } = useDrawer();
  
  return React.cloneElement(React.Children.only(children), {
    ref,
    onClick: () => setIsOpen(false),
    ...props
  });
});

const DrawerOverlay = React.forwardRef(function DrawerOverlay({ 
  className, 
  ...props 
}, ref) {
  const { isOpen, setIsOpen } = useDrawer();
  
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 transition-opacity",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      onClick={() => setIsOpen(false)}
      {...props}
    />
  );
});
DrawerOverlay.displayName = "DrawerOverlay";

const DrawerContent = React.forwardRef(function DrawerContent({ 
  className, 
  children, 
  ...props 
}, ref) {
  const { isOpen, setIsOpen, shouldScaleBackground } = useDrawer();
  const [isDragging, setIsDragging] = React.useState(false);
  const startYRef = React.useRef(0);
  const contentRef = React.useRef(null);

  if (!isOpen) return null;

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !contentRef.current) return;
    const y = e.touches[0].clientY;
    const diff = y - startYRef.current;
    
    if (diff > 0) {
      contentRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !contentRef.current) return;
    setIsDragging(false);
    
    const currentTransform = contentRef.current.style.transform;
    const translateY = currentTransform ? parseInt(currentTransform.replace('translateY(', '').replace('px)', '')) : 0;
    
    if (translateY > 100) {
      setIsOpen(false);
    } else {
      contentRef.current.style.transform = 'translateY(0)';
    }
  };

  return (
    <>
      <DrawerOverlay />
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col",
          "transform transition-transform duration-300 ease-out",
          "shadow-lg rounded-t-[10px] bg-background",
          shouldScaleBackground ? "scale-100" : "scale-100",
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </div>
    </>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = function DrawerHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "grid gap-1.5 p-4 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
};
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = function DrawerFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col gap-2 p-4",
        className
      )}
      {...props}
    />
  );
};
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef(function DrawerTitle({ 
  className, 
  ...props 
}, ref) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
});
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef(function DrawerDescription({ 
  className, 
  ...props 
}, ref) {
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};