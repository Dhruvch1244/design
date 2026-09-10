import * as React from "react";
import { cn } from "../../lib/utils";

export interface StepperStep {
  label: React.ReactNode;
  description?: React.ReactNode;
}

export interface StepperProps {
  steps: StepperStep[];
  /** 0-indexed. Steps before this are complete, this one is current, the rest are upcoming. */
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepCircle({ status, index }: { status: "complete" | "current" | "upcoming"; index: number }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
        status === "complete" && "border-accent bg-accent text-accent-foreground",
        status === "current" && "border-accent text-accent",
        status === "upcoming" && "border-border text-muted-foreground",
      )}
    >
      {status === "complete" ? <CheckIcon /> : index + 1}
    </span>
  );
}

export function Stepper({ steps, currentStep, orientation = "horizontal", className }: StepperProps) {
  function statusFor(index: number): "complete" | "current" | "upcoming" {
    if (index < currentStep) return "complete";
    if (index === currentStep) return "current";
    return "upcoming";
  }

  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col", className)}>
        {steps.map((step, index) => {
          const status = statusFor(index);
          const isLast = index === steps.length - 1;
          return (
            <li key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <StepCircle status={status} index={index} />
                {!isLast && (
                  <span className={cn("w-px flex-1 my-1", status === "complete" ? "bg-accent" : "bg-border")} />
                )}
              </div>
              <div className={cn("pb-8", isLast && "pb-0")}>
                <p className={cn("text-sm font-medium", status === "upcoming" ? "text-muted-foreground" : "text-foreground")}>
                  {step.label}
                </p>
                {step.description && <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className={cn("flex items-start", className)}>
      {steps.map((step, index) => {
        const status = statusFor(index);
        const isLast = index === steps.length - 1;
        return (
          <li key={index} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-2 text-center">
              <StepCircle status={status} index={index} />
              <div>
                <p className={cn("text-sm font-medium", status === "upcoming" ? "text-muted-foreground" : "text-foreground")}>
                  {step.label}
                </p>
                {step.description && <p className="mt-0.5 max-w-[8rem] text-xs text-muted-foreground">{step.description}</p>}
              </div>
            </div>
            {!isLast && (
              <span className={cn("mx-2 mt-4 h-px flex-1", status === "complete" ? "bg-accent" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
