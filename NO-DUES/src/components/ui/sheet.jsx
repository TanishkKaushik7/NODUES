import * as React from "react";

// Context for sheet state
const SheetContext = React.createContext();

const Sheet = ({ children, ...props }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      <div {...props}>{children}</div>
    </SheetContext.Provider>
  );
};

const SheetTrigger = React.forwardRef(({ children, ...props }, ref) => {
  const { setOpen } = React.useContext(SheetContext);
  
  return React.cloneElement(React.Children.only(children), {
    ref,
    onClick: () => setOpen(true),
    ...props
  });
});

const SheetClose = React.forwardRef(({ children, ...props }, ref) => {
  const { setOpen } = React.useContext(SheetContext);
  
  return React.cloneElement(React.Children.only(children), {
    ref,
    onClick: () => setOpen(false),
    ...props
  });
});

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SheetContext);
  
  return open ? (
    <div
      ref={ref}
      className={`fixed inset-0 z-50 bg-black/80 transition-opacity ${
        open ? 'opacity-100' : 'opacity-0'
      } ${className || ''}`}
      onClick={() => setOpen(false)}
      {...props}
    />
  ) : null;
});

const SheetPortal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

const SheetContent = React.forwardRef(
  ({ side = "right", className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SheetContext);
    
    const positionStyles = {
      top: "inset-x-0 top-0 shadow-bottom",
      bottom: "inset-x-0 bottom-0 shadow-top",
      left: "inset-y-0 left-0 h-full w-3/4 shadow-right sm:max-w-sm",
      right: "inset-y-0 right-0 h-full w-3/4 shadow-left sm:max-w-sm"
    };

    const animationStyles = {
      top: {
        open: "translate-y-0",
        closed: "-translate-y-full"
      },
      bottom: {
        open: "translate-y-0",
        closed: "translate-y-full"
      },
      left: {
        open: "translate-x-0",
        closed: "-translate-x-full"
      },
      right: {
        open: "translate-x-0",
        closed: "translate-x-full"
      }
    };

    return open ? (
      <SheetPortal>
        <SheetOverlay />
        <div
          ref={ref}
          className={`fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform duration-300 ${
            positionStyles[side]
          } ${animationStyles[side][open ? "open" : "closed"]} ${
            className || ""
          }`}
          {...props}
        >
          {children}
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
            <CloseIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
      </SheetPortal>
    ) : null;
  }
);

// Simple close icon component to replace lucide-react's X
const CloseIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SheetHeader = ({ className, ...props }) => (
  <div
    className={`flex flex-col space-y-2 text-center sm:text-left ${
      className || ""
    }`}
    {...props}
  />
);

const SheetFooter = ({ className, ...props }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${
      className || ""
    }`}
    {...props}
  />
);

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold text-foreground ${className || ""}`}
    {...props}
  />
));

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className || ""}`}
    {...props}
  />
));

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};