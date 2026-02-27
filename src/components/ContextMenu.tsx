import React, { useEffect, useRef } from "react";
import type { ContextMenuState } from "../types";
import {
  ExternalLink,
  Pencil,
  Copy,
  FolderInput,
  Info,
  Trash2,
  FolderOpen,
  FilePlus,
  FolderPlus,
} from "lucide-react";

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onAction: (action: string) => void;
  isFolder: boolean;
}

const fileActions = [
  { id: "open", label: "Open", Icon: ExternalLink },
  { id: "rename", label: "Rename", Icon: Pencil },
  { id: "copy", label: "Copy", Icon: Copy },
  { id: "move", label: "Move to...", Icon: FolderInput },
  { id: "divider1" },
  { id: "details", label: "Details", Icon: Info },
  { id: "divider2" },
  { id: "delete", label: "Delete", Icon: Trash2, danger: true },
] as const;

const folderActions = [
  { id: "open", label: "Open", Icon: FolderOpen },
  { id: "rename", label: "Rename", Icon: Pencil },
  { id: "newFile", label: "New File", Icon: FilePlus },
  { id: "newFolder", label: "New Folder", Icon: FolderPlus },
  { id: "divider1" },
  { id: "details", label: "Details", Icon: Info },
  { id: "divider2" },
  { id: "delete", label: "Delete", Icon: Trash2, danger: true },
] as const;

export default function ContextMenu({ state, onClose, onAction, isFolder }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const actions = isFolder ? folderActions : fileActions;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Element)) onClose();
    };
    if (state.visible) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [state.visible, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (state.visible) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [state.visible, onClose]);

  if (!state.visible) return null;

  const x = Math.min(state.x, window.innerWidth - 200);
  const y = Math.min(state.y, window.innerHeight - 300);

  return (
    <div className="context-menu" ref={ref} style={{ left: x, top: y }}>
      {actions.map((action) =>
        action.id.startsWith("divider") ? (
          <div key={action.id} className="context-menu-divider" />
        ) : (
          <button
            key={action.id}
            className={`context-menu-item ${"danger" in action && action.danger ? "danger" : ""}`}
            onClick={() => {
              onAction(action.id);
              onClose();
            }}
          >
            {"Icon" in action && action.Icon && <action.Icon size={14} strokeWidth={1.6} />}
            <span>{"label" in action ? action.label : ""}</span>
          </button>
        )
      )}
    </div>
  );
}
