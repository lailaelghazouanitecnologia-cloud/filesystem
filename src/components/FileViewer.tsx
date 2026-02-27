import React, { useState, useRef, useEffect, useMemo } from "react";
import type { FileNode } from "../types";
import { formatSize, formatDate, getPath } from "../store/fileSystem";
import { FileIcon } from "./Icons";
import { Highlighted, getLang } from "../utils/tokenizer";
import {
  X,
  FileText,
  Image,
  Music,
  Film,
  Archive,
  FileSpreadsheet,
  Play,
  Volume2,
  Maximize,
  Pencil,
  Check,
  Undo2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Folder,
  File,
  Hash,
} from "lucide-react";

interface FileViewerProps {
  fs: Map<string, FileNode>;
  file: FileNode;
  onClose: () => void;
  onSave: (fileId: string, content: string) => void;
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

function isEditable(file: FileNode): boolean {
  const ext = file.extension?.toLowerCase() ?? "";
  return (
    file.content !== undefined ||
    ["code", "document"].includes(file.type) ||
    ext in langMap ||
    ["gitconfig", "bashrc", "dockerfile"].some((n) => file.name.toLowerCase().includes(n))
  );
}

function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ---------- Editor ---------- */

function EditorView({ file, onSave, onCancel }: { file: FileNode; onSave: (c: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(file.content ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);
  const ext = file.extension?.toLowerCase() ?? file.name.toLowerCase();
  const lang = langMap[ext] ?? "Text";
  const lines = value.split("\n");
  const hasChanges = value !== (file.content ?? "");

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleScroll = () => {
    if (textareaRef.current && lineCountRef.current)
      lineCountRef.current.scrollTop = textareaRef.current.scrollTop;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); if (hasChanges) onSave(value); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + "  " + value.substring(end);
      setValue(newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
  };

  return (
    <div className="renderer-editor">
      <div className="renderer-editor-toolbar">
        <span className="renderer-editor-lang">{lang}</span>
        <span className="renderer-editor-hint">Ctrl+S save · Esc cancel</span>
        <div className="renderer-editor-actions">
          <button className="renderer-editor-btn cancel" onClick={onCancel}><Undo2 size={13} /><span>Cancel</span></button>
          <button className="renderer-editor-btn save" onClick={() => onSave(value)} disabled={!hasChanges}><Check size={13} /><span>Save</span></button>
        </div>
      </div>
      <div className="renderer-editor-scroll">
        <div className="renderer-editor-lines" ref={lineCountRef}>
          {lines.map((_, i) => (<span key={i}>{i + 1}</span>))}
        </div>
        <textarea ref={textareaRef} className="renderer-editor-textarea" value={value} onChange={(e) => setValue(e.target.value)} onScroll={handleScroll} onKeyDown={handleKeyDown} spellCheck={false} />
      </div>
    </div>
  );
}

/* ---------- Renderers ---------- */

function CodeRenderer({ file }: { file: FileNode }) {
  const lines = file.content?.split("\n") ?? [];
  const ext = file.extension?.toLowerCase() ?? file.name.toLowerCase();
  const lang = langMap[ext] ?? "Text";
  const langHint = getLang(ext, file.name);

  return (
    <div className="renderer-code">
      <div className="renderer-code-lang">{lang}</div>
      <div className="renderer-code-scroll">
        <div className="file-viewer-code">
          <div className="file-viewer-line-numbers">
            {lines.map((_, i) => (<span key={i}>{i + 1}</span>))}
          </div>
          <pre className="file-viewer-source"><Highlighted code={file.content ?? ""} lang={langHint} /></pre>
        </div>
      </div>
    </div>
  );
}

function MarkdownRenderer({ file }: { file: FileNode }) {
  const blocks = (file.content ?? "").split("\n");
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
  const meta = file.metadata;
  const totalRows = meta?.rows ? Number(meta.rows) : rows.length - 1;
  const totalCols = meta?.cols ? Number(meta.cols) : (rows[0]?.length ?? 0);

  return (
    <div className="renderer-csv">
      <div className="renderer-csv-toolbar">
        <Hash size={12} />
        <span>{totalRows.toLocaleString()} rows × {totalCols} columns</span>
        {totalRows > rows.length - 1 && (
          <span className="renderer-csv-truncated">Showing first {rows.length - 1} rows</span>
        )}
      </div>
      <div className="renderer-csv-scroll">
        <table className="renderer-csv-table">
          {rows.length > 0 && (
            <thead>
              <tr>
                <th className="renderer-csv-rownum">#</th>
                {rows[0].map((cell, i) => (<th key={i}>{cell.trim()}</th>))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.slice(1).map((row, ri) => (
              <tr key={ri}>
                <td className="renderer-csv-rownum">{ri + 1}</td>
                {row.map((cell, ci) => (<td key={ci}>{cell.trim()}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SvgRenderer({ file }: { file: FileNode }) {
  if (!file.content) return <ImageRenderer file={file} />;
  return (
    <div className="renderer-svg">
      <div className="renderer-svg-preview" dangerouslySetInnerHTML={{ __html: file.content }} />
      <div className="renderer-svg-source"><CodeRenderer file={file} /></div>
    </div>
  );
}

/* ---------- PDF Renderer ---------- */

function PdfRenderer({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const pages = meta?.pages ? Number(meta.pages) : Math.max(1, Math.ceil(file.size / 50000));
  const [currentPage, setCurrentPage] = useState(1);

  const pageLines = useMemo(() =>
    Array.from({ length: pages }, () =>
      Array.from({ length: 14 + Math.floor(Math.random() * 6) }, () =>
        40 + Math.floor(Math.random() * 55)
      )
    ), [pages]);

  return (
    <div className="renderer-pdf-v2">
      <div className="renderer-pdf-toolbar">
        <div className="renderer-pdf-nav">
          <button className="renderer-pdf-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft size={14} />
          </button>
          <span className="renderer-pdf-page-info">
            <strong>{currentPage}</strong> / {pages}
          </span>
          <button className="renderer-pdf-btn" disabled={currentPage >= pages} onClick={() => setCurrentPage((p) => p + 1)}>
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="renderer-pdf-meta-bar">
          {meta?.title && <span>{String(meta.title)}</span>}
          {meta?.author && <span>by {String(meta.author)}</span>}
        </div>
        <div className="renderer-pdf-actions">
          <ZoomOut size={13} className="renderer-pdf-icon-btn" />
          <ZoomIn size={13} className="renderer-pdf-icon-btn" />
        </div>
      </div>
      <div className="renderer-pdf-viewport">
        <div className="renderer-pdf-page-v2">
          {currentPage === 1 && meta?.title && (
            <div className="renderer-pdf-title-block">
              <div className="renderer-pdf-doc-title">{String(meta.title)}</div>
              {meta?.author && <div className="renderer-pdf-doc-author">{String(meta.author)}</div>}
              <div className="renderer-pdf-doc-divider" />
            </div>
          )}
          <div className="renderer-pdf-lines-v2">
            {(pageLines[currentPage - 1] ?? []).map((w, i) => (
              <div key={i} className="renderer-pdf-line" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="renderer-pdf-page-number">{currentPage}</div>
        </div>
      </div>
      <div className="renderer-pdf-info-bar">
        <span>{pages} pg</span>
        <span>{formatSize(file.size)}</span>
        {meta?.producer && <span>{String(meta.producer)}</span>}
      </div>
    </div>
  );
}

/* ---------- Image Renderer ---------- */

function ImageRenderer({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const w = meta?.width ? Number(meta.width) : (file.size > 5000000 ? 3840 : file.size > 1000000 ? 1920 : 800);
  const h = meta?.height ? Number(meta.height) : (file.size > 5000000 ? 2160 : file.size > 1000000 ? 1080 : 600);
  const ext = file.extension?.toUpperCase() ?? "IMG";

  return (
    <div className="renderer-image-v2">
      <div className="renderer-image-preview">
        <div className="renderer-image-checkerboard">
          <Image size={64} strokeWidth={0.6} />
        </div>
      </div>
      <div className="renderer-image-sidebar">
        <div className="renderer-image-section">
          <div className="renderer-image-prop">{w} × {h}</div>
          <div className="renderer-image-prop">{ext} · {formatSize(file.size)}</div>
          {meta?.colorSpace && <div className="renderer-image-prop">{String(meta.colorSpace)}</div>}
        </div>
        {meta?.camera && (
          <div className="renderer-image-section">
            <div className="renderer-image-prop">{String(meta.camera)}</div>
            {meta?.aperture && <div className="renderer-image-prop">{String(meta.aperture)}{meta?.iso ? ` · ISO ${String(meta.iso)}` : ""}</div>}
          </div>
        )}
        <div className="renderer-image-section">
          <div className="renderer-image-prop">{formatDate(file.modifiedAt)}</div>
          <div className="renderer-image-prop">{formatDate(file.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Audio Renderer ---------- */

function AudioRenderer({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const ext = file.extension?.toUpperCase() ?? "AUDIO";
  const duration = meta?.duration ? Number(meta.duration) : Math.floor(file.size / 16000);
  const bitrate = meta?.bitrate ? Number(meta.bitrate) : 256;

  const waveform = useMemo(() =>
    Array.from({ length: 60 }, () => 0.15 + Math.random() * 0.85),
    []
  );

  return (
    <div className="renderer-audio-v2">
      <div className="renderer-audio-card">
        <div className="renderer-audio-cover">
          <Music size={36} strokeWidth={1} />
        </div>
        <div className="renderer-audio-info-v2">
          <span className="renderer-audio-track">{file.name.replace(/\.[^.]+$/, "")}</span>
          {meta?.artist && <span className="renderer-audio-artist">{String(meta.artist)}</span>}
          {meta?.album && <span className="renderer-audio-album">{String(meta.album)}</span>}
        </div>
      </div>
      <div className="renderer-audio-waveform">
        {waveform.map((h, i) => (
          <div key={i} className="renderer-audio-bar" style={{ height: `${h * 100}%` }} />
        ))}
      </div>
      <div className="renderer-audio-transport">
        <button className="renderer-audio-play"><Play size={18} /></button>
        <div className="renderer-audio-timeline">
          <div className="renderer-audio-progress-v2"><div /></div>
          <div className="renderer-audio-timestamps">
            <span>0:00</span>
            <span>{fmtDuration(duration)}</span>
          </div>
        </div>
      </div>
      <div className="renderer-audio-tags">
        <span>{ext}</span>
        <span>{bitrate} kbps</span>
        <span>{formatSize(file.size)}</span>
        <span>{fmtDuration(duration)}</span>
      </div>
    </div>
  );
}

/* ---------- Video Renderer ---------- */

function VideoRenderer({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const ext = file.extension?.toUpperCase() ?? "VIDEO";
  const duration = meta?.duration ? Number(meta.duration) : Math.floor(file.size / 100000);
  const w = meta?.width ? Number(meta.width) : 1920;
  const h = meta?.height ? Number(meta.height) : 1080;

  return (
    <div className="renderer-video-v2">
      <div className="renderer-video-player">
        <div className="renderer-video-canvas">
          <Film size={64} strokeWidth={0.6} />
          <button className="renderer-video-big-play"><Play size={28} /></button>
        </div>
        <div className="renderer-video-controls">
          <button className="renderer-video-ctrl-btn"><Play size={14} /></button>
          <span className="renderer-video-time">0:00 / {fmtDuration(duration)}</span>
          <div className="renderer-video-progress-v2"><div /></div>
          <button className="renderer-video-ctrl-btn"><Volume2 size={14} /></button>
          <button className="renderer-video-ctrl-btn"><Maximize size={14} /></button>
        </div>
      </div>
      <div className="renderer-video-details">
        <div className="renderer-video-tag">{ext}</div>
        <div className="renderer-video-tag">{w}×{h}</div>
        {meta?.fps && <div className="renderer-video-tag">{String(meta.fps)} fps</div>}
        {meta?.codec && <div className="renderer-video-tag">{String(meta.codec)}</div>}
        <div className="renderer-video-tag">{formatSize(file.size)}</div>
        <div className="renderer-video-tag">{fmtDuration(duration)}</div>
      </div>
    </div>
  );
}

/* ---------- Spreadsheet Renderer ---------- */

function SpreadsheetRenderer({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const sheets = meta?.sheets ? Number(meta.sheets) : 1;
  const rows = meta?.rows ? Number(meta.rows) : 100;
  const cols = meta?.cols ? Number(meta.cols) : 5;
  const sheetNames = meta?.sheetNames ? String(meta.sheetNames).split(",") : ["Sheet 1"];
  const [activeSheet, setActiveSheet] = useState(0);

  const colLetters = Array.from({ length: Math.min(cols, 8) }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="renderer-xl">
      <div className="renderer-xl-toolbar">
        <FileSpreadsheet size={13} />
        <span className="renderer-xl-title">{file.name}</span>
        <span className="renderer-xl-dims">{rows.toLocaleString()} rows × {cols} cols</span>
      </div>
      <div className="renderer-xl-formula">
        <span className="renderer-xl-cell-ref">A1</span>
        <span className="renderer-xl-fx">fx</span>
        <div className="renderer-xl-formula-input" />
      </div>
      <div className="renderer-xl-grid">
        <div className="renderer-xl-header">
          <div className="renderer-xl-corner" />
          {colLetters.map((c) => (<div key={c} className="renderer-xl-col-head">{c}</div>))}
        </div>
        {Array.from({ length: 10 }, (_, r) => (
          <div key={r} className="renderer-xl-row">
            <div className="renderer-xl-row-head">{r + 1}</div>
            {colLetters.map((_, c) => (
              <div key={c} className={`renderer-xl-cell ${r === 0 && c === 0 ? "selected" : ""}`} />
            ))}
          </div>
        ))}
      </div>
      {sheets > 1 && (
        <div className="renderer-xl-sheets">
          {sheetNames.map((name, i) => (
            <button key={i} className={`renderer-xl-sheet-tab ${i === activeSheet ? "active" : ""}`} onClick={() => setActiveSheet(i)}>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Archive Renderer ---------- */

function ArchiveRenderer({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const fileCount = meta?.files ? Number(meta.files) : 24;
  const folderCount = meta?.folders ? Number(meta.folders) : 4;
  const compression = meta?.compressed ? String(meta.compressed) : "ZIP";

  const mockTree = [
    { name: "src/", type: "folder", indent: 0 },
    { name: "components/", type: "folder", indent: 1 },
    { name: "App.tsx", type: "file", indent: 2 },
    { name: "index.ts", type: "file", indent: 2 },
    { name: "utils/", type: "folder", indent: 1 },
    { name: "helpers.ts", type: "file", indent: 2 },
    { name: "assets/", type: "folder", indent: 1 },
    { name: "logo.svg", type: "file", indent: 2 },
    { name: "package.json", type: "file", indent: 0 },
    { name: "README.md", type: "file", indent: 0 },
    { name: "tsconfig.json", type: "file", indent: 0 },
  ];

  return (
    <div className="renderer-zip">
      <div className="renderer-zip-toolbar">
        <Archive size={13} />
        <span>{file.name}</span>
        <span className="renderer-zip-stats">
          {fileCount.toLocaleString()} files, {folderCount} folders · {compression}
        </span>
      </div>
      <div className="renderer-zip-tree">
        {mockTree.map((entry, i) => (
          <div key={i} className="renderer-zip-entry" style={{ paddingLeft: entry.indent * 16 + 10 }}>
            {entry.type === "folder" ? <Folder size={13} color="#e8a854" /> : <File size={13} />}
            <span>{entry.name}</span>
          </div>
        ))}
        <div className="renderer-zip-more">
          ... and {Math.max(0, fileCount - 8)} more files
        </div>
      </div>
      <div className="renderer-zip-footer">
        <span>{formatSize(file.size)}</span>
      </div>
    </div>
  );
}

/* ---------- Document Renderer (docx, rtf) ---------- */

function DocumentRenderer({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const pages = meta?.pages ? Number(meta.pages) : Math.max(1, Math.ceil(file.size / 40000));
  const words = meta?.words ? Number(meta.words) : pages * 350;

  const paragraphs = useMemo(() =>
    Array.from({ length: 8 }, () =>
      Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () =>
        35 + Math.floor(Math.random() * 60)
      )
    ), []);

  return (
    <div className="renderer-doc">
      <div className="renderer-doc-toolbar">
        <FileText size={13} />
        <span className="renderer-doc-title">{meta?.title ? String(meta.title) : file.name}</span>
        <div className="renderer-doc-stats">
          <span>{pages} pages</span>
          <span>{words.toLocaleString()} words</span>
        </div>
      </div>
      <div className="renderer-doc-viewport">
        <div className="renderer-doc-page">
          {meta?.title && (
            <div className="renderer-doc-heading">{String(meta.title)}</div>
          )}
          {meta?.author && (
            <div className="renderer-doc-author">{String(meta.author)}</div>
          )}
          {paragraphs.map((para, pi) => (
            <div key={pi} className="renderer-doc-paragraph">
              {para.map((w, li) => (
                <div key={li} className="renderer-doc-line" style={{ width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="renderer-doc-statusbar">
        <span>1 / {pages}</span>
        <span>{words.toLocaleString()} words</span>
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
      <p>No preview available</p>
      <div className="file-viewer-info-tags">
        <span>{file.extension?.toUpperCase() ?? "File"}</span>
        <span>{formatSize(file.size)}</span>
        <span>{formatDate(file.modifiedAt)}</span>
      </div>
    </div>
  );
}

/* ---------- Main ---------- */

function getRenderer(file: FileNode) {
  const ext = file.extension?.toLowerCase() ?? "";

  if (ext === "csv" && file.content) return <CsvRenderer file={file} />;
  if (ext === "md" && file.content) return <MarkdownRenderer file={file} />;
  if (ext === "svg") return <SvgRenderer file={file} />;

  const isTextLike =
    file.content !== undefined &&
    (["code"].includes(file.type) ||
      ext in langMap ||
      ["gitconfig", "bashrc", "dockerfile"].some((n) => file.name.toLowerCase().includes(n)));

  if (isTextLike && file.content) return <CodeRenderer file={file} />;

  if (file.type === "pdf" || ext === "pdf") return <PdfRenderer file={file} />;

  if (file.type === "document" || ["docx", "doc", "rtf"].includes(ext)) return <DocumentRenderer file={file} />;

  if (file.type === "image" || ["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico"].includes(ext)) return <ImageRenderer file={file} />;

  if (file.type === "audio" || ["mp3", "wav", "ogg", "flac", "aac", "m3u"].includes(ext)) return <AudioRenderer file={file} />;

  if (file.type === "video" || ["mp4", "webm", "avi", "mov", "mkv"].includes(ext)) return <VideoRenderer file={file} />;

  if (file.type === "spreadsheet" || ["xls", "xlsx"].includes(ext)) return <SpreadsheetRenderer file={file} />;

  if (file.type === "archive" || ["zip", "rar", "tar", "gz", "7z"].includes(ext)) return <ArchiveRenderer file={file} />;

  return <GenericRenderer file={file} />;
}

export default function FileViewer({ fs, file, onClose, onSave }: FileViewerProps) {
  const [editing, setEditing] = useState(false);
  const canEdit = isEditable(file);

  const path = getPath(fs, file.id).map((n) => n.name).join(" / ");

  const handleSave = (content: string) => { onSave(file.id, content); setEditing(false); };

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
        {canEdit && !editing && (
          <button className="file-viewer-edit-btn" onClick={() => setEditing(true)} title="Edit file">
            <Pencil size={13} />
          </button>
        )}
        <button className="file-viewer-close" onClick={onClose}><X size={14} /></button>
      </header>
      <div className="file-viewer-body">
        {editing ? <EditorView file={file} onSave={handleSave} onCancel={() => setEditing(false)} /> : getRenderer(file)}
      </div>
    </div>
  );
}
