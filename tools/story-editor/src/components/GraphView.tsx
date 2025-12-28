import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  Position,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { Choice, StoryNode } from "../types";
import { GRAPH_COLS, GRAPH_X_SPACING, GRAPH_Y_SPACING } from "../config";
import {
  BACKGROUND_COLOR,
  BACKGROUND_GAP,
  CONTROLS_POSITION,
  MINIMAP_DEFAULT_COLOR,
  MINIMAP_MASK_COLOR,
  MINIMAP_SELECTED_COLOR,
} from "../theme";

const defaultEdgeOptions = {
  className: "edge-default",
};

interface GraphViewProps {
  nodes: StoryNode[];
  selectedNodeId?: string;
  onSelectNode: (id: string | undefined) => void;
  onConnectChoice: (
    sourceNodeId: string,
    choiceHandle: string,
    targetNodeId: string,
  ) => void;
}

const StoryNodeCard: React.FC<{ data: StoryNode; selected: boolean }> = ({
  data,
  selected,
}) => (
  <div
    className={`story-node-card ${selected ? "story-node-card--selected" : ""}`}
  >
    <div className="story-node-card__title">{data.id}</div>
    <div className="story-node-card__body">
      {data.text.slice(0, 80)}
      {data.text.length > 80 ? "…" : ""}
    </div>
    <div className="story-node-card__label">Choices</div>
    <div className="story-node-card__choices">
      {data.choices.map((choice: Choice, idx: number) => (
        <div className="story-node-card__choice" key={idx}>
          <span className="story-node-card__choice-text">
            {choice.text || `Choice ${idx}`}
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id={`choice-${choice.id ?? idx}`}
            className={`choice-handle choice-order-${Math.min(idx, 14)}`}
          />
        </div>
      ))}
    </div>
    <Handle
      type="target"
      position={Position.Left}
      className="story-node-card__target"
    />
  </div>
);

const nodeTypes = {
  storyNode: ({ data, selected }: any) => (
    <StoryNodeCard data={data as StoryNode} selected={selected} />
  ),
};
const buildRfNodes = (nodes: StoryNode[]): Node[] =>
  nodes.map((node, idx) => ({
    id: node.id,
    type: "storyNode",
    data: { ...node, choices: node.choices ?? [] },
    position: {
      x: (idx % GRAPH_COLS) * GRAPH_X_SPACING,
      y: Math.floor(idx / GRAPH_COLS) * GRAPH_Y_SPACING,
    },
  }));

const buildRfEdges = (nodes: StoryNode[]): Edge[] =>
  nodes.flatMap((node) =>
    (node.choices ?? [])
      .filter((choice) => choice.nextNodeId)
      .map((choice, idx) => ({
        id: `${node.id}-${choice.id ?? idx}-${choice.nextNodeId}`,
        source: node.id,
        target: choice.nextNodeId,
        sourceHandle: `choice-${choice.id ?? idx}`,
        animated: false,
      })),
  );

const GraphContent: React.FC<GraphViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onConnectChoice,
}) => {
  const rfNodes = useMemo(() => buildRfNodes(nodes), [nodes]);
  const rfEdges = useMemo(() => buildRfEdges(nodes), [nodes]);

  const handleConnect = (connection: Connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle)
      return;
    onConnectChoice(
      connection.source,
      connection.sourceHandle,
      connection.target,
    );
  };

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      fitView
      nodesDraggable
      defaultEdgeOptions={defaultEdgeOptions}
      onConnect={handleConnect}
      onNodeClick={(_, node) => onSelectNode(node.id)}
      onPaneClick={() => onSelectNode(undefined)}
      selectionKeyCode={null}
    >
      <Background gap={BACKGROUND_GAP} color={BACKGROUND_COLOR} />
      <Controls position={CONTROLS_POSITION} />
      <MiniMap
        nodeColor={(n) =>
          n.id === selectedNodeId
            ? MINIMAP_SELECTED_COLOR
            : MINIMAP_DEFAULT_COLOR
        }
        maskColor={MINIMAP_MASK_COLOR}
      />
    </ReactFlow>
  );
};

const GraphView: React.FC<GraphViewProps> = (props) => (
  <div className="graph-shell">
    <ReactFlowProvider>
      <GraphContent {...props} />
    </ReactFlowProvider>
  </div>
);

export default GraphView;
