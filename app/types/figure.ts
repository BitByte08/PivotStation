export type ShapeType = 'line' | 'circle' | 'polygon' | 'curve';

export interface Shape {
  type: ShapeType;
  color?: string;
  pivotIds: string[];
}

export interface Pivot {
  id: string;
  type: 'joint' | 'fixed';
  x: number;
  y: number;
  customColor?: string;
  hidden?: boolean;
}

export interface Figure {
  id: string;
  pivots: Pivot[];           // Flat list of all pivots
  parentMap: Record<string, string | null>;  // pivotId -> parentId (null means top-level)
  shapes: Shape[];
  color?: string;
  opacity?: number;
  thickness?: number;
  root_pivot?: any;          // Deprecated, kept for backward compat
}

// Helper functions for figure operations
export const createEmptyFigure = (id: string): Figure => ({
  id,
  pivots: [
    {
      id: `pivot-${Date.now()}`,
      type: 'fixed',
      x: 0,
      y: 0,
    }
  ],
  parentMap: {
    [`pivot-${Date.now()}`]: null
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
