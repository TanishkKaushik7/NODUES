import * as React from "react";

// Custom SVG Icons (replacing lucide-react)
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
  </svg>
);

const MoreHorizontal = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01" />
  </svg>
);

// Simplified cn utility (classnames concatenation)
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Custom button styles (replacing buttonVariants)
const getButtonStyles = ({ variant = 'ghost', size = 'icon' }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    icon: 'h-9 w-9',
  };
  
  const variantStyles = {
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    outline: 'border border-transparent shadow-sm bg-white hover:bg-gray-50 text-gray-900',
  };
  
  return cn(baseStyles, sizeStyles[size], variantStyles[variant]);
};

// Pagination Components
const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef(function PaginationContent({ className, ...props }, ref) {
  return (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
});
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(function PaginationItem({ className, ...props }, ref) {
  return <li ref={ref} className={cn("", className)} {...props} />;
});
PaginationItem.displayName = "PaginationItem";

const PaginationLink = React.forwardRef(function PaginationLink(
  { className, isActive, size = "icon", ...props },
  ref
) {
  return (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        getButtonStyles({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  );
});
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = React.forwardRef(function PaginationPrevious(
  { className, ...props },
  ref
) {
  return (
    <PaginationLink
      ref={ref}
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft />
      <span>Previous</span>
    </PaginationLink>
  );
});
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef(function PaginationNext(
  { className, ...props },
  ref
) {
  return (
    <PaginationLink
      ref={ref}
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight />
    </PaginationLink>
  );
});
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = React.forwardRef(function PaginationEllipsis(
  { className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal />
      <span className="sr-only">More pages</span>
    </span>
  );
});
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};