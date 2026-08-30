"use client";

import { useState } from "react";
import { Combobox } from "@/components/dsgn/combobox";

const FRAMEWORKS = [
  { value: "next", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
];

export function ComboboxDemo() {
  const [value, setValue] = useState("");
  return (
    <div className="max-w-sm">
      <Combobox
        options={FRAMEWORKS}
        value={value}
        onValueChange={setValue}
        placeholder="Select a framework..."
        searchPlaceholder="Search frameworks..."
      />
    </div>
  );
}
