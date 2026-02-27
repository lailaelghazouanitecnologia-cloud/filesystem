import React, { useMemo } from "react";
import type { FileNode } from "../types";
import { formatSize, formatDate, getPath } from "../store/fileSystem";
import { FileIcon } from "./Icons";
import {
  X,
  Image,
  Music,
  Film,
  FileText,
  Archive,
  FileSpreadsheet,
  Play,
  Folder,
  File,
} from "lucide-react";

interface DetailsPanelProps {
  fs: Map<string, FileNode>;
  file: FileNode | null;
  onClose: () => void;
}

/* ---------- Mini previews by type ---------- */

function MiniCodePreview({ file }: { file: FileNode }) {
  const lines = (file.content ?? "").split("\n").slice(0, 8);
  return (
    <div className="mini-preview mini-code">
      <div className="mini-code-lines">
        {lines.map((_, i) => (
          <span key={i} className="mini-code-ln">{i + 1}</span>
        ))}
      </div>
      <pre className="mini-code-src">{lines.join("\n")}</pre>
    </div>
  );
}

function MiniPdfPreview({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const pages = meta?.pages ? Number(meta.pages) : Math.max(1, Math.ceil(file.size / 50000));
  const lines = useMemo(() =>
    Array.from({ length: 7 }, () => 35 + Math.floor(Math.random() * 55)), []);

  return (
    <div className="mini-preview mini-pdf">
      <div className="mini-pdf-page">
        {meta?.title && <div className="mini-pdf-title">{String(meta.title)}</div>}
        <div className="mini-pdf-lines">
          {lines.map((w, i) => (
            <div key={i} className="mini-pdf-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="mini-pdf-footer">{pages} pg</div>
    </div>
  );
}

function MiniImagePreview({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const w = meta?.width ? Number(meta.width) : 1920;
  const h = meta?.height ? Number(meta.height) : 1080;

  return (
    <div className="mini-preview mini-image">
      <div className="mini-image-canvas">
        <Image size={28} strokeWidth={0.8} />
      </div>
      <span className="mini-image-dims">{w} × {h}</span>
    </div>
  );
}

function MiniAudioPreview({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const dur = meta?.duration ? Number(meta.duration) : Math.floor(file.size / 16000);
  const m = Math.floor(dur / 60);
  const s = dur % 60;
  const bars = useMemo(() =>
    Array.from({ length: 32 }, () => 0.15 + Math.random() * 0.85), []);

  return (
    <div className="mini-preview mini-audio">
      {meta?.artist && <div className="mini-audio-artist">{String(meta.artist)}</div>}
      <div className="mini-audio-wave">
        {bars.map((h, i) => (
          <div key={i} className="mini-audio-bar" style={{ height: `${h * 100}%` }} />
        ))}
      </div>
      <span className="mini-audio-dur">{m}:{s.toString().padStart(2, "0")}</span>
    </div>
  );
}

function MiniVideoPreview({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const dur = meta?.duration ? Number(meta.duration) : Math.floor(file.size / 100000);
  const m = Math.floor(dur / 60);
  const s = dur % 60;
  const w = meta?.width ? Number(meta.width) : 1920;
  const h = meta?.height ? Number(meta.height) : 1080;

  return (
    <div className="mini-preview mini-video">
      <div className="mini-video-screen">
        <Film size={22} strokeWidth={0.8} />
        <div className="mini-video-play"><Play size={12} /></div>
      </div>
      <div className="mini-video-info">
        <span>{w}×{h}</span>
        <span>{m}:{s.toString().padStart(2, "0")}</span>
      </div>
    </div>
  );
}

function MiniSpreadsheetPreview({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const rows = meta?.rows ? Number(meta.rows) : 100;
  const cols = meta?.cols ? Number(meta.cols) : 5;

  return (
    <div className="mini-preview mini-xl">
      <div className="mini-xl-grid">
        <div className="mini-xl-header">
          {["A", "B", "C", "D"].map((c) => (
            <div key={c} className="mini-xl-col">{c}</div>
          ))}
        </div>
        {Array.from({ length: 4 }, (_, r) => (
          <div key={r} className="mini-xl-row">
            <div className="mini-xl-rn">{r + 1}</div>
            {Array.from({ length: 4 }, (_, c) => (
              <div key={c} className="mini-xl-cell" />
            ))}
          </div>
        ))}
      </div>
      <span className="mini-xl-dims">{rows.toLocaleString()} × {cols}</span>
    </div>
  );
}

function MiniArchivePreview({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const fileCount = meta?.files ? Number(meta.files) : 24;

  return (
    <div className="mini-preview mini-zip">
      <div className="mini-zip-tree">
        <div className="mini-zip-entry"><Folder size={11} color="#e8a854" /> src/</div>
        <div className="mini-zip-entry indent"><File size={11} /> App.tsx</div>
        <div className="mini-zip-entry indent"><File size={11} /> index.ts</div>
        <div className="mini-zip-entry"><File size={11} /> package.json</div>
      </div>
      <span className="mini-zip-count">{fileCount.toLocaleString()} files</span>
    </div>
  );
}

function MiniDocPreview({ file }: { file: FileNode }) {
  const meta = file.metadata;
  const pages = meta?.pages ? Number(meta.pages) : Math.max(1, Math.ceil(file.size / 40000));
  const lines = useMemo(() =>
    Array.from({ length: 6 }, () => 40 + Math.floor(Math.random() * 50)), []);

  return (
    <div className="mini-preview mini-doc">
      <div className="mini-doc-page">
        {meta?.title && <div className="mini-doc-title">{String(meta.title)}</div>}
        {lines.map((w, i) => (
          <div key={i} className="mini-doc-line" style={{ width: `${w}%` }} />
        ))}
      </div>
      <span className="mini-doc-pages">{pages} pg</span>
    </div>
  );
}

function MiniCsvPreview({ file }: { file: FileNode }) {
  const rows = (file.content ?? "").split("\n").filter(Boolean).slice(0, 4).map((r) => r.split(","));
  return (
    <div className="mini-preview mini-csv">
      <table className="mini-csv-table">
        {rows.length > 0 && (
          <thead>
            <tr>{rows[0].map((c, i) => <th key={i}>{c.trim()}</th>)}</tr>
          </thead>
        )}
        <tbody>
          {rows.slice(1).map((row, ri) => (
            <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c.trim()}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniSvgPreview({ file }: { file: FileNode }) {
  if (!file.content) return <MiniImagePreview file={file} />;
  return (
    <div className="mini-preview mini-svg">
      <div className="mini-svg-render" dangerouslySetInnerHTML={{ __html: file.content }} />
    </div>
  );
}

/* ---------- Get mini preview by type ---------- */

function getMiniPreview(file: FileNode) {
  const ext = file.extension?.toLowerCase() ?? "";

  if (ext === "csv" && file.content) return <MiniCsvPreview file={file} />;
  if (ext === "svg" && file.content) return <MiniSvgPreview file={file} />;

  if (file.content && (
    ["code"].includes(file.type) ||
    ["md", "txt", "json", "yaml", "yml", "toml", "sh", "bash", "sql", "html", "css",
     "ts", "tsx", "js", "jsx", "py", "rs", "go", "java", "c", "cpp", "rb", "php"].includes(ext) ||
    ["gitconfig", "bashrc", "dockerfile"].some((n) => file.name.toLowerCase().includes(n))
  )) return <MiniCodePreview file={file} />;

  if (file.type === "pdf" || ext === "pdf") return <MiniPdfPreview file={file} />;
  if (file.type === "document" || ["docx", "doc", "rtf"].includes(ext)) return <MiniDocPreview file={file} />;
  if (file.type === "image" || ["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico"].includes(ext)) return <MiniImagePreview file={file} />;
  if (file.type === "audio" || ["mp3", "wav", "ogg", "flac", "aac", "m3u"].includes(ext)) return <MiniAudioPreview file={file} />;
  if (file.type === "video" || ["mp4", "webm", "avi", "mov", "mkv"].includes(ext)) return <MiniVideoPreview file={file} />;
  if (file.type === "spreadsheet" || ["xls", "xlsx"].includes(ext)) return <MiniSpreadsheetPreview file={file} />;
  if (file.type === "archive" || ["zip", "rar", "tar", "gz", "7z"].includes(ext)) return <MiniArchivePreview file={file} />;

  return null;
}

/* ---------- Main ---------- */

export default function DetailsPanel({ fs, file, onClose }: DetailsPanelProps) {
  if (!file) return null;

  const path = getPath(fs, file.id).map((n) => n.name).join(" / ");
  const preview = file.type !== "folder" ? getMiniPreview(file) : null;

  return (
    <aside className="details-panel">
      <div className="details-header">
        <button className="details-close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className="details-icon-section">
        <FileIcon type={file.type} name={file.name} size={32} />
        <h4 className="details-filename">{file.name}</h4>
      </div>

      {preview && (
        <div className="details-preview-section">
          {preview}
        </div>
      )}

      <div className="details-meta">
        <div className="details-row">
          <span className="details-label">
            {file.type === "folder" ? "Folder" : file.extension?.toUpperCase() ?? "File"}
          </span>
          <span className="details-value">{formatSize(file.size)}</span>
        </div>
        <div className="details-row">
          <span className="details-value details-path">{path}</span>
        </div>
        <div className="details-row">
          <span className="details-value">{formatDate(file.modifiedAt)}</span>
        </div>
      </div>

      {file.type === "folder" && file.children && (
        <div className="details-meta" style={{ marginTop: 4 }}>
          <div className="details-row">
            <span className="details-label">{file.children.length} items</span>
          </div>
        </div>
      )}
    </aside>
  );
}
