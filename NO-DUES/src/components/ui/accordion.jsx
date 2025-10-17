import React, { useState, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AccordionContext = createContext();

const Accordion = ({ children, defaultValue, type = "single", collapsible = false, ...props }) => {
  const [openItems, setOpenItems] = useState(
    defaultValue ? (type === "single" ? defaultValue : [defaultValue]) : type === "single" ? null : []
  );

  const handleValueChange = (value) => {
    if (type === "single") {
      setOpenItems(openItems === value && collapsible ? null : value);
    } else {
      setOpenItems((prev) =>
        prev.includes(value) 
          ? collapsible ? prev.filter((item) => item !== value) : prev
          : [...prev, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, handleValueChange, type }}>
      <div {...props}>{children}</div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = React.forwardRef(({ className, value, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("border-b", className)}
      data-state={useContext(AccordionContext).openItems === value || useContext(AccordionContext).openItems?.includes(value) ? "open" : "closed"}
      {...props}
    >
      {children}
    </div>
  );
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { openItems, handleValueChange, type } = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);
  const isOpen = type === "single" ? openItems === itemContext.value : openItems.includes(itemContext.value);

  return (
    <div className="flex">
      <button
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          className
        )}
        onClick={() => handleValueChange(itemContext.value)}
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { openItems, type } = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);
  const isOpen = type === "single" ? openItems === itemContext.value : openItems.includes(itemContext.value);

  return (
    <div
      ref={ref}
      className="overflow-hidden text-sm transition-all"
      style={{
        animation: isOpen ? "accordion-down 0.2s ease-out" : "accordion-up 0.2s ease-out",
      }}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";


export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };