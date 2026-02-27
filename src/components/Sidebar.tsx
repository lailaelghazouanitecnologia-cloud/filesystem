import React, { useState } from "react";
import type { FileNode } from "../types";
import { getChildren } from "../store/fileSystem";
import { FileIcon } from "./Icons";
import { ChevronRight } from "lucide-react";

interface SidebarProps {
  fs: Map<string, FileNode>;
  rootId: string;
  currentFolderId: string;
  onNavigate: (folderId: string) => void;
}

function FolderTree({
  fs,
  nodeId,
  currentFolderId,
  onNavigate,
  depth,
}: {
  fs: Map<string, FileNode>;
  nodeId: string;
  currentFolderId: string;
  onNavigate: (id: string) => void;
  depth: number;
}) {
  const node = fs.get(nodeId);
  if (!node || node.type !== "folder") return null;

  const [expanded, setExpanded] = useState(depth < 1);
  const children = getChildren(fs, nodeId).filter((c) => c.type === "folder");
  const isActive = nodeId === currentFolderId;

  return (
    <div className="tree-node">
      <div
        className={`tree-item ${isActive ? "active" : ""}`}
        style={{ paddingLeft: depth * 14 + 8 }}
        onClick={() => {
          onNavigate(nodeId);
          setExpanded(true);
        }}
      >
        <span
          className={`tree-arrow ${children.length === 0 ? "invisible" : ""} ${expanded ? "expanded" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <ChevronRight size={12} />
        </span>
        <FileIcon type="folder" size={14} />
        <span className="tree-name">{node.name}</span>
      </div>
      {expanded &&
        children.map((child) => (
          <FolderTree
            key={child.id}
            fs={fs}
            nodeId={child.id}
            currentFolderId={currentFolderId}
            onNavigate={onNavigate}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

export default function Sidebar({ fs, rootId, currentFolderId, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section" style={{ paddingTop: 10 }}>
        <div className="sidebar-section-title">Pinned</div>
        {["Documents", "Pictures", "Downloads", "Projects"].map((name) => {
          const node = Array.from(fs.values()).find(
            (n) => n.name === name && n.parentId === rootId
          );
          if (!node) return null;
          return (
            <div
              key={node.id}
              className={`quick-access-item ${node.id === currentFolderId ? "active" : ""}`}
              onClick={() => onNavigate(node.id)}
            >
              <FileIcon type="folder" size={14} />
              <span>{name}</span>
            </div>
          );
        })}
      </div>

      <div className="sidebar-section sidebar-section-tree">
        <div className="sidebar-section-title">Tree</div>
        <div className="tree-container">
          <FolderTree
            fs={fs}
            nodeId={rootId}
            currentFolderId={currentFolderId}
            onNavigate={onNavigate}
            depth={0}
          />
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="storage-widget">
          <div className="storage-icon-ring">
            <svg viewBox="0 0 36 36" className="storage-ring-svg">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${0.42 * 97.4} ${97.4}`}
                transform="rotate(-90 18 18)"
              />
            </svg>
            <svg viewBox="0 0 24 24" className="storage-disk-icon" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
            </svg>
          </div>
          <div className="storage-details">
            <span className="storage-label">Storage</span>
            <span className="storage-amount">
              <strong>128.4</strong> / 512 GB
            </span>
            <div className="storage-bar">
              <div className="storage-used" style={{ width: "42%" }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
