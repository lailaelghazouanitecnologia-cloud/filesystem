import type { FileNode, FileType } from "../types";

function id(): string {
  return crypto.randomUUID();
}

function detectType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, FileType> = {
    png: "image", jpg: "image", jpeg: "image", gif: "image", svg: "image", webp: "image", bmp: "image",
    mp4: "video", webm: "video", mov: "video", avi: "video", mkv: "video",
    mp3: "audio", wav: "audio", ogg: "audio", flac: "audio",
    pdf: "pdf",
    doc: "document", docx: "document", txt: "document", rtf: "document", md: "document",
    xls: "spreadsheet", xlsx: "spreadsheet", csv: "spreadsheet",
    zip: "archive", rar: "archive", tar: "archive", gz: "archive", "7z": "archive",
    ts: "code", tsx: "code", js: "code", jsx: "code", py: "code", rs: "code",
    go: "code", java: "code", c: "code", cpp: "code", h: "code", css: "code",
    html: "code", json: "code", yaml: "code", yml: "code", toml: "code",
    sh: "code", bash: "code", sql: "code", rb: "code", php: "code",
  };
  return map[ext] || "file";
}

function makeFile(name: string, parentId: string, size?: number, content?: string): FileNode {
  const ext = name.includes(".") ? name.split(".").pop()! : undefined;
  return {
    id: id(),
    name,
    type: detectType(name),
    size: size ?? Math.floor(Math.random() * 500000) + 100,
    modifiedAt: new Date(Date.now() - Math.random() * 1e10),
    createdAt: new Date(Date.now() - Math.random() * 2e10),
    parentId,
    extension: ext,
    content,
  };
}

function makeFolder(name: string, parentId: string | null): FileNode {
  return {
    id: id(),
    name,
    type: "folder",
    size: 0,
    modifiedAt: new Date(Date.now() - Math.random() * 1e10),
    createdAt: new Date(Date.now() - Math.random() * 2e10),
    parentId,
    children: [],
  };
}

