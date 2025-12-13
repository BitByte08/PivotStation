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
  thickness?: number; // Global stick thickness
}

// Helper functions for figure operations
export const createEmptyFigure = (id: string): Figure => ({
  id,
  root_pivot: {
    id: 'root',
    type: 'fixed',
    x: 0,
    y: 0,
    children: [],
  },
  shapes: [],
  color: '#000000',
  opacity: 1,
  thickness: 4,
});

export const createPivot = (
  id: string,
  x: number,
  y: number,
  type: 'joint' | 'fixed' = 'joint'
): Pivot => ({
  id,
  type,
  x,
  y,
  children: [],
});

export const cloneFigure = (figure: Figure): Figure =>
  JSON.parse(JSON.stringify(figure));
