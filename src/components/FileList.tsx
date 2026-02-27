import React, { useMemo } from "react";
import type { FileNode, ViewMode, SortField, SortDirection } from "../types";
import { getChildren, formatSize, formatDate } from "../store/fileSystem";
import { FileIcon } from "./Icons";
import {
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
  FolderX,
} from "lucide-react";

interface FileListProps {
  fs: Map<string, FileNode>;
  currentFolderId: string;
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedFileId: string | null;
  onSelectFile: (id: string | null) => void;
  onOpenFolder: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onSort: (field: SortField) => void;
  onViewChange: (mode: ViewMode) => void;
}

export default function FileList({
  fs,
  currentFolderId,
  viewMode,
  sortField,
  sortDirection,
  selectedFileId,
  onSelectFile,
  onOpenFolder,
  onContextMenu,
  onSort,
  onViewChange,
}: FileListProps) {
  const children = useMemo(() => {
    const items = getChildren(fs, currentFolderId);

    items.sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;

      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "size":
          cmp = a.size - b.size;
          break;
        case "modifiedAt":
          cmp = a.modifiedAt.getTime() - b.modifiedAt.getTime();
          break;
        case "type":
          cmp = a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return items;
  }, [fs, currentFolderId, sortField, sortDirection]);

  const handleDoubleClick = (node: FileNode) => {
    if (node.type === "folder") onOpenFolder(node.id);
  };

  const handleClick = (e: React.MouseEvent, node: FileNode) => {
    e.stopPropagation();
    onSelectFile(node.id);
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <div
      className={`list-header-cell sortable ${sortField === field ? "active" : ""}`}
      onClick={() => onSort(field)}
    >
      {label}
      {sortField === field && (
        sortDirection === "asc"
          ? <ArrowUp size={11} style={{ marginLeft: 2 }} />
          : <ArrowDown size={11} style={{ marginLeft: 2 }} />
      )}
    </div>
  );

  return (
    <div className="file-list-container" onClick={() => onSelectFile(null)}>
      <div className="file-list-toolbar">
        <span className="file-count">{children.length} items</span>
        <div className="view-toggles">
          <button
            className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => onViewChange("grid")}
            title="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => onViewChange("list")}
            title="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="empty-folder">
          <FolderX size={36} strokeWidth={1.2} />
          <p>Empty</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="file-grid">
          {children.map((node) => (
            <div
              key={node.id}
              className={`file-grid-item ${selectedFileId === node.id ? "selected" : ""}`}
              onClick={(e) => handleClick(e, node)}
              onDoubleClick={() => handleDoubleClick(node)}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu(e, node.id);
              }}
            >
              <div className="file-grid-icon">
                <FileIcon type={node.type} size={20} />
              </div>
              <span className="file-grid-name" title={node.name}>
                {node.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="file-list">
          <div className="list-header">
            <div className="list-header-cell icon-cell" />
            <SortHeader field="name" label="Name" />
            <SortHeader field="modifiedAt" label="Modified" />
            <SortHeader field="size" label="Size" />
            <SortHeader field="type" label="Type" />
          </div>
          {children.map((node) => (
            <div
              key={node.id}
              className={`list-row ${selectedFileId === node.id ? "selected" : ""}`}
              onClick={(e) => handleClick(e, node)}
              onDoubleClick={() => handleDoubleClick(node)}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu(e, node.id);
              }}
            >
              <div className="list-cell icon-cell">
                <FileIcon type={node.type} size={15} />
              </div>
              <div className="list-cell name-cell">{node.name}</div>
              <div className="list-cell date-cell">{formatDate(node.modifiedAt)}</div>
              <div className="list-cell size-cell">{formatSize(node.size)}</div>
              <div className="list-cell type-cell">
                {node.type === "folder"
                  ? "Folder"
                  : node.extension?.toUpperCase() ?? "File"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
