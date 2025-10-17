import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Dialog, DialogContent } from "../../components/ui/dialog";

const CommandContext = React.createContext();

// Command Root
const Command = React.forwardRef(({ className, ...props }, ref) => {
  const [value, setValue] = React.useState("");
  const [selected, setSelected] = React.useState(-1);

  return (
    <CommandContext.Provider value={{ value, setValue, selected, setSelected }}>
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground shadow-lg",
          className
        )}
        {...props}
      />
    </CommandContext.Provider>
  );
});
Command.displayName = "Command";

// Command Dialog
const CommandDialog = ({ children, ...props }) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-xl">
        <Command className="[&_[data-group-heading]]:px-2 [&_[data-group-heading]]:font-medium [&_[data-group-heading]]:text-muted-foreground [&_[data-group]:not([hidden])_~[data-group]]:pt-0 [&_[data-group]]:px-2 [&_[data-input-wrapper]_svg]:h-5 [&_[data-input-wrapper]_svg]:w-5 [&_[data-input]]:h-12 [&_[data-item]]:px-2 [&_[data-item]]:py-3 [&_[data-item]_svg]:h-5 [&_[data-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

// Command Input
const CommandInput = React.forwardRef(({ className, ...props }, ref) => {
  const { setValue } = React.useContext(CommandContext);
  
  return (
    <div className="flex items-center px-3 shadow-sm" data-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        ref={ref}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
});
CommandInput.displayName = "CommandInput";

// Command List
const CommandList = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
});
CommandList.displayName = "CommandList";

// Command Empty
const CommandEmpty = React.forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className="py-6 text-center text-sm"
      {...props}
    />
  );
});
CommandEmpty.displayName = "CommandEmpty";

// Command Group
const CommandGroup = React.forwardRef(({ className, heading, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-foreground shadow-sm",
        className
      )}
      data-group=""
      {...props}
    >
      {heading && (
        <div 
          className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
          data-group-heading=""
        >
          {heading}
        </div>
      )}
      {children}
    </div>
  );
});
CommandGroup.displayName = "CommandGroup";

// Command Separator
const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("-mx-1 h-px bg-border shadow-xs", className)}
      {...props}
    />
  );
});
CommandSeparator.displayName = "CommandSeparator";

// Command Item
const CommandItem = React.forwardRef(({ className, children, ...props }, ref) => {
  const { selected } = React.useContext(CommandContext);
  const [isSelected, setIsSelected] = React.useState(false);
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "hover:shadow-md transition-shadow",
        isSelected && "bg-accent text-accent-foreground shadow-sm",
        className
      )}
      role="option"
      data-item=""
      {...props}
    >
      {children}
    </div>
  );
});
CommandItem.displayName = "CommandItem";

// Command Shortcut
const CommandShortcut = ({ className, ...props }) => {
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
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};