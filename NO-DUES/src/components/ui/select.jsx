import * as React from "react";
import { useState, useRef, useEffect } from "react";

// Simplified cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Custom Icons (replacing lucide-react)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
  </svg>
);

// Select Context
const SelectContext = React.createContext();

const Select = ({ children, value, defaultValue, onValueChange, ...props }) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const handleValueChange = (newValue) => {
    setInternalValue(newValue);
    if (onValueChange) onValueChange(newValue);
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{
      value: value || internalValue,
      onValueChange: handleValueChange,
      isOpen,
      setIsOpen
    }}>
      <div ref={selectRef} className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  
  return (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ChevronDownIcon className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "transform rotate-180")} />
    </button>
  );
});

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 right-0 mt-1 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-lg z-[9999]",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="max-h-80 overflow-y-auto p-1">
        {children}
      </div>
    </div>
  );
});

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
        "bg-white text-gray-900 hover:bg-gray-100 focus:bg-blue-50 focus:text-blue-700",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <CheckIcon className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
});

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    />
  );
});

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
      {...props}
    />
  );
});

// Group components (simplified implementations)
const SelectGroup = ({ children, ...props }) => <div {...props}>{children}</div>;

// Fixed SelectValue component to handle placeholder
const SelectValue = ({ placeholder, children, ...props }) => {
  const { value } = React.useContext(SelectContext);
  
  if (!value && placeholder) {
    return <span className="text-gray-500" {...props}>{placeholder}</span>;
  }
  
  return <span {...props}>{children}</span>;
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  // These are included for API compatibility but don't do much in this implementation
  ChevronUpIcon as SelectScrollUpButton,
  ChevronDownIcon as SelectScrollDownButton,
};

// Example usage component showing the fixed Select
const ExampleLoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    role: ''
  });

  const adminRoles = [
    { value: 'registrar', label: 'Registrar (Master Admin)' },
    { value: 'dean', label: 'Dean' },
    { value: 'hod', label: 'Head of Department' },
    { value: 'iqac', label: 'IQAC Officer' },
    { value: 'clubs', label: 'Clubs Coordinator' },
    { value: 'exam', label: 'Exam Controller' },
    { value: 'research', label: 'Research Cell Admin' }
  ];

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Role</label>
          <Select
            value={credentials.role}
            onValueChange={(value) => {
              setCredentials({ ...credentials, role: value });
            }}
          >
            <SelectTrigger className="w-full bg-white text-gray-800 border border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Choose your admin role..." />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-800 shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
              {adminRoles.map((role) => (
                <SelectItem 
                  key={role.value} 
                  value={role.value}
                  className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                >
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">Selected role: {credentials.role || 'None'}</p>
        </div>
      </div>
    </div>
  );
};

export { ExampleLoginForm };