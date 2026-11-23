---
name: dsgn-terminal-phosphor
description: World — green phosphor on near-black, monospace everything, faint scanlines; content presented as a live shell session with a working prompt. For developer portfolios, CLIs, dev tools and changelogs that want to feel like a terminal, not just look like one.
---

# Terminal / Phosphor (world)

## 1. Identity

A world, not just a voice: the page *is* a shell session. Content arrives as
the output of commands (`whoami`, `cat about.txt`, `ls -la`), and a real
prompt at the bottom accepts commands that drive the real site. The visual
layer is restrained — green on black, one amber secondary — because the
metaphor carries the personality. Read `reference/worlds.md` first.

## 2. Color logic

- Background: near-black with a green cast (`#070b09`), surface one step up
  (`#0c1310`). Never pure black — phosphor screens glow.
- Accent: phosphor green (`#3ddc84`) for prompts, links and the cursor;
  amber (`#e0b341`) as the single secondary (hashes, flags, timestamps).
- Text: pale green-white (`#d5f7e1`), secondary and faint steps tinted
  green, not grey.
- Map onto the existing raw tokens (`--void`, `--surface`, `--ink*`,
  `--rule`) — no new names.

## 3. Typography

- `--font-display`, `--font-sans` and `--font-mono` all point at one
  monospace (JetBrains Mono in the reference site). Headings are bold mono,
  sentence case, tight tracking — not uppercase display type.
- Load the world's font only when the world is active.

## 4. Spacing & density

Dense, line-based rhythm. Blocks are separated by one blank line's worth of
space, like real terminal output. Column alignment matters — use CSS grid
with `ch` units for `ls`-style rows rather than padding strings with spaces.

## 5. Motion character

Almost none, and mechanical when present: a `steps(1)` blinking cursor, an
optional slow "code rain" backdrop that speeds up with scroll. No easing
curves on content. Everything blinking stops under `prefers-reduced-motion`.

## 6. Borders & shadows

The page sits in one window chrome (title bar with three dots). Inside it:
no cards, no shadows — structure comes from prompts and indentation. A very
faint scanline overlay (multiply, ~18% black every 3px) is the only texture.

## 7. Workflow facets in this voice

- **Component Builder**: buttons become `-> open <name>` links or `[ ]`
  checkboxes; registry components are used sparingly inside the window
  (Kbd, Tooltip, Command).
- **Page Composer**: one long session per page; each section is
  `<prompt> <command>` followed by its output.
- **Theming Specialist**: one token block; radius near `0.2`; shadows off
  inside the window.
- **Accessibility Reviewer**: the prompt `<input>` needs a real
  `aria-label` ("Terminal command (type help)"); tables of `ls` output need
  `role="table"`/`row`/`cell`; green-on-black contrast must still pass AA
  for the faint step.
- **Motion specialist**: only the cursor and backdrop move.

## 8. Presentation metaphor

| Content type | Presented as |
|---|---|
| Entity list | `ls -la ~/projects --sort=time` — perms, year, kind, link, `# stat` |
| Entity detail | `cat <slug>/README.md`, screenshot as a green-tinted `imgcat` that clears on hover |
| Entity headline | its defining commit message |
| Profile | `whoami` + `cat about.txt` |
| Timeline | `cat experience.log` with `[period]` prefixes |
| Skills | `cat stack.json` |
| Call to action | `contact --list`, easter egg `sudo hire-me` |
| Interaction | a working prompt: `help`, `ls`, `open <entity>`, `cd <page>`, `world <name>`, `clear`; ↑/↓ history |

## 9. Copy voice

Commit messages and shell output: lowercase, conventional-commit prefixes
(`feat(planner):`, `perf(search):`), arrows as `->`. Errors are honest
(`open: foo: no such project (try ls)`).

## 10. Do / Don't

- Do: make the prompt actually navigate — `open x` must reach the same page
  the default card links to.
- Do: derive every `# stat` comment from the content model.
- Don't: fake a terminal that only accepts the demo commands.
- Don't: use uppercase display type or soft shadows — that's a costume.

## 11. Pre-output checklist

- [ ] Every section is a prompt + output pair
- [ ] The prompt handles `help` and unknown commands
- [ ] `ls` rows align on a grid, and collapse sensibly at ~390px
- [ ] Cursor/backdrop stop under reduced motion
- [ ] Faint text still meets contrast on the green-black background
