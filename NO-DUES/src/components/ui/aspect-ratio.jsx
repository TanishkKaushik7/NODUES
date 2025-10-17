import * as React from "react";

const AspectRatio = React.forwardRef(({ ratio = 16 / 9, children, style, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: `${100 / ratio}%`,
        ...style
      }}
      className={className}
      {...props}
    >
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}>
        {children}
      </div>
    </div>
  );
});

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };