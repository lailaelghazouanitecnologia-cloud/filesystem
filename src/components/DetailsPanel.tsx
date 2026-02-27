import React from "react";
import type { FileNode } from "../types";
import { formatSize, formatDate, getPath } from "../store/fileSystem";
import { FileIcon } from "./Icons";
import { X } from "lucide-react";

interface DetailsPanelProps {
  fs: Map<string, FileNode>;
  file: FileNode | null;
  onClose: () => void;
}

export default function DetailsPanel({ fs, file, onClose }: DetailsPanelProps) {
  if (!file) return null;

  const path = getPath(fs, file.id)
    .map((n) => n.name)
    .join(" / ");

  const isTextFile =
    file.content !== undefined ||
    ["code", "document"].includes(file.type) ||
    ["md", "txt", "json", "yaml", "yml", "toml", "sh", "bash", "sql", "csv"].includes(
      file.extension ?? ""
    );

  return (
    <aside className="details-panel">
      <div className="details-header">
        <h3>Details</h3>
        <button className="details-close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className="details-icon-section">
        <FileIcon type={file.type} size={32} />
        <h4 className="details-filename">{file.name}</h4>
      </div>

      <div className="details-meta">
        <div className="details-row">
          <span className="details-label">Type</span>
          <span className="details-value">
            {file.type === "folder"
              ? "Folder"
              : file.extension?.toUpperCase() ?? "File"}
          </span>
        </div>
        <div className="details-row">
          <span className="details-label">Size</span>
          <span className="details-value">{formatSize(file.size)}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Modified</span>
          <span className="details-value">{formatDate(file.modifiedAt)}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Created</span>
          <span className="details-value">{formatDate(file.createdAt)}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Path</span>
          <span className="details-value details-path">{path}</span>
        </div>
      </div>

      {file.content && isTextFile && (
        <div className="details-preview">
          <div className="details-preview-header">Preview</div>
          <pre className="details-preview-content">{file.content}</pre>
        </div>
      )}

      {file.type === "folder" && file.children && (
        <div className="details-meta" style={{ marginTop: 8 }}>
          <div className="details-row">
            <span className="details-label">Items</span>
            <span className="details-value">{file.children.length}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
