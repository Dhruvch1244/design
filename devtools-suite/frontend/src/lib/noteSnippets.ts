export type SlashCommand = {
  id: string
  label: string
  hint: string
  /** Plain-text commands: inserted directly, {cursor} marks where the caret should land after. */
  template?: string | (() => string)
  /** Special commands handled by the caller instead of simple text insertion (image picker, task picker). */
  special?: 'image' | 'task-ref'
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'table', label: 'Table', hint: '3×3 markdown table', template: '| {cursor} | Col 2 | Col 3 |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |\n' },
  { id: 'task', label: 'To-do', hint: 'Checklist item', template: '- [ ] {cursor}' },
  { id: 'bullet', label: 'Bulleted list', hint: '', template: '- {cursor}' },
  { id: 'numbered', label: 'Numbered list', hint: '', template: '1. {cursor}' },
  { id: 'h1', label: 'Heading 1', hint: '', template: '# {cursor}' },
  { id: 'h2', label: 'Heading 2', hint: '', template: '## {cursor}' },
  { id: 'h3', label: 'Heading 3', hint: '', template: '### {cursor}' },
  { id: 'quote', label: 'Quote', hint: '', template: '> {cursor}' },
  { id: 'code', label: 'Code block', hint: '', template: '```\n{cursor}\n```' },
  { id: 'divider', label: 'Divider', hint: 'Horizontal rule', template: '---\n{cursor}' },
  {
    id: 'date',
    label: "Today's date",
    hint: '',
    template: () => new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + '{cursor}',
  },
  { id: 'image', label: 'Image', hint: 'Upload from disk', special: 'image' },
  { id: 'task-ref', label: 'Link a task', hint: 'Live status from Task List', special: 'task-ref' },
]

/** Resolves a template that may be a function (for dynamic content like today's date). */
export function resolveTemplate(cmd: SlashCommand): string {
  return typeof cmd.template === 'function' ? cmd.template() : cmd.template ?? ''
}

export function imageMarkdown(alt: string, dataUrl: string): string {
  return `![${alt}](${dataUrl})`
}

export function taskRefMarkdown(id: number): string {
  return `[[task:${id}]]`
}
