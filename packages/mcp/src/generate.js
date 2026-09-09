// Deterministic scaffold generation for the `generate_component_scaffold`
// tool. No LLM call, no filesystem writes — this module is pure so it's
// trivially unit-testable, and so the MCP server it backs stays a
// read-only tool by default (writing files is the calling agent's job).

/** Radix primitives that actually exist under @radix-ui/react-* today (the
 * same set packages/registry/package.json already depends on). Used as a
 * best-effort plausibility check for tool 4's Radix-vs-plain-primitive
 * branch — not a live npm lookup, just a documented guess. */
const KNOWN_RADIX_PRIMITIVES = new Set([
  "accordion",
  "alert-dialog",
  "avatar",
  "checkbox",
  "collapsible",
  "context-menu",
  "dialog",
  "dropdown-menu",
  "hover-card",
  "label",
  "menubar",
  "navigation-menu",
  "popover",
  "progress",
  "radio-group",
  "scroll-area",
  "select",
  "separator",
  "slider",
  "slot",
  "switch",
  "tabs",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip",
]);

function toPascalCase(kebab) {
  return kebab
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

/** Best-effort guess at whether @radix-ui/react-<name> plausibly exists.
 * Not a network call (this tool never calls out) — just a name-plausibility
 * check against the primitives dsgn already knows about, so the caller
 * gets a reasonable skeleton without this tool needing npm-registry access.
 * Always documented as a guess in the returned notes. */
export function guessRadixPackage(name) {
  return KNOWN_RADIX_PRIMITIVES.has(name) ? `@radix-ui/react-${name}` : null;
}

/**
 * Radix-wrapper skeleton matching dialog.tsx's shape: Root/Trigger/Close
 * re-exported directly from the primitive, Content/Title/etc. wrapped in
 * forwardRef with cn()-merged classNames and a displayName assignment.
 */
function radixWrapperSkeleton(name, pascalName, description, radixPackage) {
  return `"use client";

import * as React from "react";
import * as ${pascalName}Primitive from "${radixPackage}";
import { cn } from "../../lib/utils";

// ${description}
// Guessed Radix package: ${radixPackage} — verify this actually exports the
// primitives referenced below (Root/Trigger/Content/...) before shipping;
// not every Radix primitive has the same sub-component names.

export const ${pascalName} = ${pascalName}Primitive.Root;
export const ${pascalName}Trigger = ${pascalName}Primitive.Trigger;

export const ${pascalName}Content = React.forwardRef<
  React.ElementRef<typeof ${pascalName}Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof ${pascalName}Primitive.Content>
>(({ className, ...props }, ref) => (
  <${pascalName}Primitive.Content
    ref={ref}
    className={cn(
      // TODO: fill in this component's actual styling — border/radius/shadow
      // tokens, following the conventions in packages/registry/src/components/dialog/dialog.tsx.
      "",
      className,
    )}
    {...props}
  />
));
${pascalName}Content.displayName = ${pascalName}Primitive.Content.displayName;

// TODO: add any further sub-components this primitive needs (Title,
// Description, Header/Footer helpers, ...), following the forwardRef +
// displayName pattern above for anything that wraps a Radix primitive
// sub-component, and a plain function for anything that's purely layout
// (see DialogHeader/DialogFooter in dialog.tsx for that second case).
`;
}

/**
 * Plain cn()-based styled-primitive skeleton matching input.tsx's shape:
 * no Radix dependency, a single forwardRef wrapping a native element.
 */
function plainPrimitiveSkeleton(name, pascalName, description) {
  return `import * as React from "react";
import { cn } from "../../lib/utils";

// ${description}

export type ${pascalName}Props = React.HTMLAttributes<HTMLDivElement>;

export const ${pascalName} = React.forwardRef<HTMLDivElement, ${pascalName}Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // TODO: fill in this component's actual styling, following the
        // conventions in packages/registry/src/components/input/input.tsx.
        "",
        className,
      )}
      {...props}
    />
  ),
);
${pascalName}.displayName = "${pascalName}";
`;
}

/**
 * Composed-component skeleton matching combobox.tsx's shape: imports the
 * named sibling registry components, a props interface stub, and a
 * function component (not forwardRef — composed components in this
 * registry are plain functions, matching Combobox/DatePicker) with a
 * comment marking where composition logic goes.
 */
function composedSkeleton(name, pascalName, description, composedFrom) {
  const imports = composedFrom
    .map((dep) => `import { ${toPascalCase(dep)} } from "../${dep}/${dep}";`)
    .join("\n");

  return `"use client";

import * as React from "react";
${imports}
import { cn } from "../../lib/utils";

// ${description}
// Composed from: ${composedFrom.join(", ")} — no new primitive-library
// dependency, this component only needs whatever ${composedFrom.join(
    ", ",
  )} already
// bring in as registryDependencies.

export interface ${pascalName}Props {
  className?: string;
  // TODO: add this component's real props.
}

export function ${pascalName}({ className, ...props }: ${pascalName}Props) {
  // TODO: compose ${composedFrom.join(" + ")} into the actual component here,
  // following the pattern in packages/registry/src/components/combobox/combobox.tsx.
  return (
    <div className={cn("", className)} {...props} />
  );
}
`;
}

/** Builds the exact registry.json entry block the caller should append,
 * matching the shape documented in packages/registry/registry.json. */
function buildRegistryEntry(name, kind, description, composedFrom, radixPackage) {
  const dependencies = radixPackage ? [radixPackage] : [];
  const registryDependencies = ["utils", ...(composedFrom ?? [])];

  return {
    name,
    type: kind === "block" ? "registry:block" : "registry:ui",
    description,
    dependencies,
    registryDependencies,
    files: [
      {
        path: `src/components/${name}/${name}.tsx`,
        target: `components/dsgn/${name}.tsx`,
        type: kind === "block" ? "registry:block" : "registry:ui",
      },
    ],
  };
}

/**
 * Generates a starting skeleton for a new registry component — NOT a
 * finished component. Returns file content, the registry.json entry to
 * append, and next-step notes. Does not write anything to disk.
 *
 * @param {{name: string, kind: "ui"|"block", description: string, composedFrom?: string[]}} input
 */
export function generateComponentScaffold({ name, kind, description, composedFrom }) {
  if (!name || typeof name !== "string") {
    throw new Error("generate_component_scaffold requires a `name` string.");
  }
  if (kind !== "ui" && kind !== "block") {
    throw new Error('generate_component_scaffold requires `kind` to be "ui" or "block".');
  }
  if (!description || typeof description !== "string") {
    throw new Error("generate_component_scaffold requires a `description` string.");
  }

  const pascalName = toPascalCase(name);
  const hasComposedFrom = Array.isArray(composedFrom) && composedFrom.length > 0;

  let fileContent;
  let radixPackage = null;
  let skeletonKind;

  if (hasComposedFrom) {
    fileContent = composedSkeleton(name, pascalName, description, composedFrom);
    skeletonKind = "composed";
  } else {
    radixPackage = guessRadixPackage(name);
    if (radixPackage) {
      fileContent = radixWrapperSkeleton(name, pascalName, description, radixPackage);
      skeletonKind = "radix-wrapper";
    } else {
      fileContent = plainPrimitiveSkeleton(name, pascalName, description);
      skeletonKind = "plain-primitive";
    }
  }

  const registryEntry = buildRegistryEntry(
    name,
    kind,
    description,
    hasComposedFrom ? composedFrom : undefined,
    radixPackage,
  );

  const notes = [
    "This is a starting skeleton for a human/agent to complete, not a finished component.",
    `Fill in the real implementation in src/components/${name}/${name}.tsx (styling, props, behavior).`,
    "Append the generated registry.json entry to packages/registry/registry.json's `items` array.",
    `Add a site demo (see apps/site's existing component demo pages for the pattern).`,
  ];
  if (skeletonKind === "radix-wrapper") {
    notes.unshift(
      `Guessed Radix package "${radixPackage}" by name — verify it exists and exports the sub-components referenced (Root/Trigger/Content) before relying on this skeleton.`,
    );
  }

  return {
    skeletonKind,
    filePath: `src/components/${name}/${name}.tsx`,
    fileContent,
    registryEntry,
    notes,
  };
}
