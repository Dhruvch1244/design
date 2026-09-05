import path from "node:path";
import crypto from "node:crypto";
import { DEFAULT_CONFIG } from "./config.js";

export function resolveTarget(config, target) {
  if (target.startsWith("components/dsgn/")) {
    return path.join(config.componentsDir, target.slice("components/dsgn/".length));
  }
  if (target.startsWith("lib/")) {
    return path.join(config.utilsDir, target.slice("lib/".length));
  }
  return target;
}

/**
 * Registry file content hardcodes two kinds of import: `@/lib/utils` (every
 * component that uses `cn()`) and `@/components/dsgn/<name>` (a multi-file
 * composite like Combobox importing Button/Popover/Command, or any recipe
 * importing the components it composes — 11 registry items do this). Each
 * needs rewriting independently whenever the piece of config it depends on
 * differs from default, not just when *both* `alias` and that piece do —
 * a project that only customizes `componentsDir` (keeping the default `@`
 * alias and `utilsDir`) still needs its `@/components/dsgn/*` imports
 * rewritten, even though its `@/lib/utils` imports are already correct as
 * written. Missing this previously left every multi-file registry item with
 * a cross-component import broken (pointing at a `components/dsgn/` path
 * that was never written) the moment `componentsDir` was customized.
 */
export function rewriteAlias(content, config) {
  let result = content;
  if (config.alias !== DEFAULT_CONFIG.alias || config.componentsDir !== DEFAULT_CONFIG.componentsDir) {
    result = result.replace(/@\/components\/dsgn\//g, `${config.alias}/${config.componentsDir}/`);
  }
  if (config.alias !== DEFAULT_CONFIG.alias || config.utilsDir !== DEFAULT_CONFIG.utilsDir) {
    result = result.replace(/@\/lib\/utils/g, `${config.alias}/${config.utilsDir}/utils`);
  }
  return result;
}

export function hashContent(content) {
  return "sha256:" + crypto.createHash("sha256").update(content).digest("hex");
}

/** A recipe name is namespaced in the registry as "recipe-<name>" so it
 * can't collide with a component of the same name, but users type the
 * shorter "recipe:<name>" on the CLI (matching the `add recipe:auth-form`
 * form documented everywhere). This is the one place that translation
 * happens, so every command that accepts item names goes through it. */
export function resolveItemName(name) {
  return name.startsWith("recipe:") ? `recipe-${name.slice("recipe:".length)}` : name;
}
