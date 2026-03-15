import React, { useEffect, useMemo, useRef, useState } from "react";
import Ajv from "ajv";
import GraphView from "./components/GraphView";
import NodePanel from "./components/NodePanel";
import ValidationPanel from "./components/ValidationPanel";
import schema from "../../../public/assets/data/story-schema.json";
import { HISTORY_LIMIT, UNDO_COALESCE_WINDOW_MS } from "./config";
import { StoryData, StoryNode, ValidationIssue, emptyNode } from "./types";
import { FileDown, FolderOpen, Save as SaveIcon, Trash2 } from "lucide-react";

type FileSystemAccessWindow = Window &
  typeof globalThis & {
    showOpenFilePicker?: (
      ...args: unknown[]
    ) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (...args: unknown[]) => Promise<FileSystemFileHandle>;
  };

const fsWindow = () => window as FileSystemAccessWindow;

const createValidator = () =>
  new Ajv({ allErrors: true, allowUnionTypes: true }).compile(schema);

const supportsFileSystemAccess =
  typeof window !== "undefined" &&
  !!fsWindow().showOpenFilePicker &&
  !!fsWindow().showSaveFilePicker;

const rewriteNodeReferences = (
  nodes: StoryNode[],
  oldId: string,
  newId?: string,
) =>
  nodes.map((node) => {
    let changed = false;
    const mappedChoices = node.choices.map((choice, idx) => {
      const nextId =
        choice.nextNodeId === oldId ? (newId ?? "") : choice.nextNodeId;
      const altNextId =
        choice.altNextNodeId === oldId
          ? (newId ?? undefined)
          : choice.altNextNodeId;
      if (nextId !== choice.nextNodeId || altNextId !== choice.altNextNodeId) {
        changed = true;
        return {
          ...choice,
          nextNodeId: nextId,
          altNextNodeId: altNextId,
          id: choice.id ?? idx,
        };
      }
      return choice;
    });

    const autoRedirectTo =
      node.autoRedirectTo === oldId
        ? (newId ?? undefined)
        : node.autoRedirectTo;
    if (autoRedirectTo !== node.autoRedirectTo) changed = true;

    if (!changed) return node;

    return { ...node, choices: mappedChoices, autoRedirectTo };
  });

