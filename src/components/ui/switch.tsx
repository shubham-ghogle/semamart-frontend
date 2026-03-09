import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full!",
      "bg-slate-700 transition-colors",
      "data-[state=checked]:bg-[#1C647C]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full! bg-white shadow-lg",
        "transition-transform",
        "translate-x-0 data-[state=checked]:translate-x-6"
      )}
    />
  </SwitchPrimitive.Root>
))

Switch.displayName = "Switch"

export { Switch }