export function createInitialFileSystem(): Map<string, FileNode> {
  const fs = new Map<string, FileNode>();

  const add = (node: FileNode) => {
    fs.set(node.id, node);
    if (node.parentId) {
      const parent = fs.get(node.parentId);
      if (parent?.children) parent.children.push(node.id);
    }
    return node;
  };

  // Root
  const root = add(makeFolder("Root", null));

  // Documents
  const docs = add(makeFolder("Documents", root.id));
  add(makeFile("resume.pdf", docs.id, 245000));
  add(makeFile("notes.md", docs.id, 3200, "# Meeting Notes\n\n- Discussed project timeline\n- Assigned tasks to team members\n- Next meeting: Friday 3pm\n\n## Action Items\n1. Update documentation\n2. Review pull requests\n3. Deploy staging environment"));
  add(makeFile("report-2024.docx", docs.id, 890000));
  add(makeFile("budget.xlsx", docs.id, 156000));
  add(makeFile("todo.txt", docs.id, 512, "- Build file explorer\n- Add search feature\n- Implement dark mode\n- Deploy to production"));

  const workDocs = add(makeFolder("Work", docs.id));
  add(makeFile("contract.pdf", workDocs.id, 1200000));
  add(makeFile("presentation.pdf", workDocs.id, 5400000));
  add(makeFile("meeting-minutes.md", workDocs.id, 2800, "# Sprint Planning\n\nDate: 2024-01-15\n\n## Attendees\n- Alice, Bob, Charlie\n\n## Discussion\nReviewed backlog items and estimated story points."));

  // Projects
  const projects = add(makeFolder("Projects", root.id));

  const web = add(makeFolder("web-app", projects.id));
  add(makeFile("package.json", web.id, 1200, '{\n  "name": "web-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}'));
  add(makeFile("tsconfig.json", web.id, 640, '{\n  "compilerOptions": {\n    "target": "ESNext",\n    "module": "ESNext",\n    "strict": true\n  }\n}'));
  add(makeFile("index.html", web.id, 890));
  add(makeFile("vite.config.ts", web.id, 320));

  const src = add(makeFolder("src", web.id));
  add(makeFile("App.tsx", src.id, 4500, 'import React from "react";\n\nexport default function App() {\n  return (\n    <div className="app">\n      <h1>Hello World</h1>\n    </div>\n  );\n}'));
  add(makeFile("main.tsx", src.id, 280, 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(\n  document.getElementById("root")!\n).render(<App />);'));
  add(makeFile("styles.css", src.id, 2100, "body {\n  margin: 0;\n  font-family: system-ui;\n  background: #0a0a0a;\n  color: #fafafa;\n}"));
  add(makeFile("utils.ts", src.id, 1800));

  const api = add(makeFolder("api-server", projects.id));
  add(makeFile("server.ts", api.id, 3200, 'import express from "express";\n\nconst app = express();\nconst PORT = 3001;\n\napp.get("/api/health", (req, res) => {\n  res.json({ status: "ok" });\n});\n\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});'));
  add(makeFile("database.ts", api.id, 5600));
  add(makeFile("routes.ts", api.id, 4200));
  add(makeFile("middleware.ts", api.id, 1900));
  add(makeFile("Dockerfile", api.id, 450, "FROM node:20-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3001\nCMD [\"node\", \"dist/server.js\"]"));

  // Pictures
  const pics = add(makeFolder("Pictures", root.id));
  add(makeFile("vacation-beach.jpg", pics.id, 3400000));
  add(makeFile("family-photo.png", pics.id, 5200000));
  add(makeFile("screenshot-2024.png", pics.id, 890000));
  add(makeFile("logo.svg", pics.id, 12000, '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" fill="#3b82f6"/>\n</svg>'));

  const wallpapers = add(makeFolder("Wallpapers", pics.id));
  add(makeFile("mountains.jpg", wallpapers.id, 8200000));
  add(makeFile("sunset.jpg", wallpapers.id, 6100000));
  add(makeFile("city-night.png", wallpapers.id, 9500000));

  // Music
  const music = add(makeFolder("Music", root.id));
  add(makeFile("playlist.m3u", music.id, 340));
  const rock = add(makeFolder("Rock", music.id));
  add(makeFile("track-01.mp3", rock.id, 7800000));
  add(makeFile("track-02.mp3", rock.id, 6200000));
  add(makeFile("track-03.flac", rock.id, 32000000));

  const electronic = add(makeFolder("Electronic", music.id));
  add(makeFile("synthwave-mix.mp3", electronic.id, 12000000));
  add(makeFile("ambient-01.ogg", electronic.id, 4500000));

  // Videos
  const videos = add(makeFolder("Videos", root.id));
  add(makeFile("tutorial-react.mp4", videos.id, 245000000));
  add(makeFile("demo-recording.webm", videos.id, 89000000));
  add(makeFile("presentation.mov", videos.id, 156000000));

  // Downloads
  const downloads = add(makeFolder("Downloads", root.id));
  add(makeFile("archive-backup.zip", downloads.id, 67000000));
  add(makeFile("installer.tar.gz", downloads.id, 34000000));
  add(makeFile("ebook-rust.pdf", downloads.id, 12000000));
  add(makeFile("dataset.csv", downloads.id, 28000000));
  add(makeFile("font-pack.zip", downloads.id, 4500000));
  add(makeFile("cheatsheet.png", downloads.id, 1200000));

  // Config
  const config = add(makeFolder(".config", root.id));
  add(makeFile(".gitconfig", config.id, 230, "[user]\n  name = Developer\n  email = dev@example.com\n[core]\n  editor = code\n  autocrlf = input"));
  add(makeFile(".bashrc", config.id, 1800, '# Bash configuration\nexport PATH="$HOME/.local/bin:$PATH"\n\nalias ll="ls -la"\nalias gs="git status"\nalias gc="git commit"'));
  add(makeFile("settings.json", config.id, 640, '{\n  "editor.fontSize": 14,\n  "editor.theme": "dark",\n  "terminal.shell": "/bin/bash"\n}'));

  return fs;
}

export function getRootId(fs: Map<string, FileNode>): string {
  for (const [nodeId, node] of fs) {
    if (node.parentId === null) return nodeId;
  }
  throw new Error("No root node found");
}

export function getChildren(fs: Map<string, FileNode>, parentId: string): FileNode[] {
  const parent = fs.get(parentId);
  if (!parent?.children) return [];
  return parent.children.map((cid) => fs.get(cid)!).filter(Boolean);
}

export function getPath(fs: Map<string, FileNode>, nodeId: string): FileNode[] {
  const path: FileNode[] = [];
  let current = fs.get(nodeId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? fs.get(current.parentId) : undefined;
  }
  return path;
}

export function getAllFolders(fs: Map<string, FileNode>): FileNode[] {
  return Array.from(fs.values()).filter((n) => n.type === "folder");
}

export function searchFiles(fs: Map<string, FileNode>, query: string): FileNode[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  const results: FileNode[] = [];

  for (const node of fs.values()) {
    if (node.parentId === null) continue;
    const name = node.name.toLowerCase();

    // Exact substring match - highest priority
    if (name.includes(lower)) {
      results.push(node);
      continue;
    }

    // Fuzzy match
    if (fuzzyMatch(name, lower)) {
      results.push(node);
    }
  }

  // Sort: exact prefix first, then substring, then fuzzy
  return results.sort((a, b) => {
    const an = a.name.toLowerCase();
    const bn = b.name.toLowerCase();
    const aPrefix = an.startsWith(lower) ? 0 : an.includes(lower) ? 1 : 2;
    const bPrefix = bn.startsWith(lower) ? 0 : bn.includes(lower) ? 1 : 2;
    if (aPrefix !== bPrefix) return aPrefix - bPrefix;
    return an.localeCompare(bn);
  });
}

function fuzzyMatch(text: string, pattern: string): boolean {
  let ti = 0;
  let pi = 0;
  while (ti < text.length && pi < pattern.length) {
    if (text[ti] === pattern[pi]) pi++;
    ti++;
  }
  return pi === pattern.length;
}

export function createNode(
  fs: Map<string, FileNode>,
  parentId: string,
  name: string,
  isFolder: boolean
): FileNode {
  const node = isFolder ? makeFolder(name, parentId) : makeFile(name, parentId, undefined, "");
  fs.set(node.id, node);
  const parent = fs.get(parentId);
  if (parent?.children) parent.children.push(node.id);
  return node;
}

export function renameNode(fs: Map<string, FileNode>, nodeId: string, newName: string): void {
  const node = fs.get(nodeId);
  if (!node) return;
  node.name = newName;
  if (node.type !== "folder") {
    const ext = newName.includes(".") ? newName.split(".").pop()! : undefined;
    node.extension = ext;
    node.type = detectType(newName);
  }
  node.modifiedAt = new Date();
}

export function deleteNode(fs: Map<string, FileNode>, nodeId: string): void {
  const node = fs.get(nodeId);
  if (!node) return;

  // Remove from parent's children
  if (node.parentId) {
    const parent = fs.get(node.parentId);
    if (parent?.children) {
      parent.children = parent.children.filter((cid) => cid !== nodeId);
    }
  }

  // Recursively delete children
  if (node.children) {
    for (const childId of [...node.children]) {
      deleteNode(fs, childId);
    }
  }

  fs.delete(nodeId);
}

export function moveNode(fs: Map<string, FileNode>, nodeId: string, newParentId: string): void {
  const node = fs.get(nodeId);
  if (!node) return;

  // Remove from old parent
  if (node.parentId) {
    const oldParent = fs.get(node.parentId);
    if (oldParent?.children) {
      oldParent.children = oldParent.children.filter((cid) => cid !== nodeId);
    }
  }

  // Add to new parent
  node.parentId = newParentId;
  const newParent = fs.get(newParentId);
  if (newParent?.children) {
    newParent.children.push(nodeId);
  }

  node.modifiedAt = new Date();
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