const App: React.FC = () => {
  const [story, setStory] = useState<StoryData>({
    $schema: "story-schema.json",
    nodes: [],
  });

  const [history, setHistory] = useState<{
    past: StoryData[];
    future: StoryData[];
  }>({ past: [], future: [] });
  const lastSnapshotTs = useRef<number>(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const editingNodeIdRef = useRef<string | undefined>(undefined);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null,
  );
  const [fileName, setFileName] = useState<string>("story.json");
  const [isSaving, setIsSaving] = useState(false);

  const selectedNode = useMemo(
    () => story.nodes.find((n) => n.id === selectedNodeId),
    [story, selectedNodeId],
  );

  const validator = useMemo(() => createValidator(), []);

  const selectNode = (id: string | undefined) => {
    setSelectedNodeId(id);
    editingNodeIdRef.current = id;
  };

  useEffect(() => {
    const valid = validator(story);
    if (valid) {
      setIssues([]);
    } else {
      const nextIssues: ValidationIssue[] = (validator.errors || []).map(
        (err) => ({
          message: err.message || "",
          instancePath: err.instancePath,
        }),
      );
      setIssues(nextIssues);
    }
  }, [story, validator]);

  const resetStory = (
    next: StoryData,
    handle: FileSystemFileHandle | null = null,
    name?: string,
  ) => {
    setStory(next);
    setHistory({ past: [], future: [] });
    lastSnapshotTs.current = Date.now();
    selectNode(undefined);
    setFileHandle(handle);
    setFileName(name ?? handle?.name ?? "story.json");
  };

  const applyChange = (
    updater: (prev: StoryData) => StoryData,
    options?: { forceSnapshot?: boolean },
  ) => {
    setStory((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;
      setHistory((h) => {
        const now = Date.now();
        const withinWindow =
          now - lastSnapshotTs.current < UNDO_COALESCE_WINDOW_MS;
        const shouldCoalesce = withinWindow && !options?.forceSnapshot;

        // Always ensure we have at least one snapshot to undo to.
        const pushSnapshot = !shouldCoalesce || h.past.length === 0;

        const nextPast = pushSnapshot ? [...h.past, prev] : h.past;
        if (pushSnapshot) {
          if (nextPast.length > HISTORY_LIMIT) {
            nextPast.shift();
          }
          lastSnapshotTs.current = now;
        }

        return { past: nextPast, future: [] };
      });
      return next;
    });
  };

  const undo = () => {
    setHistory((h) => {
      if (!h.past.length) return h;
      const previous = h.past[h.past.length - 1];
      setStory(previous);
      const nextSelection =
        selectedNodeId && previous.nodes.some((n) => n.id === selectedNodeId)
          ? selectedNodeId
          : undefined;
      selectNode(nextSelection);
      return { past: h.past.slice(0, -1), future: [story, ...h.future] };
    });
  };

  const redo = () => {
    setHistory((h) => {
      if (!h.future.length) return h;
      const next = h.future[0];
      setStory(next);
      const nextSelection =
        selectedNodeId && next.nodes.some((n) => n.id === selectedNodeId)
          ? selectedNodeId
          : undefined;
      selectNode(nextSelection);
      return { past: [...h.past, story], future: h.future.slice(1) };
    });
  };

  const upsertNode = (updated: StoryNode) => {
    const targetId = editingNodeIdRef.current ?? selectedNodeId;
    if (!targetId) return;
    const renamed = updated.id !== targetId;
    const nodeWithIndexedChoices = {
      ...updated,
      choices: updated.choices.map((choice, idx) => ({
        ...choice,
        id: choice.id ?? idx,
      })),
    };

    applyChange(
      (prev) => {
        const updatedNodes = prev.nodes.map((n) =>
          n.id === targetId ? nodeWithIndexedChoices : n,
        );
        const nodesWithRefs = renamed
          ? rewriteNodeReferences(
              updatedNodes,
              targetId,
              nodeWithIndexedChoices.id,
            )
          : updatedNodes;
        return { ...prev, nodes: nodesWithRefs };
      },
      { forceSnapshot: renamed },
    );
    selectNode(updated.id);
  };

  const addNode = () => {
    const newNode: StoryNode = {
      ...emptyNode(),
      text: "New node",
    };
    applyChange((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }), {
      forceSnapshot: true,
    });
    selectNode(newNode.id);
  };

  const removeNode = (id: string) => {
    applyChange(
      (prev) => ({
        ...prev,
        nodes: rewriteNodeReferences(
          prev.nodes.filter((n) => n.id !== id),
          id,
          undefined,
        ),
      }),
      { forceSnapshot: true },
    );
    selectNode(undefined);
  };

  const addChoice = (node: StoryNode) => {
    const nextId = node.choices.length;
    const next: StoryNode = {
      ...node,
      choices: [
        ...node.choices,
        { id: nextId, text: "New choice", nextNodeId: "" },
      ],
    };
    upsertNode(next);
  };

  const removeChoice = (node: StoryNode, index: number) => {
    const nextChoices = [...node.choices];
    nextChoices.splice(index, 1);
    const reindexedChoices = nextChoices.map((choice, idx) => ({
      ...choice,
      id: idx,
    }));
    upsertNode({ ...node, choices: reindexedChoices });
  };

  const onConnectChoice = (
    sourceNodeId: string,
    handle: string,
    targetNodeId: string,
  ) => {
    applyChange(
      (prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) => {
          if (node.id !== sourceNodeId) return node;
          const choiceId = handle.replace("choice-", "");
          const updatedChoices = node.choices.map((choice, idx) => {
            const key = String(choice.id ?? idx);
            if (key === choiceId) {
              return { ...choice, nextNodeId: targetNodeId };
            }
            return choice;
          });
          return { ...node, choices: updatedChoices };
        }),
      }),
      { forceSnapshot: true },
    );
  };

  const downloadJson = (data: StoryData, name: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const download = () => downloadJson(story, fileName || "story.json");

  const importFile = async (
    file: File,
    handle: FileSystemFileHandle | null = null,
  ) => {
    const text = await file.text();
    const json = JSON.parse(text) as StoryData;
    resetStory(json, handle, file.name ?? handle?.name);
  };

  const openFromDisk = async () => {
    if (!supportsFileSystemAccess) return;
    const w = fsWindow();
    if (!w.showOpenFilePicker) return;
    try {
      const [handle] = await w.showOpenFilePicker({
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      await importFile(file, handle);
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        console.error("Open JSON failed", error);
      }
    }
  };

  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const saveStory = async () => {
    const data = JSON.stringify(story, null, 2);

    if (!supportsFileSystemAccess) {
      downloadJson(story, fileName);
      return;
    }
    const w = fsWindow();
    if (!w.showSaveFilePicker && !fileHandle) {
      alert("Open a JSON file first, then save.");
      return;
    }

    if (!fileHandle) {
      alert("Open a JSON file first, then save.");
      return;
    }

    setIsSaving(true);
    try {
      const handle = fileHandle;
      const writable = await handle.createWritable();
      await writable.write(data);
      await writable.close();

      setFileHandle(handle);
      setFileName(handle.name ?? fileName);
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        console.error("Save JSON failed", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  return (
    <div className="app-shell">
      <div className="panel panel-column">
        <div className="toolbar">
          <div className="toolbar-section">
            <button onClick={addNode}>+ Node</button>
            {selectedNode && (
              <button
                className="secondary danger"
                onClick={() => removeNode(selectedNode.id)}
                title="Delete selected node"
              >
                <span className="button-label">
                  <Trash2 size={16} className="icon" />
                  <span>Delete</span>
                </span>
              </button>
            )}
            <button
              className="secondary"
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
              aria-label="Undo"
            >
              ↺
            </button>
            <button
              className="secondary"
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
              aria-label="Redo"
            >
              ↻
            </button>
          </div>
          <div className="toolbar-section toolbar-section-right">
            <button
              className="secondary"
              onClick={() =>
                supportsFileSystemAccess ? openFromDisk() : triggerFileDialog()
              }
              title={supportsFileSystemAccess ? "Open" : "Import"}
            >
              <span className="button-label">
                <FolderOpen size={16} className="icon" />
                <span>Open</span>
              </span>
            </button>
            <button
              className="secondary"
              onClick={saveStory}
              disabled={isSaving}
              title="Save"
            >
              <span className="button-label">
                <SaveIcon size={16} className="icon" />
                <span>Save</span>
              </span>
            </button>
            <button className="secondary" onClick={download} title="Export">
              <span className="button-label">
                <FileDown size={16} className="icon" />
                <span>Export</span>
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importFile(file);
              }}
            />
          </div>
        </div>
        <div className="panel-content">
          <GraphView
            nodes={story.nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={selectNode}
            onConnectChoice={onConnectChoice}
          />
        </div>
      </div>

      <div className="side-stack">
        <NodePanel
          node={selectedNode!}
          onChange={upsertNode}
          onAddChoice={() => {
            if (selectedNode) addChoice(selectedNode);
          }}
          onRemoveChoice={(idx) => {
            if (selectedNode) removeChoice(selectedNode, idx);
          }}
          existingIds={story.nodes.map((n) => n.id)}
        />
        <ValidationPanel issues={issues} />
      </div>
    </div>
  );
};

export default App;
