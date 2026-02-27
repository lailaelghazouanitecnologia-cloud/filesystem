import React, { useState, useRef, useEffect } from "react";
import type { FileNode } from "../types";
import { searchFiles } from "../store/fileSystem";
import { FileIcon } from "./Icons";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  fs: Map<string, FileNode>;
  onSelect: (nodeId: string) => void;
}

export default function SearchBar({ fs, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<FileNode[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = searchFiles(fs, query);
    setResults(r.slice(0, 12));
    setSelectedIdx(0);
  }, [query, fs]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const showDropdown = focused && query.length > 0 && results.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      onSelect(results[selectedIdx].id);
      setQuery("");
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div className={`search-bar ${focused ? "focused" : ""}`}>
        <Search size={14} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <X
            size={13}
            className="search-clear"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          />
        )}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {results.map((node, i) => (
            <div
              key={node.id}
              className={`search-result ${i === selectedIdx ? "selected" : ""}`}
              onMouseDown={() => {
                onSelect(node.id);
                setQuery("");
              }}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <FileIcon type={node.type} size={14} />
              <div className="search-result-info">
                <span className="search-result-name">{node.name}</span>
                <span className="search-result-path">
                  {node.type === "folder" ? "Folder" : node.extension?.toUpperCase() ?? "File"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
