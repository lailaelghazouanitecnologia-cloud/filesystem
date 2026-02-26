import React from "react";
import type { FileType } from "../types";

const iconMap: Record<FileType, { icon: string; color: string }> = {
  folder: { icon: "folder", color: "#f59e0b" },
  file: { icon: "description", color: "#94a3b8" },
  image: { icon: "image", color: "#ec4899" },
  video: { icon: "movie", color: "#ef4444" },
  audio: { icon: "music_note", color: "#8b5cf6" },
  document: { icon: "article", color: "#3b82f6" },
  code: { icon: "code", color: "#10b981" },
  archive: { icon: "folder_zip", color: "#f97316" },
  pdf: { icon: "picture_as_pdf", color: "#ef4444" },
  spreadsheet: { icon: "table_chart", color: "#22c55e" },
};

export function FileIcon({ type, size = 24 }: { type: FileType; size?: number }) {
  const { icon, color } = iconMap[type] ?? iconMap.file;
  return (
    <span
      className="material-symbols-rounded"
      style={{ fontSize: size, color, userSelect: "none" }}
    >
      {icon}
    </span>
  );
}

export function ActionIcon({
  icon,
  size = 20,
  className,
  onClick,
  title,
}: {
  icon: string;
  size?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}) {
  return (
    <span
      className={`material-symbols-rounded action-icon ${className ?? ""}`}
      style={{ fontSize: size, cursor: onClick ? "pointer" : "default", userSelect: "none" }}
      onClick={onClick}
      title={title}
    >
      {icon}
    </span>
  );
}
