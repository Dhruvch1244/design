"use client";

import * as React from "react";
import { Button } from "../button/button";
import { Progress } from "../progress/progress";
import { cn } from "../../lib/utils";

export interface FileUploadProps {
  /** Currently selected files. Controlled -- this component never uploads anything itself. */
  value: File[];
  onValueChange: (files: File[]) => void;
  /** Per-file upload progress (0-100), keyed by `File.name`. Omit a key to
   * render that file with no progress bar (e.g. before an upload starts). */
  progress?: Record<string, number>;
  accept?: string;
  multiple?: boolean;
  /** Max size per file, in bytes. Oversized files are dropped from the
   * selection and reported via `onReject`, never silently accepted. */
  maxSize?: number;
  disabled?: boolean;
  onRemove?: (file: File) => void;
  onReject?: (files: File[], reason: "size") => void;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function FileUpload({
  value,
  onValueChange,
  progress,
  accept,
  multiple = true,
  maxSize,
  disabled,
  onRemove,
  onReject,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Counts nested dragenter/dragleave pairs fired as the pointer crosses
  // child elements inside the dropzone -- without it, dragging over a file
  // row in the list below fires a dragleave on the outer zone and the
  // "drop here" highlight flickers off mid-drag.
  const dragCounter = React.useRef(0);

  function addFiles(incoming: FileList | File[]) {
    const incomingArray = Array.from(incoming);
    const accepted: File[] = [];
    const rejected: File[] = [];
    for (const file of incomingArray) {
      if (maxSize && file.size > maxSize) rejected.push(file);
      else accepted.push(file);
    }
    if (rejected.length) onReject?.(rejected, "size");
    if (!accepted.length) return;
    onValueChange(multiple ? [...value, ...accepted] : accepted.slice(0, 1));
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (disabled) return;
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (disabled) return;
    dragCounter.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        // No accessible name of its own beyond the visible "Click to
        // upload..." text below, which is enough for the button role's name
        // -- but the hidden <input type="file"> used to live *inside* this
        // element, which axe correctly flags as "Interactive controls must
        // not be nested" (a focusable, tabbable input nested inside another
        // element that already carries an interactive role/tabIndex is a
        // real screen-reader confusion, not a false positive). The input is
        // now a sibling, reached only via `inputRef.current?.click()`.
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/50",
          isDragging && "border-accent bg-accent/5",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-muted-foreground">
          <path d="M12 16V4m0 0 4 4m-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-foreground">
          <span className="font-medium text-accent">Click to upload</span> or drag and drop
        </p>
        {maxSize && <p className="text-xs text-muted-foreground">Max file size {formatBytes(maxSize)}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-label="Upload file"
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file) => {
            const pct = progress?.[file.name];
            return (
              <li
                key={`${file.name}-${file.lastModified}`}
                className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 shrink-0 text-muted-foreground">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  {pct !== undefined && <Progress value={pct} className="mt-1.5 h-1.5" />}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => {
                    onRemove?.(file);
                    onValueChange(value.filter((f) => f !== file));
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
