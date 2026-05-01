/**
 * Teacher Curriculum Builder — React Flow canvas
 *
 * Desktop-first curriculum map where teachers drag/connect concept nodes
 * to create a prerequisite graph (Jigsaw puzzle structure).
 *
 * Each node represents a Concept (card_type: recall | poll | hotspot | sequence).
 * Edges represent prerequisites ("must understand X before Y").
 */

import { useCallback, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Save, BookOpen, List, Zap, Image, Shuffle } from "lucide-react";

/** Card type colours for node borders */
const CARD_TYPE_COLORS: Record<string, string> = {
  recall:   "#3b82f6", // blue
  poll:     "#a855f7", // purple
  hotspot:  "#f59e0b", // amber
  sequence: "#10b981", // emerald
};

const CARD_TYPE_ICONS: Record<string, React.ReactNode> = {
  recall:   <BookOpen className="h-3.5 w-3.5" />,
  poll:     <List className="h-3.5 w-3.5" />,
  hotspot:  <Image className="h-3.5 w-3.5" />,
  sequence: <Shuffle className="h-3.5 w-3.5" />,
};

type CardType = "recall" | "poll" | "hotspot" | "sequence";

interface ConceptNodeData {
  label: string;
  cardType: CardType;
  tags: string[];
}

/** Custom node renderer for concept cards */
function ConceptNode({ data }: { data: ConceptNodeData }) {
  const color = CARD_TYPE_COLORS[data.cardType] ?? "#94a3b8";
  const icon  = CARD_TYPE_ICONS[data.cardType];
  return (
    <div
      className="px-4 py-3 rounded-2xl bg-white shadow-md border-2 min-w-[160px] max-w-[220px]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
          {data.cardType}
        </span>
      </div>
      <p className="text-sm font-bold text-slate-900 leading-snug">{data.label}</p>
      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.tags.map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { concept: ConceptNode };

/** Seed nodes for a demo curriculum */
const INITIAL_NODES: Node[] = [
  { id: "1", type: "concept", position: { x: 100, y: 100 }, data: { label: "What is photosynthesis?", cardType: "recall", tags: ["biology", "plants"] } },
  { id: "2", type: "concept", position: { x: 380, y: 80  }, data: { label: "Light reactions quiz",   cardType: "poll",    tags: ["biology"] } },
  { id: "3", type: "concept", position: { x: 100, y: 280 }, data: { label: "Chloroplast hotspot",    cardType: "hotspot", tags: ["biology", "cells"] } },
  { id: "4", type: "concept", position: { x: 380, y: 280 }, data: { label: "Calvin cycle steps",     cardType: "sequence",tags: ["biology"] } },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-2", source: "1", target: "2", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#94a3b8" }, label: "leads to" },
  { id: "e1-3", source: "1", target: "3", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#94a3b8" } },
  { id: "e3-4", source: "3", target: "4", markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#94a3b8" }, label: "prerequisite" },
];

let nextNodeId = 5;

export default function TeacherCurriculumBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [saved, setSaved] = useState(false);
  const [addForm, setAddForm] = useState<{ label: string; cardType: CardType; tags: string } | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#94a3b8" } }, eds)),
    [setEdges],
  );

  function handleAddNode() {
    if (!addForm?.label.trim()) return;
    const id = String(nextNodeId++);
    const newNode: Node = {
      id,
      type: "concept",
      position: { x: 150 + Math.random() * 300, y: 150 + Math.random() * 200 },
      data: {
        label: addForm.label.trim(),
        cardType: addForm.cardType,
        tags: addForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setAddForm(null);
  }

  function handleSave() {
    // In production: POST to /api/curriculum-builder with { nodes, edges }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppLayout>
      <div className="space-y-4 font-['Inter']">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Teacher Tools</p>
            <h1 className="text-2xl font-bold text-slate-900">Curriculum Builder</h1>
            <p className="text-sm text-slate-500 mt-0.5">Drag concepts to build prerequisite graphs. Connect nodes to define learning paths.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddForm({ label: "", cardType: "recall", tags: "" })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Concept
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
            >
              {saved ? <><Zap className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Graph</>}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {(Object.entries(CARD_TYPE_COLORS) as [CardType, string][]).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: color }} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
          <span className="ml-auto text-xs text-slate-400">Drag to connect · Click to select</span>
        </div>

        {/* React Flow canvas */}
        <div className="rounded-3xl border border-slate-200 overflow-hidden" style={{ height: "60vh" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
            <Controls className="bg-white border border-slate-200 rounded-xl shadow-sm" />
            <MiniMap
              nodeColor={(n) => {
                const d = n.data as unknown as ConceptNodeData;
                return CARD_TYPE_COLORS[d.cardType] ?? "#94a3b8";
              }}
              className="bg-white border border-slate-200 rounded-xl shadow-sm"
            />
          </ReactFlow>
        </div>

        {/* Add Concept modal */}
        {addForm !== null && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setAddForm(null)}>
            <div className="bg-white rounded-3xl p-7 shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-slate-900 mb-5">New Concept</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title / Prompt</label>
                  <input
                    type="text"
                    value={addForm.label}
                    onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                    placeholder="e.g. What is osmosis?"
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Card Type</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {(["recall", "poll", "hotspot", "sequence"] as CardType[]).map((ct) => (
                      <button
                        key={ct}
                        onClick={() => setAddForm({ ...addForm, cardType: ct })}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                          addForm.cardType === ct
                            ? "border-blue-400 bg-blue-50 text-blue-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span style={{ color: CARD_TYPE_COLORS[ct] }}>{CARD_TYPE_ICONS[ct]}</span>
                        {ct.charAt(0).toUpperCase() + ct.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={addForm.tags}
                    onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
                    placeholder="e.g. biology, cells"
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setAddForm(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleAddNode} className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">Add Node</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
