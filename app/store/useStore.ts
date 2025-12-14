import { create } from 'zustand';
import { Project, Frame, Figure, Pivot, Shape } from '@/app/types';

export type BuilderTool = 'select' | 'add-pivot' | 'connect' | 'connect-curve' | 'set-root' | 'set-joint' | 'set-fixed' | 'delete';
export type ValidationError = {
  type: 'isolated-pivot' | 'invalid-joint' | 'no-root';
  pivotId?: string;
  message: string;
};

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
  uiVisible: boolean; // New state
  editorMode: 'anime' | 'figure'; // New state
  
  // Builder state
  builderFigure: Figure | null;
  builderTool: BuilderTool;
  selectedPivotIds: string[];
  builderShapeType: 'line' | 'circle' | 'polygon' | 'curve';
  validationErrors: ValidationError[];
  builderRootPivotId: string | null;
  connectingPivots: string[]; // For connect mode - stores sequence of pivots being connected

  // Actions
  setEditorMode: (mode: 'anime' | 'figure') => void;
  toggleUiVisible: () => void; // New action
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
  
  // Builder actions
  initBuilderFigure: () => void;
  setBuilderTool: (tool: BuilderTool) => void;
  addBuilderPivot: (x: number, y: number, parentId?: string) => void;
  removeBuilderPivot: (pivotId: string) => void;
  moveBuilderPivot: (pivotId: string, x: number, y: number) => void;
  togglePivotSelection: (pivotId: string) => void;
  clearPivotSelection: () => void;
  setBuilderShapeType: (type: 'line' | 'circle' | 'polygon' | 'curve') => void;
  addBuilderShape: () => void;
  removeBuilderShape: (shapeIndex: number) => void;
  setBuilderPivotType: (pivotId: string, type: 'joint' | 'fixed') => void;
  setBuilderRootPivot: (pivotId: string) => void;
  setBuilderFigureColor: (color: string) => void;
  setBuilderFigureThickness: (thickness: number) => void;
  validateBuilderFigure: () => void;
  resetBuilderFigure: () => void;
  addConnectingPivot: (pivotId: string) => void;
  clearConnectingPivots: () => void;
  createLineFromConnecting: () => void;
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
  uiVisible: true,
  editorMode: 'anime',
  
  // Builder state initialization
  builderFigure: null,
  builderTool: 'select',
  selectedPivotIds: [],
  builderShapeType: 'line',
  validationErrors: [],
  builderRootPivotId: null,
  connectingPivots: [],

  setEditorMode: (mode) => set({ editorMode: mode }),
  toggleUiVisible: () => set((state) => ({ uiVisible: !state.uiVisible })),
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

    // Auto-save after adding frame
    setTimeout(() => {
      const currentState = useStore.getState();
      currentState.saveToLocalStorage();
    }, 300);

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

    // Auto-save after updating figure (debounced)
    setTimeout(() => {
      const currentState = useStore.getState();
      currentState.saveToLocalStorage();
    }, 500);

    return {
      project: {
        ...state.project,
        frames: newFrames
      }
    };
  }),

  togglePlay: () => set((state) => {
    // Auto-save when toggling play
    const newState = { isPlaying: !state.isPlaying };
    setTimeout(() => {
      const currentState = useStore.getState();
      currentState.saveToLocalStorage();
    }, 0);
    return newState;
  }),
  
  // Builder actions
  initBuilderFigure: () => {
    const initialPivotId = `pivot-${Date.now()}`;
    const initialState = {
      builderFigure: {
        id: `figure-${Date.now()}`,
        pivots: [
          {
            id: initialPivotId,
            type: 'fixed' as const,
            x: 640,
            y: 360
          }
        ],
        parentMap: {
          [initialPivotId]: null
        },
        shapes: [],
        color: '#000000',
        opacity: 1,
        thickness: 4
      },
      builderRootPivotId: initialPivotId,
      selectedPivotIds: [],
      validationErrors: []
    };
    
    set(initialState);
    setTimeout(() => useStore.getState().validateBuilderFigure(), 0);
  },
  
  setBuilderTool: (tool) => set({ builderTool: tool, connectingPivots: [] }),
  
  addBuilderPivot: (x, y, parentId) => set((state) => {
    if (!state.builderFigure) return state;
    
    const newPivotId = `pivot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    
    figure.pivots.push({
      id: newPivotId,
      type: 'joint',
      x,
      y
    });
    
    figure.parentMap[newPivotId] = parentId || null;
    
    const newState = { builderFigure: figure };
    setTimeout(() => useStore.getState().validateBuilderFigure(), 0);
    return newState;
  }),
  
  removeBuilderPivot: (pivotId) => set((state) => {
    if (!state.builderFigure || pivotId === state.builderRootPivotId) return state;
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    
    // Remove pivot from list
    figure.pivots = figure.pivots.filter(p => p.id !== pivotId);
    
    // Remove from parentMap and update children's parent
    const parentId = figure.parentMap[pivotId];
    delete figure.parentMap[pivotId];
    
    // Reparent children to this pivot's parent
    Object.entries(figure.parentMap).forEach(([childId, childParent]) => {
      if (childParent === pivotId) {
        figure.parentMap[childId] = parentId;
      }
    });
    
    // Remove shapes containing this pivot
    figure.shapes = figure.shapes.filter(shape => !shape.pivotIds.includes(pivotId));
    
    const newState = {
      builderFigure: figure,
      selectedPivotIds: state.selectedPivotIds.filter(id => id !== pivotId)
    };
    setTimeout(() => useStore.getState().validateBuilderFigure(), 0);
    return newState;
  }),
  
  togglePivotSelection: (pivotId) => set((state) => {
    const isSelected = state.selectedPivotIds.includes(pivotId);
    return {
      selectedPivotIds: isSelected
        ? state.selectedPivotIds.filter(id => id !== pivotId)
        : [...state.selectedPivotIds, pivotId]
    };
  }),
  
  clearPivotSelection: () => set({ selectedPivotIds: [] }),
  
  moveBuilderPivot: (pivotId: string, x: number, y: number) => set((state) => {
    if (!state.builderFigure) return state;
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    
    const pivot = figure.pivots.find(p => p.id === pivotId);
    if (pivot) {
      pivot.x = x;
      pivot.y = y;
    }
    
    return { builderFigure: figure };
  }),
  
  setBuilderShapeType: (type) => set({ builderShapeType: type }),
  
  addBuilderShape: () => set((state) => {
    if (!state.builderFigure || state.selectedPivotIds.length < 2) return state;
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    
    const newShape: Shape = {
      type: state.builderShapeType,
      pivotIds: [...state.selectedPivotIds]
    };
    
    figure.shapes.push(newShape);
    
    const newState = {
      builderFigure: figure,
      selectedPivotIds: []
    };
    setTimeout(() => useStore.getState().validateBuilderFigure(), 0);
    return newState;
  }),
  
  removeBuilderShape: (shapeIndex) => set((state) => {
    if (!state.builderFigure) return state;
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    figure.shapes.splice(shapeIndex, 1);
    
    return { builderFigure: figure };
  }),
  
  setBuilderPivotType: (pivotId, type) => set((state) => {
    if (!state.builderFigure) return state;
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    const pivot = figure.pivots.find(p => p.id === pivotId);
    if (pivot) {
      pivot.type = type;
    }
    
    return { builderFigure: figure };
  }),
  
  setBuilderRootPivot: (pivotId) => set((state) => {
    if (!state.builderFigure) return state;

    // Toggle behavior
    if (state.builderRootPivotId === pivotId) {
      return { builderRootPivotId: null };
    }

    // Check if pivot exists
    const exists = state.builderFigure.pivots.some(p => p.id === pivotId);
    if (!exists) return state;

    setTimeout(() => useStore.getState().validateBuilderFigure(), 0);
    return { builderRootPivotId: pivotId };
  }),
  
  setBuilderFigureColor: (color) => set((state) => {
    if (!state.builderFigure) return state;
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    figure.color = color;
    return { builderFigure: figure };
  }),
  
  setBuilderFigureThickness: (thickness) => set((state) => {
    if (!state.builderFigure) return state;
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    figure.thickness = thickness;
    return { builderFigure: figure };
  }),
  
  validateBuilderFigure: () => set((state) => {
    if (!state.builderFigure) return { validationErrors: [] };
    
    const errors: ValidationError[] = [];
    const figure = state.builderFigure;
    
    // Check if root pivot is designated
    if (!state.builderRootPivotId) {
      errors.push({
        type: 'no-root',
        message: '루트 피봇을 지정해주세요 (Set Root 사용)'
      });
    }
    
    // Check if at least one shape exists
    if (figure.shapes.length === 0) {
      errors.push({
        type: 'isolated-pivot',
        message: '최소 1개 이상의 도형을 만들어야 합니다'
      });
    }
    
    // Check for isolated pivots (not in any shape)
    const pivotsInShapes = new Set<string>();
    figure.shapes.forEach(shape => {
      shape.pivotIds.forEach(id => pivotsInShapes.add(id));
    });
    
    figure.pivots.forEach(pivot => {
      if (!pivotsInShapes.has(pivot.id)) {
        errors.push({
          type: 'isolated-pivot',
          pivotId: pivot.id,
          message: `피봇 ${pivot.id} 이(가) 어떤 도형과도 연결되지 않았습니다`
        });
      }
    });

    // Check that all pivots used in shapes form a single connected component
    if (pivotsInShapes.size > 0) {
      const adj = new Map<string, Set<string>>();
      const addEdge = (a: string, b: string) => {
        if (!adj.has(a)) adj.set(a, new Set());
        if (!adj.has(b)) adj.set(b, new Set());
        adj.get(a)!.add(b);
        adj.get(b)!.add(a);
      };

      figure.shapes.forEach(shape => {
        const ids = shape.pivotIds;
        if (shape.type === 'line' && ids.length >= 2) {
          addEdge(ids[0], ids[1]);
        } else if (shape.type === 'curve' && ids.length >= 3) {
          addEdge(ids[0], ids[1]);
          addEdge(ids[1], ids[2]);
        } else if (shape.type === 'polygon' && ids.length >= 2) {
          for (let i = 0; i < ids.length; i++) {
            const a = ids[i];
            const b = ids[(i + 1) % ids.length];
            addEdge(a, b);
          }
        }
      });

      const start = Array.from(pivotsInShapes)[0];
      const visited = new Set<string>();
      const dfs = (id: string) => {
        if (visited.has(id)) return;
        visited.add(id);
        adj.get(id)?.forEach(dfs);
      };
      dfs(start);

      pivotsInShapes.forEach(id => {
        if (!visited.has(id)) {
          errors.push({
            type: 'isolated-pivot',
            pivotId: id,
            message: '모든 선이 하나로 이어지도록 연결해야 합니다'
          });
        }
      });
    }
    
    // Check for triangles with joint pivots (invalid rigid structure)
    figure.shapes.forEach(shape => {
      if (shape.type === 'polygon' && shape.pivotIds.length === 3) {
        const hasJoint = shape.pivotIds.some(id => {
          const pivot = figure.pivots.find(p => p.id === id);
          return pivot?.type === 'joint';
        });
        if (hasJoint) {
          errors.push({
            type: 'invalid-joint',
            message: '삼각형에는 joint 피봇을 사용할 수 없습니다 (모두 fixed여야 합니다)'
          });
        }
      }
    });
    
    return { validationErrors: errors };
  }),
  
  resetBuilderFigure: () => set({
    builderFigure: null,
    selectedPivotIds: [],
    validationErrors: [],
    builderRootPivotId: null,
    connectingPivots: []
  }),
  
  addConnectingPivot: (pivotId) => set((state) => ({
    connectingPivots: [...state.connectingPivots, pivotId]
  })),
  
  clearConnectingPivots: () => set({ connectingPivots: [] }),
  
  createLineFromConnecting: () => set((state) => {
    if (!state.builderFigure) return state;

    const mode = state.builderTool === 'connect-curve' ? 'curve' : 'line';
    const need = mode === 'curve' ? 3 : 2;
    if (state.connectingPivots.length < need) return state;
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    const pivots = state.connectingPivots.slice(0, need);

    const newShape: Shape = mode === 'curve'
      ? { type: 'curve', pivotIds: pivots }
      : { type: 'line', pivotIds: pivots.slice(0, 2) };
    
    figure.shapes.push(newShape);
    
    const newState = {
      builderFigure: figure,
      connectingPivots: [] // Clear after creating
    };
    setTimeout(() => useStore.getState().validateBuilderFigure(), 0);
    return newState;
  }),
}));
