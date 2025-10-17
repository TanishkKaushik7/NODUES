import * as React from "react";
import { cn } from "../../lib/utils";

const AvatarContext = React.createContext();

const Avatar = React.forwardRef(({ className, children, ...props }, ref) => {
  const [hasImage, setHasImage] = React.useState(true);

  return (
    <AvatarContext.Provider value={{ hasImage, setHasImage }}>
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, onLoadingStatusChange, ...props }, ref) => {
  const { setHasImage } = React.useContext(AvatarContext);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setHasImage(!props.src);
    onLoadingStatusChange?.(isLoading);
  }, [props.src, isLoading, setHasImage, onLoadingStatusChange]);

  return (
    <img
      ref={ref}
      className={cn(
        "aspect-square h-full w-full object-cover",
        className,
        isLoading && "hidden"
      )}
      onLoad={() => setIsLoading(false)}
      onError={() => setHasImage(false)}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, children, delayMs, ...props }, ref) => {
  const { hasImage } = React.useContext(AvatarContext);
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowFallback(!hasImage), delayMs || 0);
    return () => clearTimeout(timer);
  }, [hasImage, delayMs]);

  if (!showFallback) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };