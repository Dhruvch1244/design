import { useState } from 'react'
import { CaretDown, CaretRight, Folder as FolderIcon, Plus, Trash } from '@phosphor-icons/react'
import type { FolderNode } from '../lib/folderTree'

export function FolderTree({
  nodes,
  selectedId,
  onSelect,
  onAddChild,
  onDelete,
  depth = 0,
}: {
  nodes: FolderNode[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  onAddChild: (parentId: number) => void
  onDelete: (id: number) => void
  depth?: number
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <FolderRow key={node.id} node={node} selectedId={selectedId} onSelect={onSelect} onAddChild={onAddChild} onDelete={onDelete} depth={depth} />
      ))}
    </div>
  )
}

function FolderRow({
  node,
  selectedId,
  onSelect,
  onAddChild,
  onDelete,
  depth,
}: {
  node: FolderNode
  selectedId: number | null
  onSelect: (id: number | null) => void
  onAddChild: (parentId: number) => void
  onDelete: (id: number) => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(true)
  const active = selectedId === node.id
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs transition-colors ${
          active ? 'bg-white/[0.08] text-ink' : 'text-ink-soft hover:bg-white/[0.04]'
        }`}
        style={{ paddingLeft: 6 + depth * 14 }}
      >
        <button onClick={() => setExpanded((e) => !e)} className={hasChildren ? '' : 'opacity-0'}>
          {expanded ? <CaretDown size={10} weight="bold" /> : <CaretRight size={10} weight="bold" />}
        </button>
        <button onClick={() => onSelect(node.id)} className="flex flex-1 items-center gap-1.5 truncate text-left">
          <FolderIcon size={13} weight="light" style={{ color: node.colorTag ?? undefined }} />
          <span className="truncate">{node.name}</span>
        </button>
        <button onClick={() => onAddChild(node.id)} className="opacity-0 transition-opacity hover:text-cyan group-hover:opacity-100" title="New subfolder">
          <Plus size={11} weight="bold" />
        </button>
        <button onClick={() => onDelete(node.id)} className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100" title="Delete folder">
          <Trash size={11} weight="light" />
        </button>
      </div>
      {expanded && hasChildren && (
        <FolderTree nodes={node.children} selectedId={selectedId} onSelect={onSelect} onAddChild={onAddChild} onDelete={onDelete} depth={depth + 1} />
      )}
    </div>
  )
}
