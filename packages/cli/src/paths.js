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

export function rewriteAlias(content, config) {
  if (config.alias === DEFAULT_CONFIG.alias && config.utilsDir === DEFAULT_CONFIG.utilsDir) {
    return content;
  }
  return content.replace(/@\/lib\/utils/g, `${config.alias}/${config.utilsDir}/utils`);
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
