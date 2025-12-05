export interface Pivot {
  id: string;
  type: 'joint' | 'fixed';
  x: number;
  y: number;
  children: Pivot[];
}

export interface Figure {
  id: string;
  root_pivot: Pivot;
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
