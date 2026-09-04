// Regression guard for the bug class fixed twice already in this registry:
// an interactive control missing `focus-visible:ring-offset-2` reads as a
// visibly thinner/inconsistent keyboard-focus indicator next to every
// sibling control that has it (dark-voice fix f7a6f95, toggle/toggle-group
// fix in this same change). Every focusable form control in the registry
// should carry the same ring-offset treatment — this test is what would
// have caught both regressions before they shipped.
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../src/components/button/button";
import { Toggle } from "../src/components/toggle/toggle";
import { ToggleGroup, ToggleGroupItem } from "../src/components/toggle-group/toggle-group";
import { Checkbox } from "../src/components/checkbox/checkbox";
import { Switch } from "../src/components/switch/switch";
import { Input } from "../src/components/input/input";
import { Textarea } from "../src/components/textarea/textarea";
import { RadioGroup, RadioGroupItem } from "../src/components/radio-group/radio-group";

const cases: Array<[string, () => ReturnType<typeof render>]> = [
  ["Button", () => render(<Button>Click</Button>)],
  ["Toggle", () => render(<Toggle aria-label="Bold">B</Toggle>)],
  [
    "ToggleGroupItem",
    () =>
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="a" aria-label="Left">
            A
          </ToggleGroupItem>
        </ToggleGroup>,
      ),
  ],
  ["Checkbox", () => render(<Checkbox aria-label="Accept" />)],
  ["Switch", () => render(<Switch aria-label="Enable" />)],
  ["Input", () => render(<Input aria-label="Name" />)],
  ["Textarea", () => render(<Textarea aria-label="Bio" />)],
  [
    "RadioGroupItem",
    () =>
      render(
        <RadioGroup>
          <RadioGroupItem value="a" aria-label="Option A" />
        </RadioGroup>,
      ),
  ],
];

describe("focus-visible ring-offset is present on every interactive control", () => {
  for (const [name, renderControl] of cases) {
    it(`${name} has focus-visible:ring-offset-2`, () => {
      const { container } = renderControl();
      const control = container.querySelector("[class*='focus-visible']") as HTMLElement;
      expect(control, `${name} rendered no element with a focus-visible class`).toBeTruthy();
      expect(control.className).toMatch(/focus-visible:ring-offset-2/);
    });
  }
});
