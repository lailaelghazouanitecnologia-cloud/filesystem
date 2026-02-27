import React from "react";
import type { FileNode } from "../types";
import { formatSize, formatDate, getPath } from "../store/fileSystem";
import { FileIcon } from "./Icons";
import {
  X,
  FileText,
  Image,
  Music,
  Film,
  Archive,
  FileSpreadsheet,
  FileCode,
  Play,
  Pause,
  Volume2,
  Maximize,
} from "lucide-react";

interface FileViewerProps {
  fs: Map<string, FileNode>;
  file: FileNode;
  onClose: () => void;
}

/* ---------- Language label map ---------- */
const langMap: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript (JSX)", js: "JavaScript", jsx: "JavaScript (JSX)",
  py: "Python", rs: "Rust", go: "Go", java: "Java", c: "C", cpp: "C++", h: "C Header",
  rb: "Ruby", php: "PHP", swift: "Swift", kt: "Kotlin", lua: "Lua", r: "R",
  css: "CSS", html: "HTML", xml: "XML", sql: "SQL", sh: "Shell", bash: "Bash",
  json: "JSON", yaml: "YAML", yml: "YAML", toml: "TOML", md: "Markdown",
  txt: "Plain Text", csv: "CSV", svg: "SVG", dockerfile: "Dockerfile",
  makefile: "Makefile", gitignore: "Git Ignore", ini: "INI", cfg: "Config",
  env: "Environment",
};

/* ---------- Renderers ---------- */

