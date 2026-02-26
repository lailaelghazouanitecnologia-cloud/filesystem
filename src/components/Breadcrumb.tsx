import React from "react";
import type { FileNode } from "../types";
import { getPath } from "../store/fileSystem";

interface BreadcrumbProps {
  fs: Map<string, FileNode>;
  currentFolderId: string;
  onNavigate: (folderId: string) => void;
}

export default function Breadcrumb({ fs, currentFolderId, onNavigate }: BreadcrumbProps) {
  const path = getPath(fs, currentFolderId);

  return (
    <div className="breadcrumb">
      {path.map((node, i) => (
        <React.Fragment key={node.id}>
          {i > 0 && (
            <span className="material-symbols-rounded breadcrumb-sep" style={{ fontSize: 16 }}>
              chevron_right
            </span>
          )}
          <button
            className={`breadcrumb-item ${i === path.length - 1 ? "active" : ""}`}
            onClick={() => onNavigate(node.id)}
          >
            {node.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
