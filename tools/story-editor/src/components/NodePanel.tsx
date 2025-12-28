import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { Choice, Condition, Effect, StoryNode } from "../types";

export interface NodePanelProps {
  node: StoryNode | undefined;
  onChange: (node: StoryNode) => void;
  onAddChoice: () => void;
  onRemoveChoice: (index: number) => void;
  existingIds: string[];
}

const Collapsible: React.FC<{
  title: string;
  initialOpen?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, initialOpen = true, right, children }) => {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div className={`collapsible ${open ? "open" : "closed"}`}>
      <div className="collapsible-header" onClick={() => setOpen((o) => !o)}>
        <div className="inline">
          <span className="chevron">▼</span>
          <span className="collapsible-title">{title}</span>
        </div>
        {right}
      </div>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
};

const ConditionRow: React.FC<{
  condition: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
}> = ({ condition, onChange, onRemove }) => {
  const showItem =
    condition.type === "hasItem" || condition.type === "hasNotItem";
  const showKnowledge =
    condition.type === "hasKnowledge" || condition.type === "hasNotKnowledge";
  const showHealth = condition.type === "hasHealth";
  const showMoral = condition.type === "hasMoralPoints";

  return (
    <div className="subpanel">
      <div className="inline justify-between">
        <label className="flex-1">
          type
          <select
            value={condition.type}
            onChange={(e) =>
              onChange({
                ...condition,
                type: e.target.value as Condition["type"],
                item: undefined,
                knowledge: undefined,
                health: undefined,
                moralPoints: undefined,
              })
            }
          >
            <option value="hasItem">hasItem</option>
            <option value="hasNotItem">hasNotItem</option>
            <option value="hasKnowledge">hasKnowledge</option>
            <option value="hasNotKnowledge">hasNotKnowledge</option>
            <option value="hasHealth">hasHealth</option>
            <option value="hasMoralPoints">hasMoralPoints</option>
            <option value="hasNotVisitedNextNode">hasNotVisitedNextNode</option>
          </select>
        </label>
        <button className="secondary" onClick={onRemove}>
          Remove
        </button>
      </div>
      <div className="grid-2 mt-6">
        {showItem && (
          <label>
            item
            <input
              value={condition.item ?? ""}
              onChange={(e) =>
                onChange({ ...condition, item: e.target.value || undefined })
              }
              placeholder="item id"
            />
          </label>
        )}
        {showKnowledge && (
          <label>
            knowledge
            <input
              value={condition.knowledge ?? ""}
              onChange={(e) =>
                onChange({
                  ...condition,
                  knowledge: e.target.value || undefined,
                })
              }
              placeholder="knowledge id"
            />
          </label>
        )}
        {showHealth && (
          <label>
            health &gt;=
            <input
              type="number"
              value={condition.health ?? ""}
              onChange={(e) =>
                onChange({
                  ...condition,
                  health:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="number"
            />
          </label>
        )}
        {showMoral && (
          <label>
            moralPoints &gt;=
            <input
              type="number"
              value={condition.moralPoints ?? ""}
              onChange={(e) =>
                onChange({
                  ...condition,
                  moralPoints:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="number"
            />
          </label>
        )}
      </div>
    </div>
  );
};

const EffectRow: React.FC<{
  effect: Effect;
  onChange: (e: Effect) => void;
  onRemove: () => void;
}> = ({ effect, onChange, onRemove }) => {
  const showItem = effect.type === "addItem" || effect.type === "removeItem";
  const showKnowledge =
    effect.type === "addKnowledge" || effect.type === "removeKnowledge";
  const showHealth =
    effect.type === "addHealth" || effect.type === "removeHealth";
  const showMoral =
    effect.type === "addMoralPoints" || effect.type === "removeMoralPoints";
  const showGameOver = effect.type === "removeHealth";

  return (
    <div className="subpanel">
      <div className="inline justify-between">
        <label className="flex-1">
          type
          <select
            value={effect.type}
            onChange={(e) =>
              onChange({
                ...effect,
                type: e.target.value as Effect["type"],
                item: undefined,
                knowledge: undefined,
                health: undefined,
                moralPoints: undefined,
                gameOverNodeId: undefined,
              })
            }
          >
            <option value="addItem">addItem</option>
            <option value="removeItem">removeItem</option>
            <option value="addKnowledge">addKnowledge</option>
            <option value="removeKnowledge">removeKnowledge</option>
            <option value="addHealth">addHealth</option>
            <option value="removeHealth">removeHealth</option>
            <option value="addMoralPoints">addMoralPoints</option>
            <option value="removeMoralPoints">removeMoralPoints</option>
            <option value="restart">restart</option>
            <option value="close">close</option>
          </select>
        </label>
        <button className="secondary" onClick={onRemove}>
          Remove
        </button>
      </div>
      <div className="grid-2 mt-6">
        {showItem && (
          <label>
            item
            <input
              value={effect.item ?? ""}
              onChange={(e) =>
                onChange({ ...effect, item: e.target.value || undefined })
              }
              placeholder="item id"
            />
          </label>
        )}
        {showKnowledge && (
          <label>
            knowledge
            <input
              value={effect.knowledge ?? ""}
              onChange={(e) =>
                onChange({ ...effect, knowledge: e.target.value || undefined })
              }
              placeholder="knowledge id"
            />
          </label>
        )}
        {showHealth && (
          <label>
            health delta
            <input
              type="number"
              value={effect.health ?? ""}
              onChange={(e) =>
                onChange({
                  ...effect,
                  health:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="number"
            />
          </label>
        )}
        {showMoral && (
          <label>
            moralPoints delta
            <input
              type="number"
              value={effect.moralPoints ?? ""}
              onChange={(e) =>
                onChange({
                  ...effect,
                  moralPoints:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="number"
            />
          </label>
        )}
        {showGameOver && (
          <label>
            gameOverNodeId
            <input
              value={effect.gameOverNodeId ?? ""}
              onChange={(e) =>
                onChange({
                  ...effect,
                  gameOverNodeId: e.target.value || undefined,
                })
              }
              placeholder="optional"
            />
          </label>
        )}
      </div>
    </div>
  );
};

const ChoiceEditor: React.FC<{
  choice: Choice;
  onUpdate: (choice: Choice) => void;
  onRemove: () => void;
  index: number;
}> = ({ choice, onUpdate, onRemove, index }) => (
  <div className="subpanel p-10">
    <div className="choice-row">
      <label>
        Text
        <input
          value={choice.text}
          onChange={(e) => onUpdate({ ...choice, text: e.target.value })}
          placeholder={`Choice ${index + 1}`}
        />
      </label>
      <label>
        Next node id
        <input
          value={choice.nextNodeId}
          onChange={(e) => onUpdate({ ...choice, nextNodeId: e.target.value })}
          placeholder="node-id"
        />
      </label>
    </div>
    <div className="grid-2 mt-8">
      <label>
        matchKeyword
        <input
          value={choice.matchKeyword ?? ""}
          onChange={(e) =>
            onUpdate({ ...choice, matchKeyword: e.target.value })
          }
          placeholder="optional"
        />
      </label>
      <label>
        exactMatch
        <select
          value={String(choice.exactMatch ?? "")}
          onChange={(e) =>
            onUpdate({
              ...choice,
              exactMatch:
                e.target.value === "" ? undefined : e.target.value === "true",
            })
          }
        >
          <option value="">unset</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </label>
      <label>
        altTextOnChoiceRepeat
        <input
          value={choice.altTextOnChoiceRepeat ?? ""}
          onChange={(e) =>
            onUpdate({
              ...choice,
              altTextOnChoiceRepeat: e.target.value || undefined,
            })
          }
          placeholder="optional"
        />
      </label>
      <label>
        altNextNodeId
        <input
          value={choice.altNextNodeId ?? ""}
          onChange={(e) =>
            onUpdate({ ...choice, altNextNodeId: e.target.value || undefined })
          }
          placeholder="optional"
        />
      </label>
      <label>
        altRedirectThreshold
        <input
          type="number"
          value={choice.altRedirectThreshold ?? ""}
          onChange={(e) =>
            onUpdate({
              ...choice,
              altRedirectThreshold:
                e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
          placeholder="optional"
        />
      </label>
    </div>
    <div className="section-divider" />
    <div className="inline justify-between">
      <div className="inline">
        <span className="chip">Conditions</span>
        <span className="handle-label">Gate the choice</span>
      </div>
      <button
        className="secondary"
        onClick={() =>
          onUpdate({
            ...choice,
            conditions: [
              ...(choice.conditions ?? []),
              { type: "hasItem" } as Condition,
            ],
          })
        }
      >
        + Condition
      </button>
    </div>
    <div className="list-stack">
      {(choice.conditions ?? []).map((cond, cIdx) => (
        <ConditionRow
          key={cIdx}
          condition={cond}
          onChange={(updated) => {
            const next = [...(choice.conditions ?? [])];
            next[cIdx] = updated;
            onUpdate({ ...choice, conditions: next });
          }}
          onRemove={() => {
            const next = [...(choice.conditions ?? [])];
            next.splice(cIdx, 1);
            onUpdate({ ...choice, conditions: next });
          }}
        />
      ))}
      {!choice.conditions?.length && <div className="badge">No conditions</div>}
    </div>

    <div className="section-divider" />
    <div className="inline justify-between">
      <div className="inline">
        <span className="chip">Effects</span>
        <span className="handle-label">Apply on select</span>
      </div>
      <button
        className="secondary"
        onClick={() =>
          onUpdate({
            ...choice,
            effects: [...(choice.effects ?? []), { type: "addItem" } as Effect],
          })
        }
      >
        + Effect
      </button>
    </div>
    <div className="list-stack">
      {(choice.effects ?? []).map((eff, eIdx) => (
        <EffectRow
          key={eIdx}
          effect={eff}
          onChange={(updated) => {
            const next = [...(choice.effects ?? [])];
            next[eIdx] = updated;
            onUpdate({ ...choice, effects: next });
          }}
          onRemove={() => {
            const next = [...(choice.effects ?? [])];
            next.splice(eIdx, 1);
            onUpdate({ ...choice, effects: next });
          }}
        />
      ))}
      {!choice.effects?.length && <div className="badge">No effects</div>}
    </div>

    <div className="inline justify-end mt-6">
      <button className="secondary" onClick={onRemove}>
        Remove choice
      </button>
    </div>
    <div className="hint">
      hasItem / hasKnowledge gate choice when player owns that resource. hasNot*
      flips it. hasHealth / hasMoralPoints check &gt;= value.
      hasNotVisitedNextNode hides repeats.
    </div>
    <div className="hint">
      add/remove* mutate inventory, knowledge, health, moralPoints. removeHealth
      can carry an optional gameOverNodeId to jump to on death. restart/close
      are terminal actions.
    </div>
  </div>
);

const NodePanel = ({
  node,
  onChange,
  onAddChoice,
  onRemoveChoice,
  existingIds,
}: NodePanelProps) => {
  const [rawJson, setRawJson] = useState<string>("{}");
  const [isEditingRawJson, setIsEditingRawJson] = useState(false);
  const [draftId, setDraftId] = useState("");
  const [idError, setIdError] = useState<string | undefined>();

  useEffect(() => {
    if (node && !isEditingRawJson) {
      setRawJson(JSON.stringify(node, null, 2));
    }
  }, [node, isEditingRawJson]);

  useEffect(() => {
    if (node) {
      setDraftId(node.id);
      setIdError(undefined);
    }
  }, [node]);

  useEffect(() => {
    if (!node) return;
    const handle = setTimeout(() => {
      if (!draftId.trim()) {
        setIdError("Id cannot be empty");
        return;
      }
      const collision = existingIds.includes(draftId) && draftId !== node.id;
      setIdError(collision ? "Id already exists" : undefined);
    }, 500);
    return () => clearTimeout(handle);
  }, [draftId, existingIds, node]);

  const commitId = () => {
    if (!node) return;
    if (draftId === node.id) {
      setIdError(undefined);
      return;
    }
    if (!draftId.trim()) {
      setIdError("Id cannot be empty");
      return;
    }
    const collision = existingIds.includes(draftId) && draftId !== node.id;
    if (collision) {
      setIdError("Id already exists");
      return;
    }
    setIdError(undefined);
    onChange({ ...node, id: draftId });
  };

  const parsed = useMemo(() => {
    try {
      return JSON.parse(rawJson) as StoryNode;
    } catch {
      return undefined;
    }
  }, [rawJson]);

  if (!node) return <div className="panel">Select a node to edit.</div>;

  return (
    <div className="panel scroll h-full">
      <h2>Node</h2>
      <div className="list-stack">
        <Collapsible title="Basics" initialOpen>
          <div className="grid-2">
            <label>
              id
              <input
                value={draftId}
                onChange={(e) => {
                  setDraftId(e.target.value);
                  setIdError(undefined);
                }}
                onBlur={commitId}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitId();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="unique id"
              />
              {idError && <div className="error">{idError}</div>}
            </label>
            <label>
              isFreeInput
              <select
                value={String(node.isFreeInput ?? "")}
                onChange={(e) =>
                  onChange({
                    ...node,
                    isFreeInput:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                  })
                }
              >
                <option value="">unset</option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </label>
          </div>
          <label>
            text
            <textarea
              value={node.text}
              onChange={(e) => onChange({ ...node, text: e.target.value })}
              placeholder="Narration"
            />
          </label>
        </Collapsible>

        <Collapsible title="Alt text & redirects" initialOpen={false}>
          <label>
            altTextIfVisited
            <textarea
              value={node.altTextIfVisited ?? ""}
              onChange={(e) =>
                onChange({
                  ...node,
                  altTextIfVisited: e.target.value || undefined,
                })
              }
              placeholder="Optional"
            />
          </label>
          <label>
            altTextIfKnowledge
            <textarea
              value={node.altTextIfKnowledge ?? ""}
              onChange={(e) =>
                onChange({
                  ...node,
                  altTextIfKnowledge: e.target.value || undefined,
                })
              }
              placeholder="Optional"
            />
          </label>
          <div className="grid-2">
            <label>
              knowledgeForAltText
              <input
                value={node.knowledgeForAltText ?? ""}
                onChange={(e) =>
                  onChange({
                    ...node,
                    knowledgeForAltText: e.target.value || undefined,
                  })
                }
                placeholder="Optional"
              />
            </label>
            <label>
              autoRedirectTo
              <input
                value={node.autoRedirectTo ?? ""}
                onChange={(e) =>
                  onChange({
                    ...node,
                    autoRedirectTo: e.target.value || undefined,
                  })
                }
                placeholder="Optional"
              />
            </label>
            <label>
              autoRedirectDelay (ms)
              <input
                type="number"
                value={node.autoRedirectDelay ?? ""}
                onChange={(e) =>
                  onChange({
                    ...node,
                    autoRedirectDelay:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                placeholder="Optional"
              />
            </label>
            <label>
              vfx
              <select
                value={node.vfx ?? ""}
                onChange={(e) =>
                  onChange({
                    ...node,
                    vfx: (e.target.value as any) || undefined,
                  })
                }
              >
                <option value="">none</option>
                <option value="shake">shake</option>
                <option value="glitch">glitch</option>
                <option value="dark">dark</option>
              </select>
            </label>
            <label>
              sfx
              <select
                value={node.sfx ?? ""}
                onChange={(e) =>
                  onChange({
                    ...node,
                    sfx: (e.target.value as any) || undefined,
                  })
                }
              >
                <option value="">none</option>
                <option value="blip">blip</option>
                <option value="win">win</option>
                <option value="lose">lose</option>
                <option value="hurt">hurt</option>
              </select>
            </label>
          </div>
        </Collapsible>

        <Collapsible
          title={`Choices (${node.choices.length})`}
          right={
            <button
              className="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onAddChoice();
              }}
            >
              + Choice
            </button>
          }
        >
          <div className="list-stack">
            {node.choices.map((choice, idx) => (
              <Collapsible
                key={idx}
                title={`Choice ${idx + 1}: ${choice.text || "untitled"}`}
                initialOpen={idx === 0}
                right={
                  <button
                    className="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveChoice(idx);
                    }}
                  >
                    Delete
                  </button>
                }
              >
                <ChoiceEditor
                  choice={choice}
                  index={idx}
                  onUpdate={(updated) => {
                    const next = [...node.choices];
                    next[idx] = updated;
                    onChange({ ...node, choices: next });
                  }}
                  onRemove={() => onRemoveChoice(idx)}
                />
              </Collapsible>
            ))}
            {node.choices.length === 0 && (
              <div className="badge">This node currently has no choices</div>
            )}
          </div>
        </Collapsible>

        <Collapsible title="Raw JSON" initialOpen={false}>
          <div className="editor-shell">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={rawJson}
              onChange={(value) => {
                setIsEditingRawJson(true);
                setRawJson(value ?? "");
              }}
              onMount={(editor) => {
                editor.onDidBlurEditorText(() => {
                  setIsEditingRawJson(false);
                  if (parsed) onChange(parsed);
                });
                editor.onDidFocusEditorText(() => {
                  setIsEditingRawJson(true);
                });
              }}
              options={{ minimap: { enabled: false }, fontSize: 12 }}
            />
          </div>
          {parsed ? null : <div className="error">Invalid JSON in editor</div>}
        </Collapsible>
      </div>
    </div>
  );
};

export default NodePanel;
