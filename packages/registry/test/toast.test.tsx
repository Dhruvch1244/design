// Regression guard: ToastClose used to render an icon-only SVG with no
// accessible name, so a screen reader announced nothing meaningful for the
// dismiss button (fixed alongside the mouse-visibility fix in 89d1c35 —
// that commit only addressed the visual half of the bug).
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toast, ToastClose, ToastProvider, ToastTitle, ToastViewport } from "../src/components/toast/toast";

describe("ToastClose", () => {
  it("has an accessible name for assistive tech", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Saved</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
  });
});
