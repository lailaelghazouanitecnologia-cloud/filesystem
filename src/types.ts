export type FileType =
  | "folder"
  | "file"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "code"
  | "archive"
  | "pdf"
  | "spreadsheet";

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  size: number;
  modifiedAt: Date;
  createdAt: Date;
  parentId: string | null;
  children?: string[];
  content?: string;
  extension?: string;
  metadata?: Record<string, string | number>;
}

export type ViewMode = "grid" | "list";
export type SortField = "name" | "size" | "modifiedAt" | "type";
export type SortDirection = "asc" | "desc";

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  targetId: string | null;
}
