import React, { useState } from "react";
import type { FileNode } from "../types";
import { getChildren } from "../store/fileSystem";
import { FileIcon } from "./Icons";

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
        style={{ paddingLeft: depth * 16 + 8 }}
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
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
            chevron_right
          </span>
        </span>
        <FileIcon type="folder" size={18} />
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
      <div className="sidebar-header">
        <span className="material-symbols-rounded" style={{ fontSize: 22, color: "#3b82f6" }}>
          folder_special
        </span>
        <span className="sidebar-title">Explorer</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Quick Access</div>
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
              <FileIcon type="folder" size={18} />
              <span>{name}</span>
            </div>
          );
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Folders</div>
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
        <div className="storage-info">
          <div className="storage-bar">
            <div className="storage-used" style={{ width: "42%" }} />
          </div>
          <span className="storage-text">128.4 GB of 512 GB used</span>
        </div>
      </div>
    </aside>
  );
}
