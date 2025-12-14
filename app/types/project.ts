import { Figure } from './figure';

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
