import React, { useEffect, useRef } from "react";
import type { ContextMenuState } from "../types";

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onAction: (action: string) => void;
  isFolder: boolean;
}

const fileActions = [
  { id: "open", label: "Open", icon: "open_in_new" },
  { id: "rename", label: "Rename", icon: "edit" },
  { id: "copy", label: "Copy", icon: "content_copy" },
  { id: "move", label: "Move to...", icon: "drive_file_move" },
  { id: "divider1", label: "", icon: "" },
  { id: "details", label: "Details", icon: "info" },
  { id: "divider2", label: "", icon: "" },
  { id: "delete", label: "Delete", icon: "delete", danger: true },
];

const folderActions = [
  { id: "open", label: "Open", icon: "folder_open" },
  { id: "rename", label: "Rename", icon: "edit" },
  { id: "newFile", label: "New File", icon: "note_add" },
  { id: "newFolder", label: "New Folder", icon: "create_new_folder" },
  { id: "divider1", label: "", icon: "" },
  { id: "details", label: "Details", icon: "info" },
  { id: "divider2", label: "", icon: "" },
  { id: "delete", label: "Delete", icon: "delete", danger: true },
];

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

  // Adjust position to stay within viewport
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
            className={`context-menu-item ${(action as any).danger ? "danger" : ""}`}
            onClick={() => {
              onAction(action.id);
              onClose();
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
              {action.icon}
            </span>
            <span>{action.label}</span>
          </button>
        )
      )}
    </div>
  );
}
