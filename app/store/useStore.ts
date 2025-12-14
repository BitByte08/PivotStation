import { create } from 'zustand';
import { Project, Frame, Figure, Pivot, Shape } from '@/app/types';

export type BuilderTool = 'select' | 'add-pivot' | 'connect' | 'set-root' | 'set-joint' | 'set-fixed';
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
  validateBuilderFigure: () => void;
  saveBuilderFigure: (name: string) => void;
  loadBuilderFigure: (figureId: string) => void;
  exportBuilderFigure: (name: string) => void;
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
  
  // Builder actions
  initBuilderFigure: () => set({
    builderFigure: {
      id: `figure-${Date.now()}`,
      // Wrapper root to allow multiple top-level roots (forest)
      root_pivot: {
        id: 'root-container',
        type: 'fixed',
        x: 640,
        y: 360,
        children: []
      },
      shapes: [],
      color: '#000000',
      opacity: 1,
      thickness: 4
    },
    builderRootPivotId: 'root-container',
    selectedPivotIds: [],
    validationErrors: []
  }),
  
  setBuilderTool: (tool) => set({ builderTool: tool }),
  
  addBuilderPivot: (x, y, parentId) => set((state) => {
    if (!state.builderFigure) return state;
    
    const newPivot: Pivot = {
      id: `pivot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'joint',
      x,
      y,
      children: []
    };
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    
    if (parentId) {
      // Find parent and add as child
      const findAndAddChild = (pivot: Pivot): boolean => {
        if (pivot.id === parentId) {
          pivot.children.push(newPivot);
          return true;
        }
        for (const child of pivot.children) {
          if (findAndAddChild(child)) return true;
        }
        return false;
      };
      findAndAddChild(figure.root_pivot);
    } else {
      // Add as child of root
      figure.root_pivot.children.push(newPivot);
    }
    
    return { builderFigure: figure };
  }),
  
  removeBuilderPivot: (pivotId) => set((state) => {
    if (!state.builderFigure || pivotId === state.builderRootPivotId) return state;
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    
    // Remove pivot from hierarchy
    const removeFromHierarchy = (pivot: Pivot): boolean => {
      pivot.children = pivot.children.filter(child => {
        if (child.id === pivotId) return false;
        removeFromHierarchy(child);
        return true;
      });
      return true;
    };
    removeFromHierarchy(figure.root_pivot);
    
    // Remove shapes containing this pivot
    figure.shapes = figure.shapes.filter(shape => !shape.pivotIds.includes(pivotId));
    
    return {
      builderFigure: figure,
      selectedPivotIds: state.selectedPivotIds.filter(id => id !== pivotId)
    };
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
    
    // Find and update pivot position
    const movePivot = (pivot: Pivot): boolean => {
      if (pivot.id === pivotId) {
        pivot.x = x;
        pivot.y = y;
        return true;
      }
      for (const child of pivot.children) {
        if (movePivot(child)) return true;
      }
      return false;
    };
    
    movePivot(figure.root_pivot);
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
    
    return {
      builderFigure: figure,
      selectedPivotIds: []
    };
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
    
    const updatePivotType = (pivot: Pivot): boolean => {
      if (pivot.id === pivotId) {
        pivot.type = type;
        return true;
      }
      for (const child of pivot.children) {
        if (updatePivotType(child)) return true;
      }
      return false;
    };
    updatePivotType(figure.root_pivot);
    
    return { builderFigure: figure };
  }),
  
  setBuilderRootPivot: (pivotId) => set((state) => {
    if (!state.builderFigure) return state;

    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    const container = figure.root_pivot;

    // Find pivot and its parent within the forest
    let target: Pivot | null = null;
    let parent: Pivot | null = null;
    const walk = (p: Pivot, par: Pivot | null = null) => {
      if (p.id === pivotId) {
        target = p;
        parent = par;
        return;
      }
      p.children.forEach((child) => {
        if (!target) walk(child, p);
      });
    };

    container.children.forEach((rootChild) => {
      if (!target) walk(rootChild, container);
    });

    if (!target || !parent) return state; // not found or already top-level

    // Detach target from its parent
    const parentPivot: Pivot = parent;
    parentPivot.children = parentPivot.children.filter((c) => c.id !== pivotId);

    // Add target as a new top-level root under the container
    if (container.children.every((c) => c.id !== target!.id)) {
      container.children.push(target);
    }

    return { builderFigure: figure };
  }),
  
  validateBuilderFigure: () => set((state) => {
    if (!state.builderFigure) return { validationErrors: [] };
    
    const errors: ValidationError[] = [];
    const figure = state.builderFigure;
    
    // Collect all pivot IDs
    const allPivotIds = new Set<string>();
    const collectPivots = (pivot: Pivot) => {
      allPivotIds.add(pivot.id);
      pivot.children.forEach(collectPivots);
    };
    collectPivots(figure.root_pivot);
    
    // Check for isolated pivots (not in any shape)
    const pivotsInShapes = new Set<string>();
    figure.shapes.forEach(shape => {
      shape.pivotIds.forEach(id => pivotsInShapes.add(id));
    });
    
    allPivotIds.forEach(pivotId => {
      if (!pivotsInShapes.has(pivotId) && pivotId !== figure.root_pivot.id) {
        errors.push({
          type: 'isolated-pivot',
          pivotId,
          message: `Pivot ${pivotId} is not connected to any shape`
        });
      }
    });
    
    // Check for triangles with joint pivots (invalid rigid structure)
    figure.shapes.forEach(shape => {
      if (shape.type === 'polygon' && shape.pivotIds.length === 3) {
        const findPivotType = (id: string): 'joint' | 'fixed' | null => {
          let foundType: 'joint' | 'fixed' | null = null;
          const search = (pivot: Pivot): void => {
            if (pivot.id === id) {
              foundType = pivot.type;
              return;
            }
            pivot.children.forEach(search);
          };
          search(figure.root_pivot);
          return foundType;
        };
        
        const hasJoint = shape.pivotIds.some(id => findPivotType(id) === 'joint');
        if (hasJoint) {
          errors.push({
            type: 'invalid-joint',
            message: `Triangle shape cannot have joint pivots (must be all fixed for rigid structure)`
          });
        }
      }
    });
    
    return { validationErrors: errors };
  }),
  
  saveBuilderFigure: (name) => set((state) => {
    if (!state.builderFigure) return state;
    
    const customFigures = JSON.parse(localStorage.getItem('customFigures') || '{}');
    const figureId = `custom-${Date.now()}`;
    
    customFigures[figureId] = {
      id: figureId,
      name,
      figure: state.builderFigure,
      createdAt: Date.now()
    };
    
    localStorage.setItem('customFigures', JSON.stringify(customFigures));
    
    return state;
  }),
  
  loadBuilderFigure: (figureId) => set(() => {
    const customFigures = JSON.parse(localStorage.getItem('customFigures') || '{}');
    
    if (customFigures[figureId]) {
      return {
        builderFigure: JSON.parse(JSON.stringify(customFigures[figureId].figure)),
        selectedPivotIds: [],
        validationErrors: []
      };
    }
    
    return {};
  }),
  
  exportBuilderFigure: (name) => {
    const state = get();
    if (!state.builderFigure) return;
    
    const dataStr = "data:text/json;charset=utf-8," + 
                    encodeURIComponent(JSON.stringify(state.builderFigure, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${name}.psfigure`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },
  
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
    if (!state.builderFigure || state.connectingPivots.length < 2) return state;
    
    const figure = JSON.parse(JSON.stringify(state.builderFigure)) as Figure;
    
    // Create a line shape connecting the two pivots
    const newShape: Shape = {
      type: 'line',
      pivotIds: [state.connectingPivots[0], state.connectingPivots[1]]
    };
    
    figure.shapes.push(newShape);
    
    return {
      builderFigure: figure,
      connectingPivots: [] // Clear after creating
    };
  }),
}));
