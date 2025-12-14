import { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { Pivot } from '@/app/types';

export const useInteraction = (svgRef: React.RefObject<SVGSVGElement | null>) => {
  const { updateFigure, currentFrameIndex, project, interactionMode, isPlaying } = useStore();
  const [draggingPivotId, setDraggingPivotId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pickerState, setPickerState] = useState<{ isOpen: boolean; figureId: string | null }>({ isOpen: false, figureId: null });

  const handleMouseDown = (e: React.MouseEvent, pivot: Pivot, figureId: string, isRoot: boolean) => {
    if (isPlaying || pivot.hidden) return;
    e.stopPropagation();

    // Stretch Mode: Root click opens picker
    if (interactionMode === 'stretch' && isRoot) {
        setPickerState({ isOpen: true, figureId });
    }

    // Flip Mode Logic
    if (interactionMode === 'flip') {
       // Allow ANY pivot click to trigger flip
       const frame = project.frames[currentFrameIndex];
       const figure = frame.figures.find(f => f.id === figureId);
       if (figure) {
           const newFigure = JSON.parse(JSON.stringify(figure));
           // Mirror logic: Flip X coordinates relative to root
           const rootX = newFigure.root_pivot.x;
           
           const flipRecursive = (p: Pivot) => {
               p.x = rootX - (p.x - rootX);
               p.children?.forEach(flipRecursive);
           };
           
           // Flip children, root stays (or effectively flips in place)
           newFigure.root_pivot.children?.forEach(flipRecursive);
           updateFigure(currentFrameIndex, newFigure);
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
            if (root.children?.some(c => c.id === targetId)) return root;
            for (const child of root.children || []) {
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
                    if (p.id === figureClone.root_pivot.id) {
                        p.x = targetX;
                        p.y = targetY;
                        const moveChildren = (parent: Pivot) => {
                            for (const child of parent.children || []) {
                                child.x += dx;
                                child.y += dy;
                                moveChildren(child);
                            }
                        };
                        moveChildren(p);
                    } else {
                        const parent = findParent(figureClone.root_pivot, p.id);
                        if (parent) {
                            // 1. Find the Effective Pivot (Nearest Joint)
                            let effectivePivot: Pivot | null = parent;
                            let ancestor = p; // The node we will rotate (child of effectivePivot)
                            let pivot = parent; // The effective pivot
                            
                            // Traverse up - find the proper joint to rotate around
                            while (effectivePivot && effectivePivot.type === 'fixed' && effectivePivot.id !== figureClone.root_pivot.id) {
                                const nextParent = findParent(figureClone.root_pivot, effectivePivot.id);
                                if (!nextParent) break;
                                ancestor = effectivePivot;
                                effectivePivot = nextParent;
                                pivot = nextParent;
                            }
                            
                            if (effectivePivot) {
                                const currentAngle = Math.atan2(p.y - effectivePivot.y, p.x - effectivePivot.x);
                                const targetAngle = Math.atan2(targetY - effectivePivot.y, targetX - effectivePivot.x);
                                const deltaAngle = targetAngle - currentAngle;
                                
                                const rotatePoint = (point: Pivot, center: Pivot, angle: number) => {
                                    const cos = Math.cos(angle);
                                    const sin = Math.sin(angle);
                                    const dx = point.x - center.x;
                                    const dy = point.y - center.y;
                                    point.x = center.x + dx * cos - dy * sin;
                                    point.y = center.y + dx * sin + dy * cos;
                                };

                                // Define rotateChildren inside this scope to be usable by all blocks
                                const rotateChildren = (subRoot: Pivot, center: Pivot, angle: number) => {
                                    for (const child of subRoot.children || []) {
                                        rotatePoint(child, center, angle);
                                        rotateChildren(child, center, angle);
                                    }
                                };
                                
                                // Standard Rotation (move p around immediate parent)
                                // We do this first so 'p' tries to follow the mouse immediately.
                                rotatePoint(p, parent, deltaAngle);
                                rotateChildren(p, parent, deltaAngle);

                                // Robust Rigid Group Rotation Logic
                                if (pivot.id !== parent.id) {
                                     // Case: Chained Fixed Nodes (e.g. Tip of a Wing)
                                     // The logic above moved 'p' relative to its immediate fixed parent.
                                     // But likely the user wants the WHOLE rigid structure (wing) to rotate around the Joint (pivot).
                                     
                                     // 1. Undo the local rotation to reset 'p' and its children
                                     rotatePoint(p, parent, -deltaAngle);
                                     rotateChildren(p, parent, -deltaAngle);
                                     
                                     // 2. Calculate Angle for the GROUP around PIVOT
                                     // We want 'p' to reach the Mouse Target, but rotating around PIVOT.
                                     const angleNow = Math.atan2(p.y - pivot.y, p.x - pivot.x);
                                     const angleTarget = Math.atan2(targetY - pivot.y, targetX - pivot.x);
                                     const groupDelta = angleTarget - angleNow;
                                     
                                     // 3. Rotate 'ancestor' (the root of this fixed chain attached to Pivot)
                                     // This moves 'ancestor' and, via recursion, 'p'.
                                     rotatePoint(ancestor, pivot, groupDelta);
                                     rotateChildren(ancestor, pivot, groupDelta);

                                     // 4. CRITICAL: Rotate ALL OTHER Fixed siblings of 'ancestor'.
                                     // This ensures that if the object is branching (Hand with fingers),
                                     // dragging one finger rotates the whole hand.
                                     pivot.children?.forEach(sibling => {
                                        if (sibling.id !== ancestor.id && sibling.type === 'fixed') {
                                            rotatePoint(sibling, pivot, groupDelta);
                                            rotateChildren(sibling, pivot, groupDelta);
                                        }
                                     });
                                } else {
                                     // Case: Sibling Fixed Nodes (e.g. Decorations on a bone, or Fan shape)
                                     // 'parent' IS 'pivot'. 'p' moved correctly around 'pivot'.
                                     // We just need to ensure other Fixed siblings move WITH 'p'.
                                     const isDraggedFixed = p.type === 'fixed';
                                     if (isDraggedFixed) {
                                         pivot.children?.forEach(sibling => {
                                            // Rotate siblings that are also Fixed (Rigid Group)
                                            if (sibling.id !== p.id && sibling.type === 'fixed') {
                                                rotatePoint(sibling, pivot, deltaAngle);
                                                rotateChildren(sibling, pivot, deltaAngle);
                                            }
                                         });
                                     }
                                }
                                
                                // Case: Dragging a Joint moves its Fixed Decorations
                                if (p.type === 'joint') {
                                    pivot.children?.forEach(sibling => {
                                        if (sibling.id !== p.id && sibling.type === 'fixed') {
                                            rotatePoint(sibling, pivot, deltaAngle);
                                            rotateChildren(sibling, pivot, deltaAngle);
                                        }
                                    });
                                }
                            }
                        }
                    }
                } else if (interactionMode === 'stretch') {
                    if (p.id === figureClone.root_pivot.id) {
                        p.x = targetX;
                        p.y = targetY;
                        const moveChildren = (parent: Pivot) => {
                            for (const child of parent.children || []) {
                                child.x += dx;
                                child.y += dy;
                                moveChildren(child);
                            }
                        };
                        moveChildren(p);
                    } else {
                        p.x = targetX;
                        p.y = targetY;
                    }
                }

                return true;
            }
            for (const child of p.children || []) {
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
