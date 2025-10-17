import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = (options) => {
  const baseStyles =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variantStyles = {
    default: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-700",
    destructive: "bg-red-100 text-red-700",
    outline: "bg-transparent text-black border border-gray-300",
    tertiary:"bg-black text-white",
  };

  return cn(baseStyles, variantStyles[options?.variant || "default"]);
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
