"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "../../lib/utils";

export const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
);
InputOTP.displayName = "InputOTP";

export const InputOTPGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center gap-1.5", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

export const InputOTPSlot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { index: number }>(
  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const slot = inputOTPContext.slots[index];
    if (!slot) throw new Error(`InputOTPSlot index ${index} is out of range for this InputOTP's maxLength.`);
    const { char, hasFakeCaret, isActive } = slot;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center border-y border-r border-border text-sm",
          "first:rounded-l-md first:border-l last:rounded-r-md",
          isActive && "z-10 ring-2 ring-ring ring-offset-2 ring-offset-background",
          className,
        )}
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-px animate-pulse bg-foreground" />
          </div>
        )}
      </div>
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

export const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  (props, ref) => (
    <div ref={ref} role="separator" {...props}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
        <circle cx="12" cy="12" r="1" />
      </svg>
    </div>
  ),
);
InputOTPSeparator.displayName = "InputOTPSeparator";
