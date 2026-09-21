# Weltwerkzeug – Vollimplementierung

## Typdefinitionen und Datenmodelle

```typescript
// src/types/world.ts

/**
 * Grundlegende Typen für das Weltwerkzeug
 * Drei Speicherebenen: Partie, Auflage, Kanon
 */

// ─────────────────────────────────────────────────────────────────────────────
// Basis-Typen
// ─────────────────────────────────────────────────────────────────────────────

export type SceneId = string;
export type QuestId = string;
export type LocationId = string;
export type StateId = string;
export type CharacterId = string;
export type ArtKey = string;
export type PortraitKey = string;

export interface Choice {
  text: string;
  targetSceneId: SceneId;
  condition?: StateId; // Optional: Voraussetzung für diese Wahl
}

export interface SceneBase {
  id: SceneId;
  title: string;
  lines: string[];
  choices: Choice[];
  art?: ArtKey;
  portrait?: PortraitKey;
  gives?: StateId[]; // Zustands-IDs, die diese Szene vergibt
  takes?: StateId[]; // Zustands-IDs, die diese Szene entfernt
  locationId?: LocationId;
  questId?: QuestId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Drei Speicherebenen
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ebene 1: Partie – der laufende Spielstand
 */
export interface SceneInstance extends SceneBase {
  visitedAt?: number; // Timestamp des ersten Besuchs
  playerNotes?: string; // Notizen des Spielers zu dieser Szene
  visitCount: number; // Wie oft wurde diese Szene besucht?
}

export interface Hero {
  id: string;
  name: string;
  hp: number;
  gold: number;
  inventory: StateId[];
  states: StateId[];
  decisions: Decision[];
  knowledge: KnowledgeEntry[];
}

export interface Decision {
  type: "choice" | "ruf" | "lage" | "wissen";
  sceneId: SceneId;
  timestamp: number;
  payload: any;
}

export interface KnowledgeEntry {
  type: "material" | "sozial" | "ort" | "uebernatuerlich";
  fact: string;
  acquiredAt: number;
}

export interface PartieSave {
  version: "lindendorf-save-v1";
  hero: Hero;
  currentSceneId: SceneId;
  visitedScenes: SceneId[];
  savedAt: number;
}

/**
 * Ebene 2: Auflage – lokale Weltbearbeitung
 */
export interface SceneDraft extends SceneBase {
  draftOf?: SceneId; // Referenz auf Kanon-Szene
  lastModified: number;
  modifiedBy?: string;
  version: number;
  basedOnVersion: number; // Auf welcher Kanon-Version basiert diese Auflage?
  previousText?: string[]; // Für Rückgjengig: vorherige Textzeilen
}

export interface WeltAuflage {
  version: "lindendorf.welt.v2";
  scenes: Record<SceneId, SceneDraft>;
  createdAt: number;
  lastModified: number;
}

/**
 * Ebene 3: Kanon – der verbindliche Quelltext
 */
export interface SceneCanonical extends SceneBase {
  version: number;
  author?: string;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  status: "kanon" | "entwurf" | "verworfen";
}

export interface KanonContent {
  scenes: Record<SceneId, SceneCanonical>;
  quests: Record<QuestId, Quest>;
  locations: Record<LocationId, Location>;
  states: Record<StateId, State>;
  characters: Record<CharacterId, Character>;
  tests: Record<string, Test>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quests, Orte, Zustande, Figuren
// ─────────────────────────────────────────────────────────────────────────────

export interface Quest {
  id: QuestId;
  title: string;
  description: string;
  startSceneId: SceneId;
  targetSceneId: SceneId;
  prerequisites: QuestId[]; // Andere Quests, die zuerst abgeschlossen sein müssen
  requiredStates: StateId[]; // Zustande, die der Held haben muss
  reward: Reward;
  status: "not_started" | "active" | "completed" | "blocked";
}

export interface Reward {
  gold?: number;
  states?: StateId[];
  knowledge?: KnowledgeEntry[];
}

export interface Location {
  id: LocationId;
  name: string;
  parentLocationId?: LocationId; // Für hierarchische Struktur
  description?: string;
  sceneIds: SceneId[]; // Alle Szenen in diesem Ort
}

export interface State {
  id: StateId;
  name: string;
  description: string;
  type: "item" | "effect" | "relationship" | "location";
  givenBy: SceneId[]; // Szenen, die diesen Zustand vergeben
  takenBy: SceneId[]; // Szenen, die diesen Zustand entfernen
  activeInParties: string[]; // Partie-IDs, in denen dieser Zustand aktiv ist
}

export interface Character {
  id: CharacterId;
  name: string;
  type: "hero" | "npc" | "enemy" | "neutral";
  firstAppearanceSceneId: SceneId;
  description?: string;
  knowledge: KnowledgeEntry[];
  relationships: Record<CharacterId, number>; // Ruf-Werte gegenüber anderen Figuren
}

export interface Test {
  id: string;
  description: string;
  locationId: LocationId;
  difficulty: number;
  attribute: string;
  successEffect: string;
  failureEffect: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Events für nachvollziehbare Anderungen
// ─────────────────────────────────────────────────────────────────────────────

export type WorldEventType =
  | "give_state"
  | "take_state"
  | "modify_choice"
  | "update_text"
  | "update_title"
  | "update_art"
  | "update_portrait"
  | "give_quest"
  | "complete_quest"
  | "modify_ruf";

export interface WorldEvent {
  id: string;
  type: WorldEventType;
  sceneId: SceneId;
  payload: any;
  timestamp: number;
  source: "spieler" | "spielleiter" | "system";
  partieId?: string; // Nur wenn partie-bezogen
}

export interface MetaLog {
  sceneId: SceneId;
  events: WorldEvent[];
  versions: VersionedScene[];
}

export interface VersionedScene {
  id: SceneId;
  version: number;
  content: SceneCanonical;
  timestamp: number;
  author?: string;
  comment?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Graph-Darstellung
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: SceneId;
  x: number;
  y: number;
  size: number; // Basierend auf Bedeutung
  color: string; // Basierend auf Status
  label: string;
}

export interface GraphEdge {
  source: SceneId;
  target: SceneId;
  label: string;
  color: string;
  isDashed: boolean;
  condition?: StateId;
}

export interface WorldGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

## Welt-Engine

```typescript
// src/engine/welt-engine.ts

