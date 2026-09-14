import type { Folder } from './notesApi'

export type FolderNode = Folder & { children: FolderNode[] }

export function buildFolderTree(folders: Folder[]): FolderNode[] {
  const byId = new Map<number, FolderNode>(folders.map((f) => [f.id, { ...f, children: [] }]))
  const roots: FolderNode[] = []
  for (const node of byId.values()) {
    if (node.parentId != null && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sortByName = (nodes: FolderNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => sortByName(n.children))
  }
  sortByName(roots)
  return roots
}
