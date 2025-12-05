
export interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  engine?: string;
  vin?: string;
  contextString?: string; // The generated system instruction for this car
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  repairGuide?: RepairGuide; // Optional structured data for repair guides
  wiringDiagram?: WiringDiagram; // Optional structured data for wiring diagrams
}

export interface RepairStep {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface RepairGuide {
  title: string;
  tools: string[];
  steps: RepairStep[];
  estimatedTime: string;
}

export interface WiringNode {
  id: string;
  type: 'power' | 'ground' | 'fuse' | 'relay' | 'switch' | 'load' | 'connector' | 'module' | 'sensor';
  label: string;
  x: number; // 0-100 Grid System
  y: number; // 0-100 Grid System
  description?: string;
}

export interface WiringConnection {
  id: string;
  from: string; // Node ID
  to: string; // Node ID
  color: string; // Wire color e.g. "Red/Blue"
  gauge?: string;
  label?: string; // Pin number or circuit ID
}

export interface WiringDiagram {
  title: string;
  nodes: WiringNode[];
  connections: WiringConnection[];
}

export interface TSB {
  id: string;
  bulletinNumber: string;
  title: string;
  summary: string;
  date: string;
  component: string;
}

export interface OBDData {
  rpm: number;
  speed: number;
  temp: number;
  voltage: number;
  dtcs: string[];
  isConnected: boolean;
}

export type ChatSessionMap = Record<string, ChatMessage[]>;

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface AudioVolume {
  input: number;
  output: number;
}
