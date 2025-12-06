export type ShapeType = 'line' | 'circle' | 'polygon' | 'curve';

export interface Shape {
  type: ShapeType;
  color?: string;
  // For circle: radius or diameter defined by pivots?
  // For polygon: list of pivot IDs to connect
  // For curve: 3 pivot IDs (start, control, end)
  pivotIds: string[]; 
}

export interface Pivot {
  id: string;
  type: 'joint' | 'fixed';
  x: number;
  y: number;
  children: Pivot[];
  // Visual properties can be determined by mode, but we might need to store custom colors if the user picks them
  customColor?: string; 
  hidden?: boolean; // If true, this pivot is not selectable/visible
}

export interface Figure {
  id: string;
  root_pivot: Pivot;
  shapes: Shape[]; // New: Shapes defined by pivots
  color?: string; // Global figure color
  opacity?: number; // Global figure opacity
}

export interface Frame {
  id: string;
  figures: Figure[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  frames: Frame[];
}
