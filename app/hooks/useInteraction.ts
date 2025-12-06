import { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { Pivot } from '@/app/types';

export const useInteraction = (svgRef: React.RefObject<SVGSVGElement | null>) => {
  const { updateFigure, currentFrameIndex, project, interactionMode, isPlaying } = useStore();
  const [draggingPivotId, setDraggingPivotId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pickerState, setPickerState] = useState<{ isOpen: boolean; figureId: string | null }>({ isOpen: false, figureId: null });

  const handleMouseDown = (e: React.MouseEvent, pivot: Pivot, figureId: string) => {
    if (isPlaying) return;
    e.stopPropagation();

    // Stretch Mode: Root click opens picker
    if (interactionMode === 'stretch' && pivot.id.includes('root')) {
        setPickerState({ isOpen: true, figureId });
    }

    // Flip Mode Logic
    if (interactionMode === 'flip') {
      if (pivot.id.includes('root')) { // Only root pivot triggers flip
         const frame = project.frames[currentFrameIndex];
         const figure = frame.figures.find(f => f.id === figureId);
         if (figure) {
             const newFigure = JSON.parse(JSON.stringify(figure));
             // Mirror logic: Flip X coordinates relative to root
             const rootX = newFigure.root_pivot.x;
             
             const flipRecursive = (p: Pivot) => {
                 p.x = rootX - (p.x - rootX);
                 p.children.forEach(flipRecursive);
             };
             
             // Flip children, root stays (or effectively flips in place)
             newFigure.root_pivot.children.forEach(flipRecursive);
             updateFigure(currentFrameIndex, newFigure);
         }
      }
      return;
    }

    setDraggingPivotId(pivot.id);
    
    if (svgRef.current) {
        const CTM = svgRef.current.getScreenCTM();
        if (CTM) {
            const mouseX = (e.clientX - CTM.e) / CTM.a;
            const mouseY = (e.clientY - CTM.f) / CTM.d;
            setDragOffset({ x: mouseX - pivot.x, y: mouseY - pivot.y });
        }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingPivotId || isPlaying || !svgRef.current) return;

    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;

    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;
    
    const targetX = mouseX - dragOffset.x;
    const targetY = mouseY - dragOffset.y;

    const frame = project.frames[currentFrameIndex];
    const newFigures = [...frame.figures];
    
    for (let i = 0; i < newFigures.length; i++) {
        const figure = newFigures[i];
        const figureClone = JSON.parse(JSON.stringify(figure));
        
        // Helper to find parent of a pivot
        const findParent = (root: Pivot, targetId: string): Pivot | null => {
            if (root.children.some(c => c.id === targetId)) return root;
            for (const child of root.children) {
                const found = findParent(child, targetId);
                if (found) return found;
            }
            return null;
        };

        const updatePivotRecursive = (p: Pivot): boolean => {
            if (p.id === draggingPivotId) {
                const dx = targetX - p.x;
                const dy = targetY - p.y;
                
                if (interactionMode === 'rotate') {
                    // Rotate Mode:
                    // If root, move entire figure.
                    // If child, rotate around parent, keeping length constant.
                    
                    if (p.id === figureClone.root_pivot.id) {
                        // Move root and all children
                        p.x = targetX;
                        p.y = targetY;
                        const moveChildren = (parent: Pivot) => {
                            for (const child of parent.children) {
                                child.x += dx;
                                child.y += dy;
                                moveChildren(child);
                            }
                        };
                        moveChildren(p);
                    } else {
                        // Find parent to rotate around
                        const parent = findParent(figureClone.root_pivot, p.id);
                        if (parent) {
                            // Calculate angle and distance
                            const angle = Math.atan2(targetY - parent.y, targetX - parent.x);
                            const currentDist = Math.sqrt(Math.pow(p.x - parent.x, 2) + Math.pow(p.y - parent.y, 2));
                            
                            // New position based on angle and FIXED distance
                            const newX = parent.x + Math.cos(angle) * currentDist;
                            const newY = parent.y + Math.sin(angle) * currentDist;
                            
                            // Calculate actual delta for children
                            const actualDx = newX - p.x;
                            const actualDy = newY - p.y;
                            
                            p.x = newX;
                            p.y = newY;
                            
                            // Rotate children (move them by the same delta)
                            // Note: This is a simplified rotation where children just translate. 
                            // For true rigid body rotation, children should rotate around this pivot.
                            // But for "Stickman" logic, usually we just move the joint and children follow.
                            const moveChildren = (parent: Pivot) => {
                                for (const child of parent.children) {
                                    child.x += actualDx;
                                    child.y += actualDy;
                                    moveChildren(child);
                                }
                            };
                            moveChildren(p);
                        }
                    }
                } else if (interactionMode === 'stretch') {
                    // Stretch Mode:
                    // If root, move entire figure (same as rotate).
                    // If child, move freely (changing length).
                    
                    if (p.id === figureClone.root_pivot.id) {
                         // Move root and all children
                        p.x = targetX;
                        p.y = targetY;
                        const moveChildren = (parent: Pivot) => {
                            for (const child of parent.children) {
                                child.x += dx;
                                child.y += dy;
                                moveChildren(child);
                            }
                        };
                        moveChildren(p);
                    } else {
                        // Move freely
                        p.x = targetX;
                        p.y = targetY;
                        
                        // Move children by same delta
                        const moveChildren = (parent: Pivot) => {
                            for (const child of parent.children) {
                                child.x += dx;
                                child.y += dy;
                                moveChildren(child);
                            }
                        };
                        moveChildren(p);
                    }
                }

                return true;
            }
            for (const child of p.children) {
                if (updatePivotRecursive(child)) return true;
            }
            return false;
        };

        if (updatePivotRecursive(figureClone.root_pivot)) {
            updateFigure(currentFrameIndex, figureClone);
            break;
        }
    }
  };

  const handleMouseUp = () => {
    setDraggingPivotId(null);
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    draggingPivotId,
    pickerState,
    setPickerState
  };
};