function CodeRenderer({ file }: { file: FileNode }) {
  const lines = file.content?.split("\n") ?? [];
  const ext = file.extension?.toLowerCase() ?? file.name.toLowerCase();
  const lang = langMap[ext] ?? "Text";

  return (
    <div className="renderer-code">
      <div className="renderer-code-lang">{lang}</div>
      <div className="renderer-code-scroll">
        <div className="file-viewer-code">
          <div className="file-viewer-line-numbers">
            {lines.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          <pre className="file-viewer-source">{file.content}</pre>
        </div>
      </div>
    </div>
  );
}

function MarkdownRenderer({ file }: { file: FileNode }) {
  const content = file.content ?? "";
  const blocks = content.split("\n");

  return (
    <div className="renderer-markdown">
      <div className="renderer-markdown-content">
        {blocks.map((line, i) => {
          if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
          if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
          if (line.startsWith("# ")) return <h1 key={i}>{line.slice(2)}</h1>;
          if (line.startsWith("- ")) return <li key={i}>{line.slice(2)}</li>;
          if (/^\d+\.\s/.test(line)) return <li key={i} className="ordered">{line.replace(/^\d+\.\s/, "")}</li>;
          if (line.trim() === "") return <br key={i} />;
          return <p key={i}>{line}</p>;
        })}
      </div>
    </div>
  );
}

function CsvRenderer({ file }: { file: FileNode }) {
  const content = file.content ?? "";
  const rows = content.split("\n").filter(Boolean).map((r) => r.split(","));

  return (
    <div className="renderer-csv">
      <table className="renderer-csv-table">
        {rows.length > 0 && (
          <thead>
            <tr>
              {rows[0].map((cell, i) => (
                <th key={i}>{cell.trim()}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.slice(1).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell.trim()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SvgRenderer({ file }: { file: FileNode }) {
  if (!file.content) return <ImagePlaceholder file={file} />;
  return (
    <div className="renderer-svg">
      <div
        className="renderer-svg-preview"
        dangerouslySetInnerHTML={{ __html: file.content }}
      />
      <div className="renderer-svg-source">
        <CodeRenderer file={file} />
      </div>
    </div>
  );
}

function ImagePlaceholder({ file }: { file: FileNode }) {
  const ext = file.extension?.toUpperCase() ?? "IMG";
  const dims = file.size > 5000000 ? "3840 × 2160" : file.size > 1000000 ? "1920 × 1080" : "800 × 600";

  return (
    <div className="renderer-image">
      <div className="renderer-image-canvas">
        <Image size={56} strokeWidth={0.8} />
      </div>
      <div className="renderer-image-info">
        <h3>{file.name}</h3>
        <div className="renderer-image-details">
          <span>{ext}</span>
          <span>{dims} (estimated)</span>
          <span>{formatSize(file.size)}</span>
        </div>
      </div>
    </div>
  );
}

function AudioRenderer({ file }: { file: FileNode }) {
  const ext = file.extension?.toUpperCase() ?? "AUDIO";
  const durationSec = Math.floor(file.size / 16000);
  const min = Math.floor(durationSec / 60);
  const sec = durationSec % 60;

  return (
    <div className="renderer-audio">
      <div className="renderer-audio-player">
        <div className="renderer-audio-art">
          <Music size={32} strokeWidth={1} />
        </div>
        <div className="renderer-audio-details">
          <span className="renderer-audio-title">{file.name}</span>
          <span className="renderer-audio-format">{ext} · {formatSize(file.size)}</span>
        </div>
        <div className="renderer-audio-controls">
          <button className="renderer-audio-btn"><Play size={16} /></button>
        </div>
      </div>
      <div className="renderer-audio-wave">
        <div className="renderer-audio-progress" />
        <div className="renderer-audio-time">
          <span>0:00</span>
          <span>{min}:{sec.toString().padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function VideoRenderer({ file }: { file: FileNode }) {
  const ext = file.extension?.toUpperCase() ?? "VIDEO";

  return (
    <div className="renderer-video">
      <div className="renderer-video-screen">
        <Film size={56} strokeWidth={0.8} />
        <span className="renderer-video-badge">{ext}</span>
      </div>
      <div className="renderer-video-bar">
        <button className="renderer-audio-btn"><Play size={14} /></button>
        <div className="renderer-video-progress"><div /></div>
        <button className="renderer-audio-btn"><Volume2 size={14} /></button>
        <button className="renderer-audio-btn"><Maximize size={14} /></button>
        <span className="renderer-video-size">{formatSize(file.size)}</span>
      </div>
    </div>
  );
}

function PdfRenderer({ file }: { file: FileNode }) {
  return (
    <div className="renderer-pdf">
      <div className="renderer-pdf-page">
        <FileText size={48} strokeWidth={0.8} />
        <div className="renderer-pdf-lines">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="renderer-pdf-line" style={{ width: `${60 + Math.random() * 35}%` }} />
          ))}
        </div>
      </div>
      <div className="renderer-image-info">
        <h3>{file.name}</h3>
        <div className="renderer-image-details">
          <span>PDF Document</span>
          <span>{formatSize(file.size)}</span>
          <span>{formatDate(file.modifiedAt)}</span>
        </div>
      </div>
    </div>
  );
}

function SpreadsheetRenderer({ file }: { file: FileNode }) {
  return (
    <div className="renderer-spreadsheet">
      <div className="renderer-spreadsheet-mock">
        <div className="renderer-spreadsheet-header">
          {["A", "B", "C", "D", "E"].map((col) => (
            <div key={col} className="renderer-spreadsheet-col">{col}</div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, r) => (
          <div key={r} className="renderer-spreadsheet-row">
            <div className="renderer-spreadsheet-rownum">{r + 1}</div>
            {Array.from({ length: 5 }, (_, c) => (
              <div key={c} className="renderer-spreadsheet-cell" />
            ))}
          </div>
        ))}
      </div>
      <div className="renderer-image-info">
        <h3>{file.name}</h3>
        <div className="renderer-image-details">
          <span>{file.extension?.toUpperCase()} Spreadsheet</span>
          <span>{formatSize(file.size)}</span>
        </div>
      </div>
    </div>
  );
}

function ArchiveRenderer({ file }: { file: FileNode }) {
  return (
    <div className="renderer-archive">
      <Archive size={48} strokeWidth={1} />
      <h3>{file.name}</h3>
      <div className="renderer-archive-mock">
        <div className="renderer-archive-entry">contents/</div>
        <div className="renderer-archive-entry">&nbsp;&nbsp;data/</div>
        <div className="renderer-archive-entry">&nbsp;&nbsp;&nbsp;&nbsp;files...</div>
        <div className="renderer-archive-entry">&nbsp;&nbsp;README.md</div>
      </div>
      <div className="renderer-image-details">
        <span>{file.extension?.toUpperCase()} Archive</span>
        <span>{formatSize(file.size)}</span>
      </div>
    </div>
  );
}

function GenericRenderer({ file }: { file: FileNode }) {
  return (
    <div className="file-viewer-placeholder">
      <FileIcon type={file.type} name={file.name} size={48} />
      <h3>{file.name}</h3>
      <p>No preview available for this file type</p>
      <div className="file-viewer-info-grid">
        <span>Type</span><span>{file.extension?.toUpperCase() ?? "File"}</span>
        <span>Size</span><span>{formatSize(file.size)}</span>
        <span>Modified</span><span>{formatDate(file.modifiedAt)}</span>
        <span>Created</span><span>{formatDate(file.createdAt)}</span>
      </div>
    </div>
  );
}

/* ---------- Main FileViewer ---------- */

function getRenderer(file: FileNode) {
  const ext = file.extension?.toLowerCase() ?? "";

  // CSV with content → table
  if (ext === "csv" && file.content) return <CsvRenderer file={file} />;

  // Markdown with content → rich
  if (ext === "md" && file.content) return <MarkdownRenderer file={file} />;

  // SVG → live preview + source
  if (ext === "svg") return <SvgRenderer file={file} />;

  // Code/text with content → code view
  const isTextLike =
    file.content !== undefined &&
    (["code", "document"].includes(file.type) ||
      ext in langMap ||
      ["gitconfig", "bashrc", "dockerfile"].some((n) => file.name.toLowerCase().includes(n)));

  if (isTextLike && file.content) return <CodeRenderer file={file} />;

  // Image
  if (file.type === "image" || ["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico"].includes(ext)) {
    return <ImagePlaceholder file={file} />;
  }

  // Audio
  if (file.type === "audio" || ["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) {
    return <AudioRenderer file={file} />;
  }

  // Video
  if (file.type === "video" || ["mp4", "webm", "avi", "mov", "mkv"].includes(ext)) {
    return <VideoRenderer file={file} />;
  }

  // PDF
  if (file.type === "pdf" || ext === "pdf") return <PdfRenderer file={file} />;

  // Spreadsheet
  if (file.type === "spreadsheet" || ["xls", "xlsx"].includes(ext)) {
    return <SpreadsheetRenderer file={file} />;
  }

  // Archive
  if (file.type === "archive" || ["zip", "rar", "tar", "gz", "7z"].includes(ext)) {
    return <ArchiveRenderer file={file} />;
  }

  // Document without content
  if (file.type === "document") {
    return <PdfRenderer file={file} />;
  }

  return <GenericRenderer file={file} />;
}

export default function FileViewer({ fs, file, onClose }: FileViewerProps) {
  const path = getPath(fs, file.id)
    .map((n) => n.name)
    .join(" / ");

  return (
    <div className="file-viewer">
      <header className="file-viewer-header">
        <div className="file-viewer-title">
          <FileIcon type={file.type} name={file.name} size={16} />
          <span className="file-viewer-name">{file.name}</span>
          <span className="file-viewer-path">{path}</span>
        </div>
        <div className="file-viewer-meta">
          <span>{formatSize(file.size)}</span>
          <span>{formatDate(file.modifiedAt)}</span>
        </div>
        <button className="file-viewer-close" onClick={onClose}>
          <X size={14} />
        </button>
      </header>

      <div className="file-viewer-body">
        {getRenderer(file)}
      </div>
    </div>
  );
}
