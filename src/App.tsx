import React, { useState, useCallback, useMemo } from "react";
import type { ViewMode, SortField, SortDirection, ContextMenuState } from "./types";
import {
  createInitialFileSystem,
  getRootId,
  getPath,
  createNode,
  renameNode,
  deleteNode,
} from "./store/fileSystem";
import Sidebar from "./components/Sidebar";
import Breadcrumb from "./components/Breadcrumb";
import SearchBar from "./components/SearchBar";
import FileList from "./components/FileList";
import ContextMenu from "./components/ContextMenu";
import DetailsPanel from "./components/DetailsPanel";
import DialogModal from "./components/DialogModal";

export default function App() {
  const [fs, setFs] = useState(() => createInitialFileSystem());
  const rootId = useMemo(() => getRootId(fs), [fs]);
  const [currentFolderId, setCurrentFolderId] = useState(rootId);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState<string[]>([rootId]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetId: null,
  });
  const [dialog, setDialog] = useState<{
    visible: boolean;
    title: string;
    placeholder: string;
    defaultValue: string;
    confirmLabel: string;
    action: string;
  }>({ visible: false, title: "", placeholder: "", defaultValue: "", confirmLabel: "", action: "" });

  const forceUpdate = useCallback(() => setFs(new Map(fs)), [fs]);

  const navigate = useCallback(
    (folderId: string) => {
      setCurrentFolderId(folderId);
      setSelectedFileId(null);
      const newHistory = history.slice(0, historyIdx + 1);
      newHistory.push(folderId);
      setHistory(newHistory);
      setHistoryIdx(newHistory.length - 1);
    },
    [history, historyIdx]
  );

  const goBack = useCallback(() => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setCurrentFolderId(history[historyIdx - 1]);
      setSelectedFileId(null);
    }
  }, [history, historyIdx]);

  const goForward = useCallback(() => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setCurrentFolderId(history[historyIdx + 1]);
      setSelectedFileId(null);
    }
  }, [history, historyIdx]);

  const goUp = useCallback(() => {
    const current = fs.get(currentFolderId);
    if (current?.parentId) navigate(current.parentId);
  }, [fs, currentFolderId, navigate]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField]
  );

  const handleSearch = useCallback(
    (nodeId: string) => {
      const node = fs.get(nodeId);
      if (!node) return;
      if (node.type === "folder") {
        navigate(nodeId);
      } else if (node.parentId) {
        navigate(node.parentId);
        setTimeout(() => setSelectedFileId(nodeId), 50);
      }
    },
    [fs, navigate]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, targetId: string) => {
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY, targetId });
      setSelectedFileId(targetId);
    },
    []
  );

  const handleContextAction = useCallback(
    (action: string) => {
      const targetId = contextMenu.targetId;
      if (!targetId) return;
      const target = fs.get(targetId);
      if (!target) return;

      switch (action) {
        case "open":
          if (target.type === "folder") navigate(targetId);
          else {
            setSelectedFileId(targetId);
            setShowDetails(true);
          }
          break;
        case "rename":
          setDialog({
            visible: true,
            title: "Rename",
            placeholder: "New name",
            defaultValue: target.name,
            confirmLabel: "Rename",
            action: `rename:${targetId}`,
          });
          break;
        case "delete":
          if (confirm(`Delete "${target.name}"?`)) {
            deleteNode(fs, targetId);
            if (selectedFileId === targetId) setSelectedFileId(null);
            forceUpdate();
          }
          break;
        case "newFile":
          setDialog({
            visible: true,
            title: "New File",
            placeholder: "file.txt",
            defaultValue: "",
            confirmLabel: "Create",
            action: `newFile:${targetId}`,
          });
          break;
        case "newFolder":
          setDialog({
            visible: true,
            title: "New Folder",
            placeholder: "Folder name",
            defaultValue: "",
            confirmLabel: "Create",
            action: `newFolder:${targetId}`,
          });
          break;
        case "details":
          setSelectedFileId(targetId);
          setShowDetails(true);
          break;
      }
    },
    [contextMenu.targetId, fs, navigate, selectedFileId, forceUpdate]
  );

  const handleDialogConfirm = useCallback(
    (value: string) => {
      const [action, targetId] = dialog.action.split(":");
      switch (action) {
        case "rename":
          renameNode(fs, targetId, value);
          break;
        case "newFile":
          createNode(fs, targetId, value, false);
          break;
        case "newFolder":
          createNode(fs, targetId, value, true);
          break;
      }
      forceUpdate();
      setDialog((d) => ({ ...d, visible: false }));
    },
    [dialog.action, fs, forceUpdate]
  );

  const selectedFile = selectedFileId ? fs.get(selectedFileId) ?? null : null;
  const contextTarget = contextMenu.targetId ? fs.get(contextMenu.targetId) : null;

  return (
    <div className="app">
      <Sidebar
        fs={fs}
        rootId={rootId}
        currentFolderId={currentFolderId}
        onNavigate={navigate}
      />

      <main className="main-content">
        <header className="top-bar">
          <div className="nav-buttons">
            <button
              className="nav-btn"
              onClick={goBack}
              disabled={historyIdx <= 0}
              title="Back"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                arrow_back
              </span>
            </button>
            <button
              className="nav-btn"
              onClick={goForward}
              disabled={historyIdx >= history.length - 1}
              title="Forward"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                arrow_forward
              </span>
            </button>
            <button
              className="nav-btn"
              onClick={goUp}
              disabled={!fs.get(currentFolderId)?.parentId}
              title="Up"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                arrow_upward
              </span>
            </button>
          </div>

          <Breadcrumb fs={fs} currentFolderId={currentFolderId} onNavigate={navigate} />

          <SearchBar fs={fs} onSelect={handleSearch} />

          <div className="top-bar-actions">
            <button
              className="nav-btn"
              onClick={() =>
                setDialog({
                  visible: true,
                  title: "New Folder",
                  placeholder: "Folder name",
                  defaultValue: "",
                  confirmLabel: "Create",
                  action: `newFolder:${currentFolderId}`,
                })
              }
              title="New Folder"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                create_new_folder
              </span>
            </button>
            <button
              className="nav-btn"
              onClick={() =>
                setDialog({
                  visible: true,
                  title: "New File",
                  placeholder: "file.txt",
                  defaultValue: "",
                  confirmLabel: "Create",
                  action: `newFile:${currentFolderId}`,
                })
              }
              title="New File"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                note_add
              </span>
            </button>
            <button
              className="nav-btn"
              onClick={() => setShowDetails(!showDetails)}
              title="Toggle Details"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                {showDetails ? "info" : "info"}
              </span>
            </button>
          </div>
        </header>

        <div className="content-area">
          <FileList
            fs={fs}
            currentFolderId={currentFolderId}
            viewMode={viewMode}
            sortField={sortField}
            sortDirection={sortDirection}
            selectedFileId={selectedFileId}
            onSelectFile={(id) => {
              setSelectedFileId(id);
              if (id) setShowDetails(true);
            }}
            onOpenFolder={navigate}
            onContextMenu={handleContextMenu}
            onSort={handleSort}
            onViewChange={setViewMode}
          />

          {showDetails && (
            <DetailsPanel
              fs={fs}
              file={selectedFile}
              onClose={() => setShowDetails(false)}
            />
          )}
        </div>
      </main>

      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu((s) => ({ ...s, visible: false }))}
        onAction={handleContextAction}
        isFolder={contextTarget?.type === "folder"}
      />

      <DialogModal
        visible={dialog.visible}
        title={dialog.title}
        placeholder={dialog.placeholder}
        defaultValue={dialog.defaultValue}
        confirmLabel={dialog.confirmLabel}
        onConfirm={handleDialogConfirm}
        onCancel={() => setDialog((d) => ({ ...d, visible: false }))}
      />
    </div>
  );
}
