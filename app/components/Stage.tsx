'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useStore } from '@/app/store/useStore';
import { useInteraction } from '@/app/hooks/useInteraction';
import { useFigureRender } from '@/app/hooks/useFigureRender';
import { useDragToDelete } from '@/app/hooks/useDragToDelete';
import FigureSettings from '@/app/components/FigureSettings';
import { Pivot } from '@/app/types/figure';

export default function Stage() {
  const { 
    project, 
    currentFrameIndex, 
    isPlaying, 
    setCurrentFrameIndex,
    editorMode,
    builderFigure,
    builderTool,
    selectedPivotIds,
    builderRootPivotId,
    addBuilderPivot,
    togglePivotSelection,
    setBuilderPivotType,
    setBuilderRootPivot,
    moveBuilderPivot,
    connectingPivots,
    addConnectingPivot,
    clearConnectingPivots,
    createLineFromConnecting
  } = useStore();
  const [interpolatedFrame, setInterpolatedFrame] = useState(project.frames[currentFrameIndex]);
  const svgRef = useRef<SVGSVGElement>(null);
  const wasmRef = useRef<any>(null);

  const { handleMouseDown, handleMouseMove, handleMouseUp, draggingPivotId, pickerState, setPickerState } = useInteraction(svgRef);
  // Builder mode drag state (separate from animation drag)
  const [builderDraggingPivotId, setBuilderDraggingPivotId] = useState<string | null>(null);
  const [builderDragOffset, setBuilderDragOffset] = useState({ x: 0, y: 0 });
  const { renderFigure } = useFigureRender();
  const { isOverDeleteZone, handleMouseMove: handleDeleteMouseMove, handleMouseUp: handleDeleteMouseUp } = useDragToDelete();

  // Load Wasm once
  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasmModule = await import('wasm');
        await wasmModule.default();
        wasmRef.current = wasmModule;
      } catch (error) {
        console.error("Failed to load Wasm:", error);
      }
    };
    loadWasm();
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setInterpolatedFrame(project.frames[currentFrameIndex]);
      useStore.getState().setInterpolatingTarget(null);
      return;
    }

    let animationFrameId: number;
    let startTime: number | undefined;

    const animate = (time: number) => {
      if (startTime === undefined) startTime = time;
      const fps = Math.max(1, useStore.getState().fps || 10);
      const duration = 1000 / fps;
      const elapsed = time - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      const holdThreshold = useStore.getState().holdThreshold;
      let t = 0;
      
      const nextIndex = currentFrameIndex + 1;
      if (rawProgress > holdThreshold) {
          if (holdThreshold >= 1) {
             t = 0;
          } else {
             t = (rawProgress - holdThreshold) / (1 - holdThreshold);
          }
          if (nextIndex < project.frames.length) {
             useStore.getState().setInterpolatingTarget(nextIndex);
          }
      } else {
          useStore.getState().setInterpolatingTarget(null);
      }
      
      if (nextIndex >= project.frames.length) {
        useStore.getState().togglePlay();
        useStore.getState().setInterpolatingTarget(null);
        return;
      }

      if (wasmRef.current) {
        const frameA = project.frames[currentFrameIndex];
        const frameB = project.frames[nextIndex];

        if (frameA && frameB) {
           const result = wasmRef.current.interpolate_frame(frameA, frameB, t);
           
           // Patch missing properties (shapes, color, opacity) from source frame
           // because Wasm struct doesn't include them yet
           if (result && result.figures) {
               result.figures = result.figures.map((fig: any) => {
                   const sourceFig = frameA.figures.find(f => f.id === fig.id);
                   if (sourceFig) {
                       return {
                           ...fig,
                           shapes: sourceFig.shapes,
                           color: sourceFig.color,
                           opacity: sourceFig.opacity
                       };
                   }
                   return fig;
               });
           }

           setInterpolatedFrame(result);
        }
      }

      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCurrentFrameIndex(nextIndex);
        useStore.getState().setInterpolatingTarget(null);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, currentFrameIndex, project.frames, setCurrentFrameIndex]);

  const frameToShow = isPlaying ? interpolatedFrame : project.frames[currentFrameIndex];

  // Builder mode click handler
  const handleBuilderClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (editorMode !== 'figure' || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 1280;
    const svgY = ((e.clientY - rect.top) / rect.height) * 720;
    
    if (builderTool === 'add-pivot') {
      addBuilderPivot(svgX, svgY);
    }
  }, [editorMode, builderTool, addBuilderPivot]);
  
  // Memoize pivot map for fast lookups
  const pivotMapBuilder = useMemo(() => {
    if (!builderFigure) return new Map();
    const map = new Map();
    builderFigure.pivots.forEach(p => map.set(p.id, p));
    return map;
  }, [builderFigure?.pivots]);
  
  // Render builder pivots - memoized to prevent unnecessary recalculations
  const renderBuilderPivots = useMemo(() => {
    if (!builderFigure) return null;
    
    return (
      <g>
        {/* Render shapes first */}
        {builderFigure.shapes.map((shape, idx) => {
          const p1 = pivotMapBuilder.get(shape.pivotIds[0]);
          const p2 = pivotMapBuilder.get(shape.pivotIds[1]);

          if (shape.type === 'line' && shape.pivotIds.length >= 2 && p1 && p2) {
            return (
              <line
                key={`shape-${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={shape.color || builderFigure.color || '#000'}
                strokeWidth={builderFigure.thickness || 4}
                strokeLinecap="round"
              />
            );
          }

          if (shape.type === 'curve' && shape.pivotIds.length >= 3) {
            const pc = pivotMapBuilder.get(shape.pivotIds[1]);
            const p3 = pivotMapBuilder.get(shape.pivotIds[2]);
            if (p1 && pc && p3) {
              const d = `M ${p1.x} ${p1.y} Q ${pc.x} ${pc.y} ${p3.x} ${p3.y}`;
              return (
                <path
                  key={`shape-${idx}`}
                  d={d}
                  fill="none"
                  stroke={shape.color || builderFigure.color || '#000'}
                  strokeWidth={builderFigure.thickness || 4}
                  strokeLinecap="round"
                />
              );
            }
          }

          return null;
        })}
        
        {/* Render pivots */}
        {builderFigure.pivots.map((pivot) => {
          const isRoot = pivot.id === builderRootPivotId;
          const isConnectingSelected = (builderTool === 'connect' || builderTool === 'connect-curve') && connectingPivots.includes(pivot.id);
          
          let fillColor = '#666';
          if (isConnectingSelected) fillColor = '#10b981';
          else if (isRoot) fillColor = '#3b82f6';
          else if (pivot.type === 'joint') fillColor = '#f97316';
          else if (pivot.type === 'fixed') fillColor = '#6b7280';
          
          return (
            <circle
              key={pivot.id}
              cx={pivot.x}
              cy={pivot.y}
              r={isRoot ? 6 : 4}
              fill={fillColor}
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (builderTool === 'select' && svgRef.current) {
                  const CTM = svgRef.current.getScreenCTM();
                  if (CTM) {
                    const mouseX = (e.clientX - CTM.e) / CTM.a;
                    const mouseY = (e.clientY - CTM.f) / CTM.d;
                    setBuilderDragOffset({ x: mouseX - pivot.x, y: mouseY - pivot.y });
                    setBuilderDraggingPivotId(pivot.id);
                  }
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (builderTool === 'select') {
                  togglePivotSelection(pivot.id);
                } else if (builderTool === 'connect' || builderTool === 'connect-curve') {
                  if (!connectingPivots.includes(pivot.id)) {
                    const newLen = connectingPivots.length + 1;
                    addConnectingPivot(pivot.id);
                    if (newLen === (builderTool === 'connect-curve' ? 3 : 2)) {
                      createLineFromConnecting();
                    }
                  }
                } else if (builderTool === 'set-root') {
                  setBuilderRootPivot(pivot.id);
                } else if (builderTool === 'set-joint') {
                  setBuilderPivotType(pivot.id, pivot.type === 'joint' ? 'fixed' : 'joint');
                } else if (builderTool === 'set-fixed') {
                  setBuilderPivotType(pivot.id, 'fixed');
                } else if (builderTool === 'delete') {
                  useStore.getState().removeBuilderPivot(pivot.id);
                }
              }}
            />
          );
        })}
      </g>
    );
  }, [builderFigure, pivotMapBuilder, builderRootPivotId, builderTool, connectingPivots, togglePivotSelection, addConnectingPivot, createLineFromConnecting, setBuilderRootPivot, setBuilderPivotType]);

  return (
    <>
      <svg 
        ref={svgRef}
        viewBox="0 0 1280 720"
        onClick={editorMode === 'figure' ? handleBuilderClick : undefined}
        onMouseMove={useCallback((e) => {
          if (editorMode === 'figure' && builderDraggingPivotId && svgRef.current) {
            const CTM = svgRef.current.getScreenCTM();
            if (CTM) {
              const mouseX = (e.clientX - CTM.e) / CTM.a;
              const mouseY = (e.clientY - CTM.f) / CTM.d;
              moveBuilderPivot(builderDraggingPivotId, mouseX - builderDragOffset.x, mouseY - builderDragOffset.y);
            }
          } else if (svgRef.current && draggingPivotId) {
            const rect = svgRef.current.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * 1280;
            const svgY = ((e.clientY - rect.top) / rect.height) * 720;
            handleMouseMove(e);
            handleDeleteMouseMove(svgX, svgY);
          } else {
            handleMouseMove(e);
          }
        }, [editorMode, builderDraggingPivotId, builderDragOffset, draggingPivotId, handleMouseMove, handleDeleteMouseMove, moveBuilderPivot])}
        onMouseUp={useCallback((e) => {
          if (editorMode === 'figure' && builderDraggingPivotId) {
            setBuilderDraggingPivotId(null);
          } else if (svgRef.current && draggingPivotId) {
            const rect = svgRef.current.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * 1280;
            const svgY = ((e.clientY - rect.top) / rect.height) * 720;
            
            const figureId = frameToShow?.figures.find(fig => 
              fig.pivots?.some((p: any) => p.id === draggingPivotId) || 
              fig.root_pivot && (() => {
                let found = false;
                const search = (pivot: any): void => {
                  if (pivot.id === draggingPivotId) { found = true; return; }
                  pivot.children?.forEach(search);
                };
                search(fig.root_pivot);
                return found;
              })()
            )?.id || null;
            
            handleMouseUp();
            handleDeleteMouseUp(svgX, svgY, figureId);
          } else {
            handleMouseUp();
          }
        }, [editorMode, builderDraggingPivotId, draggingPivotId, frameToShow, handleMouseUp, handleDeleteMouseUp])}
        onMouseLeave={useCallback(() => {
          setBuilderDraggingPivotId(null);
          handleMouseUp();
          handleDeleteMouseUp(0, 0, null);
        }, [handleMouseUp, handleDeleteMouseUp])}
        className="bg-surface shadow-sm max-h-[calc(100vh-2rem)] mx-auto"
      >
        {editorMode === 'figure' ? (
          // Builder Mode Rendering
          <>
            {renderBuilderPivots}
          </>
        ) : (
          // Animation Mode Rendering
          <>
            {/* Delete Zone - Trash Icon */}
            <g opacity={isOverDeleteZone ? 1 : 0.5} style={{ transition: 'opacity 0.2s', filter: isOverDeleteZone ? 'drop-shadow(0 0 8px #ef4444)' : 'none', cursor: 'pointer' }}>
               <svg x="1220" y="660" width="36" height="36" viewBox="0 0 24 24" fill="#ef4444">
                 <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
               </svg>
            </g>

            {/* Onion Skinning: Render previous frame if exists and not playing */}
            {!isPlaying && currentFrameIndex > 0 && project.frames[currentFrameIndex - 1] && (
                <g opacity="0.3" style={{ filter: 'grayscale(100%)' }}>
                    {project.frames[currentFrameIndex - 1].figures.map(figure => 
                        renderFigure(figure, null, () => {}) // Non-interactive
                    )}
                </g>
            )}

            {/* Current Frame */}
            {frameToShow?.figures.map((figure) => (
               <g key={figure.id}>
                 {renderFigure(figure, draggingPivotId, handleMouseDown)}
               </g>
            ))}
          </>
        )}
      </svg>
      {pickerState.isOpen && pickerState.figureId && (
        <FigureSettings 
            figureId={pickerState.figureId} 
            onClose={() => setPickerState({ isOpen: false, figureId: null })} 
        />
      )}
    </>
  );
}
