import * as React from "react";
import { cn } from "../../lib/utils";

const THEMES = {
  light: "",
  dark: ".dark",
};

function ChartContainer({ className, children, ...props }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)} {...props}>
      {children}
    </div>
  );
}

function ChartThemeStyle({ id, config }) {
  const colorConfig = Object.entries(config).filter(
    ([_, itemConfig]) => itemConfig.theme || itemConfig.color
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => `
            ${prefix} [data-chart="${id}"] {
              ${colorConfig
                .map(([key, itemConfig]) => {
                  const color = (itemConfig.theme && itemConfig.theme[theme]) || itemConfig.color;
                  return color ? `--color-${key}: ${color};` : "";
                })
                .filter(Boolean)
                .join("\n")}
            }
          `).join("\n")
      }}
    />
  );
}

const ChartTooltip = ({ 
  active, 
  payload, 
  children,
  className,
  ...props 
}) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div 
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {children || (
        <div className="grid gap-1.5">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="h-2.5 w-2.5 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-muted-foreground">
                {item.name}
              </span>
              <span className="ml-auto font-mono font-medium tabular-nums">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChartTooltipContent = React.forwardRef(({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}, ref) => {
  const config = {};

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;

    const [item] = payload;
    const key = `${labelKey || item.dataKey || item.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string"
      ? (config[label] && config[label].label) || label
      : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    return value ? <div className={cn("font-medium", labelClassName)}>{value}</div> : null;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {tooltipLabel}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;

          return (
            <div
              key={item.dataKey || index}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2",
                indicator === "dot" && "items-center"
              )}
            >
              {!hideIndicator && (
                <div
                  className={cn(
                    "shrink-0 rounded-[2px]",
                    indicator === "dot" && "h-2.5 w-2.5",
                    indicator === "line" && "w-1",
                    indicator === "dashed" && "w-0 border-[1.5px] border-dashed bg-transparent"
                  )}
                  style={{
                    backgroundColor: indicator === "dashed" ? "transparent" : indicatorColor,
                    borderColor: indicatorColor
                  }}
                />
              )}
              <div className="flex flex-1 justify-between leading-none items-center">
                <span className="text-muted-foreground">
                  {itemConfig?.label || item.name}
                </span>
                {item.value !== undefined && (
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = ({ payload, className, hideIcon = false, verticalAlign = "bottom", nameKey }) => {
  const config = {};

  if (!payload?.length) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, idx) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div key={item.value || idx} className="flex items-center gap-1.5">
            {!hideIcon && (
              <div 
                className="h-2 w-2 shrink-0 rounded-[2px]" 
                style={{ backgroundColor: item.color }} 
              />
            )}
            {itemConfig?.label || item.value}
          </div>
        );
      })}
    </div>
  );
};

function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) return undefined;

  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
    ? payload.payload
    : undefined;

  let configLabelKey = key;

  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }

  return configLabelKey in config ? config[configLabelKey] : undefined;
}

export {
  ChartThemeStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  getPayloadConfigFromPayload,
  ChartContainer,
};