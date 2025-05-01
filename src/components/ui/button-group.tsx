
import * as React from "react";
import { cn } from "@/lib/utils";

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      ref={ref}
      {...props}
    />
  );
});
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
