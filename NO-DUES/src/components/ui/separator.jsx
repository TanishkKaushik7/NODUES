import * as React from 'react';

const Separator = React.forwardRef(
  (
    {
      className = '',
      orientation = 'horizontal',
      decorative = true,
      ...props
    },
    ref
  ) => {
    // ARIA attributes for accessibility
    const ariaProps = decorative
      ? { 'aria-hidden': true }
      : { role: 'separator', 'aria-orientation': orientation };

    // Shadow styles to replace borders
    const shadowStyle = {
      boxShadow:
        orientation === 'horizontal'
          ? '0 1px 0 0 rgba(0, 0, 0, 0.1)'
          : '1px 0 0 0 rgba(0, 0, 0, 0.1)',
    };

    return (
      <div
        ref={ref}
        {...ariaProps}
        {...props}
        style={{ ...shadowStyle, ...props.style }}
        className={[
          'shrink-0 bg-transparent',
          orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }
);

Separator.displayName = 'Separator';

export { Separator };