import {
  SceneCanonical,
  SceneDraft,
  SceneInstance,
  WeltAuflage,
  PartieSave,
  WorldEvent,
  MetaLog,
  VersionedScene,
  Quest,
  Location,
  State,
  Character,
  KanonContent,
  WorldGraph,
  GraphNode,
  GraphEdge,
} from "../types/world";

/**
 * Zentrale Engine für alle Welt-Operationen
 */
export class WeltEngine {
  private kanon: KanonContent;
  private auflage: WeltAuflage | null;
  private partie: PartieSave | null;
  private metaLogs: Record<string, MetaLog> = {};

  constructor(kanon: KanonContent) {
    this.kanon = kanon;
    this.auflage = null;
    this.partie = null;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Szenen lesen
  // ───────────────────────────────────────────────────────────────────────────

  getKanonScene(sceneId: string): SceneCanonical | null {
    return this.kanon.scenes[sceneId] || null;
  }

  getAuflageScene(sceneId: string): SceneDraft | null {
    if (!this.auflage) return null;
    return this.auflage.scenes[sceneId] || null;
  }

  getPartieScene(sceneId: string): SceneInstance | null {
    if (!this.partie) return null;
    const kanonScene = this.getKanonScene(sceneId);
    if (!kanonScene) return null;

    const auflageScene = this.getAuflageScene(sceneId);
    const baseScene = auflageScene || kanonScene;

    const visited = this.partie.visitedScenes.includes(sceneId);

    return {
      ...baseScene,
      visitedAt: visited ? Date.now() : undefined,
      playerNotes: "",
      visitCount: visited ? 1 : 0,
    };
  }

  getEffectiveScene(sceneId: string): SceneCanonical | SceneDraft | SceneInstance | null {
    // Prioritat: Partie > Auflage > Kanon
    if (this.partie) {
      return this.getPartieScene(sceneId);
    }
    if (this.auflage) {
      return this.getAuflageScene(sceneId);
    }
    return this.getKanonScene(sceneId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Auflage erstellen und verwalten
  // ───────────────────────────────────────────────────────────────────────────

  createAuflage(sceneId: string, content: Partial<SceneDraft>): SceneDraft | null {
    const kanonScene = this.getKanonScene(sceneId);
    if (!kanonScene) return null;

    if (!this.auflage) {
      this.auflage = {
        version: "lindendorf.welt.v2",
        scenes: {},
        createdAt: Date.now(),
        lastModified: Date.now(),
      };
    }

    const previousVersion = this.auflage.scenes[sceneId];

    const draft: SceneDraft = {
      ...kanonScene,
      ...content,
      draftOf: sceneId,
      lastModified: Date.now(),
      version: (previousVersion?.version || 0) + 1,
      basedOnVersion: kanonScene.version,
      previousText: previousVersion ? previousVersion.lines : undefined,
    };

    this.auflage.scenes[sceneId] = draft;
    this.auflage.lastModified = Date.now();

    this.logEvent({
      id: this.generateId(),
      type: "update_text",
      sceneId,
      payload: { action: "create_auflage" },
      timestamp: Date.now(),
      source: "spielleiter",
    });

    return draft;
  }

  updateAuflage(sceneId: string, updates: Partial<SceneDraft>): SceneDraft | null {
    if (!this.auflage) return null;
    const existing = this.auflage.scenes[sceneId];
    if (!existing) return null;

    const updated: SceneDraft = {
      ...existing,
      ...updates,
      lastModified: Date.now(),
      version: existing.version + 1,
      previousText: existing.lines,
    };

    this.auflage.scenes[sceneId] = updated;
    this.auflage.lastModified = Date.now();

    return updated;
  }

  deleteAuflage(sceneId: string): boolean {
    if (!this.auflage) return false;
    if (!this.auflage.scenes[sceneId]) return false;

    delete this.auflage.scenes[sceneId];
    this.auflage.lastModified = Date.now();

    return true;
  }

  getAuflageList(): SceneDraft[] {
    if (!this.auflage) return [];
    return Object.values(this.auflage.scenes);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Rueckgaengig
  // ───────────────────────────────────────────────────────────────────────────

  undoLastAuflage(sceneId: string): SceneDraft | null {
    if (!this.auflage) return null;
    const draft = this.auflage.scenes[sceneId];
    if (!draft) return null;
    if (!draft.previousText) return null;

    const reverted: SceneDraft = {
      ...draft,
      lines: draft.previousText,
      version: draft.version + 1,
      previousText: undefined,
    };

    this.auflage.scenes[sceneId] = reverted;
    return reverted;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Kanon-Operationen
  // ───────────────────────────────────────────────────────────────────────────

  applyAuflageToKanon(sceneId: string, author?: string, comment?: string): boolean {
    if (!this.auflage) return false;
    const draft = this.auflage.scenes[sceneId];
    if (!draft) return false;

    const kanonScene = this.getKanonScene(sceneId);
    if (!kanonScene) return false;

    const newVersion: VersionedScene = {
      id: sceneId,
      version: kanonScene.version + 1,
      content: {
        ...draft,
        version: kanonScene.version + 1,
        status: "kanon",
        author: author || kanonScene.author,
        createdAt: kanonScene.createdAt,
        reviewedAt: Date.now(),
        reviewedBy: author,
      },
      timestamp: Date.now(),
      author,
      comment,
    };

    this.kanon.scenes[sceneId] = newVersion.content;

    this.addToMetaLog(sceneId, newVersion);

    this.deleteAuflage(sceneId);

    return true;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Welt-Graph
  // ───────────────────────────────────────────────────────────────────────────

  buildWorldGraph(): WorldGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    const scenes = Object.values(this.kanon.scenes);

    scenes.forEach((scene, index) => {
      // Knoten erstellen
      const auflageExists = this.auflage?.scenes[scene.id] !== undefined;
      const color = auflageExists ? "#f59e0b" : "#10b981"; // Orange wenn Auflage, sonst Gruen
      const size = scene.questId ? 12 : 8; // Quest-Szenen groesser

      nodes.push({
        id: scene.id,
        x: (index % 10) * 150,
        y: Math.floor(index / 10) * 100,
        size,
        color,
        label: scene.title,
      });

      // Kanten erstellen
      scene.choices.forEach((choice, choiceIndex) => {
        edges.push({
          source: scene.id,
          target: choice.targetSceneId,
          label: choice.text.substring(0, 20) + "...",
          color: choice.condition ? "#f97316" : "#6b7280",
          isDashed: false,
          condition: choice.condition,
        });
      });
    });

    return { nodes, edges };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Quest-Uebersicht
  // ───────────────────────────────────────────────────────────────────────────

  getQuestOverview(): Quest[] {
    return Object.values(this.kanon.quests);
  }

  getQuestDependencies(questId: string): QuestId[] {
    const quest = this.kanon.quests[questId];
    if (!quest) return [];
    return quest.prerequisites;
  }

  getBlockedQuests(): Quest[] {
    return Object.values(this.kanon.quests).filter(quest => {
      if (quest.status !== "blocked") return false;

      // Pruefen, ob Voraussetzungen erfuellt sind
      const missingPrereqs = quest.prerequisites.filter(prereqId => {
        const prereq = this.kanon.quests[prereqId];
        return !prereq || prereq.status !== "completed";
      });

      return missingPrereqs.length > 0;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Zustands-Register
  // ───────────────────────────────────────────────────────────────────────────

  getStateOverview(): State[] {
    return Object.values(this.kanon.states);
  }

  getUnusedStates(): State[] {
    return Object.values(this.kanon.states).filter(state => {
      return state.givenBy.length === 0 && state.takenBy.length === 0;
    });
  }

  getStatesNeverGiven(): State[] {
    return Object.values(this.kanon.states).filter(state => {
      return state.givenBy.length === 0;
    });
  }

  getStatesNeverTaken(): State[] {
    return Object.values(this.kanon.states).filter(state => {
      return state.takenBy.length === 0;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Figuren-Register
  // ───────────────────────────────────────────────────────────────────────────

  getCharacterOverview(): Character[] {
    return Object.values(this.kanon.characters);
  }

  getRufMatrix(): Record<CharacterId, Record<CharacterId, number>> {
    const matrix: Record<CharacterId, Record<CharacterId, number>> = {};

    Object.values(this.kanon.characters).forEach(char => {
      matrix[char.id] = {};
      Object.values(this.kanon.characters).forEach(otherChar => {
        matrix[char.id][otherChar.id] = char.relationships[otherChar.id] || 0;
      });
    });

    return matrix;
  }

  getKnowledgeNetwork(): Record<CharacterId, string[]> {
    const network: Record<CharacterId, string[]> = {};

    Object.values(this.kanon.characters).forEach(char => {
      network[char.id] = char.knowledge.map(k => k.fact);
    });

    return network;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Regel-Checker
  // ───────────────────────────────────────────────────────────────────────────

  validateWorld(): ValidationResult[] {
    const results: ValidationResult[] = [];

    // 1. Szenen ohne Ausgang
    Object.values(this.kanon.scenes).forEach(scene => {
      if (scene.choices.length === 0 && scene.questId === undefined) {
        results.push({
          type: "warning",
          sceneId: scene.id,
          message: `Szene "${scene.title}" hat keine Ausgaenge (auber es ist ein Quest-Ende)`,
        });
      }
    });

    // 2. Wahlen, die ins Nichts fuehren
    Object.values(this.kanon.scenes).forEach(scene => {
      scene.choices.forEach(choice => {
        if (!this.kanon.scenes[choice.targetSceneId]) {
          results.push({
            type: "error",
            sceneId: scene.id,
            message: `Wahl "${choice.text}" fuehrt zu nicht existierender Szene "${choice.targetSceneId}"`,
          });
        }
      });
    });

    // 3. Zustaende, die nie vergeben werden
    this.getStatesNeverGiven().forEach(state => {
      results.push({
        type: "warning",
        message: `Zustand "${state.name}" wird von keiner Szene vergeben`,
      });
    });

    // 4. Zustaende, die nie genommen werden
    this.getStatesNeverTaken().forEach(state => {
      results.push({
        type: "info",
        message: `Zustand "${state.name}" wird von keiner Szene entfernt`,
      });
    });

    // 5. Isolierte Szenen
    const graph = this.buildWorldGraph();
    const incomingEdges = new Map<string, number>();

    graph.edges.forEach(edge => {
      incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
    });

    graph.nodes.forEach(node => {
      if (!incomingEdges.has(node.id) && node.id !== this.kanon.scenes[Object.keys(this.kanon.scenes)[0]]?.id) {
        results.push({
          type: "warning",
          sceneId: node.id,
          message: `Szene "${node.label}" hat keine eingehenden Kanten (isoliert)`,
        });
      }
    });

    // 6. Quests, die nie abgeschlossen werden koennen
    this.getBlockedQuests().forEach(quest => {
      results.push({
        type: "error",
        message: `Quest "${quest.title}" ist blockiert (Voraussetzungen nicht erfuellbar)`,
      });
    });

    return results;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Meta-Log
  // ───────────────────────────────────────────────────────────────────────────

  private logEvent(event: WorldEvent) {
    if (!this.metaLogs[event.sceneId]) {
      this.metaLogs[event.sceneId] = {
        sceneId: event.sceneId,
        events: [],
        versions: [],
      };
    }

    this.metaLogs[event.sceneId].events.push(event);
  }

  private addToMetaLog(sceneId: string, version: VersionedScene) {
    if (!this.metaLogs[sceneId]) {
      this.metaLogs[sceneId] = {
        sceneId,
        events: [],
        versions: [],
      };
    }

    this.metaLogs[sceneId].versions.push(version);
  }

  getMetaLog(sceneId: string): MetaLog | null {
    return this.metaLogs[sceneId] || null;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Hilfsfunktionen
  // ───────────────────────────────────────────────────────────────────────────

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  exportToJson(): string {
    return JSON.stringify({
      kanon: this.kanon,
      auflage: this.auflage,
      partie: this.partie,
      metaLogs: this.metaLogs,
    }, null, 2);
  }

  static importFromJson(json: string): WeltEngine {
    const data = JSON.parse(json);
    const engine = new WeltEngine(data.kanon);
    engine.auflage = data.auflage;
    engine.partie = data.partie;
    engine.metaLogs = data.metaLogs || {};
    return engine;
  }
}

export interface ValidationResult {
  type: "info" | "warning" | "error";
  sceneId?: string;
  message: string;
}
```

## React-Komponenten

```typescript
// src/components/welt/WeltGraph.tsx

import React, { useMemo, useState } from "react";
import { WeltEngine, WorldGraph } from "../../engine/welt-engine";
import { SceneId, LocationId, QuestId } from "../../types/world";

interface WeltGraphProps {
  engine: WeltEngine;
  onSceneClick: (sceneId: SceneId) => void;
  filterLocation?: LocationId;
  filterQuest?: QuestId;
}

export function WeltGraph({ engine, onSceneClick, filterLocation, filterQuest }: WeltGraphProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const graph: WorldGraph = useMemo(() => {
    return engine.buildWorldGraph();
  }, [engine]);

  const filteredNodes = useMemo(() => {
    return graph.nodes.filter(node => {
      if (filterLocation) {
        const scene = engine.getKanonScene(node.id);
        if (scene?.locationId !== filterLocation) return false;
      }
      if (filterQuest) {
        const scene = engine.getKanonScene(node.id);
        if (scene?.questId !== filterQuest) return false;
      }
      return true;
    });
  }, [graph, filterLocation, filterQuest, engine]);

  const filteredEdges = useMemo(() => {
    return graph.edges.filter(edge => {
      return filteredNodes.some(n => n.id === edge.source) &&
             filteredNodes.some(n => n.id === edge.target);
    });
  }, [graph, filteredNodes]);

  return (
    <div className="relative w-full h-96 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
          className="px-2 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
        >
          −
        </button>
        <span className="px-2 py-1 bg-white border border-gray-300 rounded shadow">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(2, z + 0.1))}
          className="px-2 py-1 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
        >
          +
        </button>
      </div>

      {/* Graph */}
      <svg
        className="w-full h-full"
        viewBox={`0 0 1000 600`}
        style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
      >
        {/* Kanten */}
        {filteredEdges.map((edge, i) => (
          <g key={`edge-${i}`}>
            <line
              x1={graph.nodes.find(n => n.id === edge.source)?.x || 0}
              y1={graph.nodes.find(n => n.id === edge.source)?.y || 0}
              x2={graph.nodes.find(n => n.id === edge.target)?.x || 0}
              y2={graph.nodes.find(n => n.id === edge.target)?.y || 0}
              stroke={edge.color}
              strokeWidth="2"
              strokeDasharray={edge.isDashed ? "5,5" : "none"}
              opacity="0.6"
            />
            <text
              x={(graph.nodes.find(n => n.id === edge.source)?.x || 0) + 
                  (graph.nodes.find(n => n.id === edge.target)?.x || 0)) / 2}
              y={(graph.nodes.find(n => n.id === edge.source)?.y || 0) + 
                  (graph.nodes.find(n => n.id === edge.target)?.y || 0)) / 2 - 5}
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {edge.label}
            </text>
          </g>
        ))}

        {/* Knoten */}
        {filteredNodes.map(node => (
          <g
            key={`node-${node.id}`}
            onClick={() => onSceneClick(node.id)}
            className="cursor-pointer hover:opacity-80"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={node.color}
              stroke="#1f2937"
              strokeWidth="2"
            />
            <text
              x={node.x}
              y={node.y + node.size + 15}
              fontSize="12"
              fill="#1f2937"
              textAnchor="middle"
              className="pointer-events-none"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legende */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded border border-gray-200 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>Kanon</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span>Auflage</span>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/components/welt/SzenenBibliothek.tsx

import React, { useMemo, useState } from "react";
import { WeltEngine } from "../../engine/welt-engine";
import { SceneCanonical, SceneDraft, SceneId } from "../../types/world";

interface SzenenBibliothekProps {
  engine: WeltEngine;
  onSceneSelect: (sceneId: SceneId) => void;
}

export function SzenenBibliothek({ engine, onSceneSelect }: SzenenBibliothekProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "title" | "location" | "date">("id");
  const [selectedScenes, setSelectedScenes] = useState<SceneId[]>([]);

  const scenes = useMemo(() => {
    const kanonScenes = Object.values(engine.getKanonScene);
    const auflageScenes = engine.getAuflageList();

    return kanonScenes.map(scene => {
      const auflage = auflageScenes.find(a => a.draftOf === scene.id);
      return {
        ...scene,
        hasAuflage: !!auflage,
        lastModified: auflage?.lastModified || scene.createdAt,
      };
    });
  }, [engine]);

  const filteredScenes = useMemo(() => {
    return scenes
      .filter(scene => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          scene.id.toLowerCase().includes(searchLower) ||
          scene.title.toLowerCase().includes(searchLower) ||
          scene.lines.some(line => line.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "id":
            return a.id.localeCompare(b.id);
          case "title":
            return a.title.localeCompare(b.title);
          case "location":
            return (a.locationId || "").localeCompare(b.locationId || "");
          case "date":
            return b.lastModified - a.lastModified;
          default:
            return 0;
        }
      });
  }, [scenes, search, sortBy]);

  const toggleSelect = (sceneId: SceneId) => {
    setSelectedScenes(prev =>
      prev.includes(sceneId)
        ? prev.filter(id => id !== sceneId)
        : [...prev, sceneId]
    );
  };

  const selectAll = () => {
    setSelectedScenes(filteredScenes.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedScenes([]);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Suche nach ID, Titel, Text..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
        >
          <option value="id">Sortieren: ID</option>
          <option value="title">Sortieren: Titel</option>
          <option value="location">Sortieren: Ort</option>
          <option value="date">Sortieren: Datum</option>
        </select>
      </div>

      {/* Batch-Aktionen */}
      {selectedScenes.length > 0 && (
        <div className="flex gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <span className="text-sm text-blue-800">
            {selectedScenes.length} Szenen ausgewählt
          </span>
          <button
            onClick={() => {
              // Batch-Markierung als "geprueft"
              console.log("Markiere als geprueft:", selectedScenes);
            }}
            className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Als geprüft markieren
          </button>
          <button
            onClick={deselectAll}
            className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          >
            Auswahl aufheben
          </button>
        </div>
      )}

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left border-b">
                <input
                  type="checkbox"
                  checked={selectedScenes.length === filteredScenes.length}
                  onChange={e => e.target.checked ? selectAll() : deselectAll()}
                />
              </th>
              <th className="px-3 py-2 text-left border-b">ID</th>
              <th className="px-3 py-2 text-left border-b">Titel</th>
              <th className="px-3 py-2 text-left border-b">Ort</th>
              <th className="px-3 py-2 text-left border-b">Status</th>
              <th className="px-3 py-2 text-left border-b">Geaendert</th>
            </tr>
          </thead>
          <tbody>
            {filteredScenes.map(scene => (
              <tr
                key={scene.id}
                onClick={() => onSceneSelect(scene.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-3 py-2 border-t">
                  <input
                    type="checkbox"
                    checked={selectedScenes.includes(scene.id)}
                    onChange={() => toggleSelect(scene.id)}
                  />
                </td>
                <td className="px-3 py-2 border-t font-mono text-xs">{scene.id}</td>
                <td className="px-3 py-2 border-t">{scene.title}</td>
                <td className="px-3 py-2 border-t">{scene.locationId || "—"}</td>
                <td className="px-3 py-2 border-t">
                  {scene.hasAuflage ? (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                      Auflage
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                      Kanon
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 border-t">
                  {new Date(scene.lastModified).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            const csv = filteredScenes.map(s =>
              `${s.id},"${s.title}","${s.locationId || ""}",${s.hasAuflage ? "Auflage" : "Kanon"}`
            ).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "szenen.csv";
            a.click();
          }}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Als CSV exportieren
        </button>
        <button
          onClick={() => {
            const json = JSON.stringify(filteredScenes, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "szenen.json";
            a.click();
          }}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Als JSON exportieren
        </button>
      </div>
    </div>
  );
}
```

```typescript
// src/components/welt/RegelChecker.tsx

import React, { useMemo } from "react";
import { WeltEngine, ValidationResult } from "../../engine/welt-engine";

interface RegelCheckerProps {
  engine: WeltEngine;
  onSceneClick: (sceneId: string) => void;
}

export function RegelChecker({ engine, onSceneClick }: RegelCheckerProps) {
  const results: ValidationResult[] = useMemo(() => {
    return engine.validateWorld();
  }, [engine]);

  const errors = results.filter(r => r.type === "error");
  const warnings = results.filter(r => r.type === "warning");
  const infos = results.filter(r => r.type === "info");

  const ResultIcon = ({ type }: { type: ValidationResult["type"] }) => {
    switch (type) {
      case "error":
        return <span className="text-red-600">●</span>;
      case "warning":
        return <span className="text-amber-600">●</span>;
      case "info":
        return <span className="text-blue-600">●</span>;
    }
  };

  const ResultRow = ({ result }: { result: ValidationResult }) => (
    <div className="flex items-start gap-2 py-2 border-b last:border-b-0">
      <ResultIcon type={result.type} />
      <div className="flex-1">
        <p className="text-sm">{result.message}</p>
        {result.sceneId && (
          <button
            onClick={() => onSceneClick(result.sceneId!)}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            Szene öffnen: {result.sceneId}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Zusammenfassung */}
      <div className="flex gap-4">
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded">
          <div className="text-2xl font-bold text-red-700">{errors.length}</div>
          <div className="text-sm text-red-800">Fehler</div>
        </div>
        <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded">
          <div className="text-2xl font-bold text-amber-700">{warnings.length}</div>
          <div className="text-sm text-amber-800">Warnungen</div>
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded">
          <div className="text-2xl font-bold text-blue-700">{infos.length}</div>
          <div className="text-sm text-blue-800">Infos</div>
        </div>
      </div>

      {/* Fehler */}
      {errors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Fehler</h3>
          <div className="bg-white border border-red-200 rounded p-4">
            {errors.map((result, i) => (
              <ResultRow key={i} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Warnungen */}
      {warnings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-amber-700 mb-2">Warnungen</h3>
          <div className="bg-white border border-amber-200 rounded p-4">
            {warnings.map((result, i) => (
              <ResultRow key={i} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Infos */}
      {infos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Infos</h3>
          <div className="bg-white border border-blue-200 rounded p-4">
            {infos.map((result, i) => (
              <ResultRow key={i} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Keine Probleme */}
      {results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Keine Probleme gefunden. Die Welt ist in Ordnung.
        </div>
      )}

      {/* Export */}
      <button
        onClick={() => {
          const report = results.map(r =>
            `[${r.type.toUpperCase()}] ${r.sceneId || "Allgemein"}: ${r.message}`
          ).join("\n");
          const blob = new Blob([report], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "regel-checker-bericht.txt";
          a.click();
        }}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        Bericht exportieren
      </button>
    </div>
  );
}
```

```typescript
// src/components/welt/Zeitstrahl.tsx

import React, { useMemo } from "react";
import { PartieSave, Decision } from "../../types/world";

interface ZeitstrahlProps {
  partie: PartieSave;
}

export function Zeitstrahl({ partie }: ZeitstrahlProps) {
  const decisions: Decision[] = useMemo(() => {
    return partie.hero.decisions.sort((a, b) => a.timestamp - b.timestamp);
  }, [partie]);

  const DecisionIcon = ({ type }: { type: Decision["type"] }) => {
    switch (type) {
      case "choice":
        return <span className="text-blue-600">◆</span>;
      case "ruf":
        return <span className="text-red-600">♥</span>;
      case "lage":
        return <span className="text-amber-600">▲</span>;
      case "wissen":
        return <span className="text-emerald-600">●</span>;
    }
  };

  return (
    <div className="relative">
      {/* Zeitachse */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

      {/* Eintraege */}
      <div className="space-y-4">
        {decisions.map((decision, i) => (
          <div key={i} className="relative flex items-start gap-4">
            {/* Icon auf der Achse */}
            <div className="absolute left-6 w-4 h-4 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
              <DecisionIcon type={decision.type} />
            </div>

            {/* Inhalt */}
            <div className="ml-12 flex-1 bg-white border border-gray-200 rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-semibold text-gray-700">
                  {decision.type.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(decision.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Szene: {decision.sceneId}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {JSON.stringify(decision.payload, null, 2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zusammenfassung */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <div className="text-sm text-gray-600">
          <strong>Besuchte Szenen:</strong> {partie.visitedScenes.length}
        </div>
        <div className="text-sm text-gray-600">
          <strong>Entscheidungen:</strong> {decisions.length}
        </div>
        <div className="text-sm text-gray-600">
          <strong>Erste Szene:</strong>{" "}
          {decisions.length > 0
            ? new Date(decisions[0].timestamp).toLocaleDateString()
            : "—"}
        </div>
        <div className="text-sm text-gray-600">
          <strong>Letzte Szene:</strong>{" "}
          {decisions.length > 0
            ? new Date(decisions[decisions.length - 1].timestamp).toLocaleDateString()
            : "—"}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/components/welt/WeltWerkzeug.tsx

import React, { useState, useMemo } from "react";
import { WeltEngine } from "../../engine/welt-engine";
import { WeltGraph } from "./WeltGraph";
import { SzenenBibliothek } from "./SzenenBibliothek";
import { RegelChecker } from "./RegelChecker";
import { Zeitstrahl } from "./Zeitstrahl";
import { SceneId, PartieSave } from "../../types/world";

interface WeltWerkzeugProps {
  engine: WeltEngine;
  partie?: PartieSave;
  onClose: () => void;
}

type Tab = "karte" | "welt" | "figur" | "regel" | "planung" | "notizen" | "export";

export function WeltWerkzeug({ engine, partie, onClose }: WeltWerkzeugProps) {
  const [activeTab, setActiveTab] = useState<Tab>("karte");
  const [selectedSceneId, setSelectedSceneId] = useState<SceneId | null>(null);

  const handleSceneClick = (sceneId: SceneId) => {
    setSelectedSceneId(sceneId);
    setActiveTab("karte");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:w-5/6 h-5/6 sm:h-5/6 rounded-t-lg sm:rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Weltwerkzeug</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Schliessen (Esc)
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 py-3 border-b overflow-x-auto">
          <TabButton active={activeTab === "karte"} onClick={() => setActiveTab("karte")}>
            Karte
          </TabButton>
          <TabButton active={activeTab === "welt"} onClick={() => setActiveTab("welt")}>
            Welt
          </TabButton>
          <TabButton active={activeTab === "figur"} onClick={() => setActiveTab("figur")}>
            Figur
          </TabButton>
          <TabButton active={activeTab === "regel"} onClick={() => setActiveTab("regel")}>
            Regel
          </TabButton>
          <TabButton active={activeTab === "planung"} onClick={() => setActiveTab("planung")}>
            Planung
          </TabButton>
          <TabButton active={activeTab === "notizen"} onClick={() => setActiveTab("notizen")}>
            Notizen
          </TabButton>
          <TabButton active={activeTab === "export"} onClick={() => setActiveTab("export")}>
            Export
          </TabButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "karte" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Aktuelle Szene</h3>
              {selectedSceneId ? (
                <div className="p-4 border border-gray-200 rounded">
                  <p>Szene: {selectedSceneId}</p>
                  {/* Hier wuerde die Szenen-Bearbeitung kommen */}
                </div>
              ) : (
                <p className="text-gray-500">Waehle eine Szene aus der Weltkarte oder Bibliothek.</p>
              )}
            </div>
          )}

          {activeTab === "welt" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Weltkarte</h3>
              <WeltGraph engine={engine} onSceneClick={handleSceneClick} />

              <h3 className="text-lg font-semibold mt-6">Szenen-Bibliothek</h3>
              <SzenenBibliothek engine={engine} onSceneSelect={handleSceneClick} />
            </div>
          )}

          {activeTab === "figur" && partie && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Helden-Zeitstrahl</h3>
              <Zeitstrahl partie={partie} />
            </div>
          )}

          {activeTab === "regel" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Regel-Checker</h3>
              <RegelChecker engine={engine} onSceneClick={handleSceneClick} />
            </div>
          )}

          {activeTab === "planung" && (
            <div className="text-center py-8 text-gray-500">
              Planungsbereich – noch nicht implementiert.
            </div>
          )}

          {activeTab === "notizen" && (
            <div className="text-center py-8 text-gray-500">
              Notizbereich – noch nicht implementiert.
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Export</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const json = engine.exportToJson();
                    const blob = new Blob([json], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "welt-export.json";
                    a.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Als JSON exportieren
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 rounded whitespace-nowrap " +
        (active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200")
      }
    >
      {children}
    </button>
  );
}
```

## Hooks und Context

```typescript
// src/hooks/useWelt.ts

import { useState, useCallback } from "react";
import { WeltEngine } from "../engine/welt-engine";
import { PartieSave, SceneId } from "../types/world";

export function useWelt(initialKanon: any) {
  const [engine] = useState(() => new WeltEngine(initialKanon));
  const [partie, setPartie] = useState<PartieSave | null>(null);
  const [isWeltOpen, setIsWeltOpen] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<SceneId | null>(null);

  const openWelt = useCallback((sceneId?: SceneId) => {
    if (sceneId) {
      setSelectedSceneId(sceneId);
    }
    setIsWeltOpen(true);
  }, []);

  const closeWelt = useCallback(() => {
    setIsWeltOpen(false);
    setSelectedSceneId(null);
  }, []);

  const savePartie = useCallback((newPartie: PartieSave) => {
    setPartie(newPartie);
    localStorage.setItem("lindendorf-save-v1", JSON.stringify(newPartie));
  }, []);

  const loadPartie = useCallback(() => {
    const saved = localStorage.getItem("lindendorf-save-v1");
    if (saved) {
      setPartie(JSON.parse(saved));
    }
  }, []);

  return {
    engine,
    partie,
    isWeltOpen,
    selectedSceneId,
    openWelt,
    closeWelt,
    savePartie,
    loadPartie,
  };
}
```

```typescript
// src/context/WeltContext.tsx

import React, { createContext, useContext, ReactNode } from "react";
import { useWelt } from "../hooks/useWelt";

interface WeltContextValue {
  // Von useWelt zurueckgegeben
  engine: any;
  partie: any | null;
  isWeltOpen: boolean;
  selectedSceneId: string | null;
  openWelt: (sceneId?: string) => void;
  closeWelt: () => void;
  savePartie: (partie: any) => void;
  loadPartie: () => void;
}

const WeltContext = createContext<WeltContextValue | null>(null);

export function WeltProvider({ children, initialKanon }: { children: ReactNode; initialKanon: any }) {
  const welt = useWelt(initialKanon);

  return <WeltContext.Provider value={welt}>{children}</WeltContext.Provider>;
}

export function useWeltContext() {
  const context = useContext(WeltContext);
  if (!context) {
    throw new Error("useWeltContext muss innerhalb von WeltProvider verwendet werden");
  }
  return context;
}
```

## Hauptanwendung

```typescript
// src/App.tsx

import React from "react";
import { WeltProvider, useWeltContext } from "./context/WeltContext";
import { WeltWerkzeug } from "./components/welt/WeltWerkzeug";
import { initialKanon } from "./data/kanon";

function AppContent() {
  const { isWeltOpen, closeWelt, engine, partie } = useWeltContext();

  // Tastatur-Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        // Welt oeffnen wird hier ueber einen Callback geloesst
      }
      if (e.key === "Escape") {
        closeWelt();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeWelt]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hier wuerde das eigentliche Spiel kommen */}
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Lindendorf</h1>
        <p className="text-gray-600">
          Druecke Alt+S, um das Weltwerkzeug zu oeffnen.
        </p>
      </div>

      {/* Weltwerkzeug als Overlay */}
      {isWeltOpen && (
        <WeltWerkzeug
          engine={engine}
          partie={partie || undefined}
          onClose={closeWelt}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WeltProvider initialKanon={initialKanon}>
      <AppContent />
    </WeltProvider>
  );
}
```

## Beispieldaten

```typescript
// src/data/kanon.ts

import { KanonContent } from "../types/world";

export const initialKanon: KanonContent = {
  scenes: {
    "lager-hub": {
      id: "lager-hub",
      title: "Am Lagertor",
      lines: [
        "Du stehst vor dem alten Lagertor.",
        "Der Wind weht kalt durch die Mauern.",
      ],
      choices: [
        { text: "In den Hof gehen", targetSceneId: "lager-hof" },
        { text: "Zur Schmiede", targetSceneId: "lager-schmiede" },
      ],
      locationId: "lager",
      version: 1,
      author: "System",
      createdAt: Date.now(),
      status: "kanon",
    },
    "lager-hof": {
      id: "lager-hof",
      title: "Im Hof",
      lines: [
        "Der Hof ist weit und offen.",
        "Wachen patrouillieren an den Mauern.",
      ],
      choices: [
        { text: "Zurueck zum Tor", targetSceneId: "lager-hub" },
      ],
      locationId: "lager",
      version: 1,
      author: "System",
      createdAt: Date.now(),
      status: "kanon",
    },
    "lager-schmiede": {
      id: "lager-schmiede",
      title: "In der Schmiede",
      lines: [
        "Das Feuer brennt hell.",
        "Der Schmied arbeitet an einem Schwert.",
      ],
      choices: [
        { text: "Zurueck zum Hub", targetSceneId: "lager-hub" },
      ],
      locationId: "lager",
      version: 1,
      author: "System",
      createdAt: Date.now(),
      status: "kanon",
    },
  },
  quests: {},
  locations: {
    lager: {
      id: "lager",
      name: "Das Lager",
      description: "Ein altes Militaerlager.",
      sceneIds: ["lager-hub", "lager-hof", "lager-schmiede"],
    },
  },
  states: {},
  characters: {},
  tests: {},
};
```

## Index-Datei

```typescript
// src/index.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```css
/* src/index.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
}
```

## TypeScript-Konfiguration

```json
// tsconfig.json

{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

## Package.json

```json
// package.json

{
  "name": "weltwerkzeug",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## Vite-Konfiguration

```typescript
// vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

## HTML

```html
<!-- index.html -->

<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weltwerkzeug</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

## Tailwind-Konfiguration

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## PostCSS-Konfiguration

```javascript
// postcss.config.js

export default {
  plugins: {
    tailwindcss: {},
  },
}
```

## README

```markdown
# Weltwerkzeug

Ein vollstaendiges Spielleiter-Werkzeug fuer textbasierte RPGs.

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Struktur

- `src/types/world.ts` – Typdefinitionen
- `src/engine/welt-engine.ts` – Zentrale Engine
- `src/components/welt/` – React-Komponenten
- `src/hooks/useWelt.ts` – Custom Hooks
- `src/context/WeltContext.tsx` – Globaler Context
- `src/data/kanon.ts` – Beispieldaten

## Features

- Weltkarte als Graph
- Szenen-Bibliothek
- Regel-Checker
- Helden-Zeitstrahl
- Export-Funktionen
- Drei Speicherebenen: Partie, Auflage, Kanon
```
