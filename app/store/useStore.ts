import { create } from 'zustand';
import { Project, Frame, Figure } from '../types';

interface AppState {
  project: Project;
  currentFrameIndex: number;
  selectedFigureId: string | null;
  isPlaying: boolean;
  fps: number;
  interpolatingTargetIndex: number | null;
  holdThreshold: number; // 0 to 1
  interactionMode: 'rotate' | 'stretch' | 'flip';
  globalThickness: number;

  // Actions
  setGlobalThickness: (thickness: number) => void;
  setInteractionMode: (mode: 'rotate' | 'stretch' | 'flip') => void;
  setProject: (project: Project) => void;
  setProjectName: (name: string) => void;
  setProjectDescription: (description: string) => void;
  addFrame: () => void;
  setCurrentFrameIndex: (index: number) => void;
  updateFigure: (frameIndex: number, figure: Figure) => void;
  togglePlay: () => void;
  resetProject: () => void;
  checkIntegrity: () => void;
  setFps: (fps: number) => void;
  setInterpolatingTarget: (index: number | null) => void;
  setHoldThreshold: (threshold: number) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: (projectId: string) => boolean;
  getAllProjects: () => Array<{ id: string; name: string; description: string; lastModified: number }>;
  deleteProject: (projectId: string) => void;
}

const createInitialProject = (): Project => ({
  id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Untitled Project',
  description: 'A new animation project',
  frames: [
    {
      id: 'frame-1',
      figures: []
    }
  ]
});

export const useStore = create<AppState>((set, get) => ({
  project: createInitialProject(),
  currentFrameIndex: 0,
  selectedFigureId: null,
  isPlaying: false,
  fps: 10,
  interpolatingTargetIndex: null,
  holdThreshold: 0.5,
  interactionMode: 'rotate',
  globalThickness: 4,

  setGlobalThickness: (thickness) => set({ globalThickness: thickness }),
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  setProject: (project) => set({ project }),
  setProjectName: (name) => set((state) => ({ 
    project: { ...state.project, name } 
  })),
  setProjectDescription: (description) => set((state) => ({ 
    project: { ...state.project, description } 
  })),
  setFps: (fps) => set({ fps }),
  setInterpolatingTarget: (index) => set({ interpolatingTargetIndex: index }),
  setHoldThreshold: (threshold) => set({ holdThreshold: threshold }),

  saveToLocalStorage: () => {
    const state = get();
    const projects = JSON.parse(localStorage.getItem('pivotProjects') || '{}');
    projects[state.project.id] = {
      project: state.project,
      lastModified: Date.now()
    };
    localStorage.setItem('pivotProjects', JSON.stringify(projects));
  },

  loadFromLocalStorage: (projectId: string) => {
    const projects = JSON.parse(localStorage.getItem('pivotProjects') || '{}');
    if (projects[projectId]) {
      set({ 
        project: projects[projectId].project,
        currentFrameIndex: 0,
        isPlaying: false
      });
      return true;
    }
    return false;
  },

  getAllProjects: () => {
    const projects = JSON.parse(localStorage.getItem('pivotProjects') || '{}');
    return Object.entries(projects).map(([id, data]: [string, any]) => ({
      id,
      name: data.project.name,
      description: data.project.description,
      lastModified: data.lastModified
    }));
  },

  deleteProject: (projectId: string) => {
    const projects = JSON.parse(localStorage.getItem('pivotProjects') || '{}');
    delete projects[projectId];
    localStorage.setItem('pivotProjects', JSON.stringify(projects));
  },
  
  resetProject: () => set({ 
    project: createInitialProject(),
    currentFrameIndex: 0,
    isPlaying: false
  }),

  checkIntegrity: () => {
    const state = useStore.getState();
    const frames = state.project.frames;
    console.log("Checking integrity of " + frames.length + " frames...");
    
    for (let i = 0; i < frames.length; i++) {
        for (let j = i + 1; j < frames.length; j++) {
            if (frames[i] === frames[j]) {
                console.error(`CRITICAL: Frame ${i+1} and Frame ${j+1} share the same object reference!`);
            }
            if (frames[i].figures === frames[j].figures) {
                console.error(`CRITICAL: Frame ${i+1} and Frame ${j+1} share the same figures array reference!`);
            }
            if (frames[i].figures.length > 0 && frames[j].figures.length > 0) {
                if (frames[i].figures[0] === frames[j].figures[0]) {
                    console.error(`CRITICAL: Frame ${i+1} and Frame ${j+1} share the same figure object reference!`);
                }
                if (frames[i].figures[0].root_pivot === frames[j].figures[0].root_pivot) {
                    console.error(`CRITICAL: Frame ${i+1} and Frame ${j+1} share the same root pivot reference!`);
                }
            }
        }
    }
    console.log("Integrity check complete.");
  },
  
  addFrame: () => set((state) => {
    const lastFrame = state.project.frames[state.project.frames.length - 1];
    const newId = `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Adding Frame ${state.project.frames.length + 1} (Copy of Frame ${state.project.frames.length})`);
    
    const newFrame: Frame = {
      id: newId,
      // Deep copy figures for new frame
      figures: JSON.parse(JSON.stringify(lastFrame.figures))
    };
    return {
      project: {
        ...state.project,
        frames: [...state.project.frames, newFrame]
      },
      currentFrameIndex: state.project.frames.length // Move to new frame
    };
  }),

  setCurrentFrameIndex: (index) => {
    console.log(`Switching to Frame ${index + 1}`);
    set({ currentFrameIndex: index });
  },

  updateFigure: (frameIndex, figure) => set((state) => {
    console.log(`Updating Figure in Frame ${frameIndex + 1}`);
    const newFrames = [...state.project.frames];
    // Create shallow copy of the frame and figures to avoid mutation
    const frame = { ...newFrames[frameIndex] };
    frame.figures = [...frame.figures];
    
    const figureIndex = frame.figures.findIndex(f => f.id === figure.id);
    
    if (figureIndex >= 0) {
      frame.figures[figureIndex] = figure;
    } else {
      frame.figures.push(figure);
    }
    
    newFrames[frameIndex] = frame;

    return {
      project: {
        ...state.project,
        frames: newFrames
      }
    };
  }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));
