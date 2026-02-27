import React from "react";
import type { FileType } from "../types";
import { getIcon } from "material-file-icons";
import { Folder } from "lucide-react";

export function FileIcon({
  type,
  name,
  size = 16,
}: {
  type: FileType;
  name?: string;
  size?: number;
}) {
  if (type === "folder") {
    return <Folder size={size} color="#e8a854" strokeWidth={1.6} />;
  }

  // Use material-file-icons for all files — maps filename → VSCode SVG icon
  const icon = getIcon(name ?? "file");
  return (
    <span
      className="file-icon-svg"
      style={{ width: size, height: size, display: "inline-flex", flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
}
