import React from "react";
import type { FileType } from "../types";
import {
  Folder,
  File,
  Image,
  Film,
  Music,
  FileText,
  Code,
  Archive,
  FileSpreadsheet,
  type LucideProps,
} from "lucide-react";

const iconConfig: Record<FileType, { Icon: React.FC<LucideProps>; color: string }> = {
  folder:      { Icon: Folder,          color: "#e8a854" },
  file:        { Icon: File,            color: "#848b98" },
  image:       { Icon: Image,           color: "#c678dd" },
  video:       { Icon: Film,            color: "#e06c75" },
  audio:       { Icon: Music,           color: "#d19a66" },
  document:    { Icon: FileText,        color: "#61afef" },
  code:        { Icon: Code,            color: "#98c379" },
  archive:     { Icon: Archive,         color: "#e5c07b" },
  pdf:         { Icon: FileText,        color: "#e06c75" },
  spreadsheet: { Icon: FileSpreadsheet, color: "#98c379" },
};

export function FileIcon({ type, size = 16 }: { type: FileType; size?: number }) {
  const { Icon, color } = iconConfig[type] ?? iconConfig.file;
  return <Icon size={size} color={color} strokeWidth={1.6} />;
}
