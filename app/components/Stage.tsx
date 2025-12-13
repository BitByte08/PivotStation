'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/app/store/useStore';
import { useInteraction } from '@/app/hooks/useInteraction';
import { useFigureRender } from '@/app/hooks/useFigureRender';
import { useDragToDelete } from '@/app/hooks/useDragToDelete';
import ColorPicker from '@/app/components/ColorPicker';
import { Pivot } from '@/app/types/figure';

export default function Stage() {
  const { project, currentFrameIndex, isPlaying, setCurrentFrameIndex } = useStore();
  const [interpolatedFrame, setInterpolatedFrame] = useState(project.frames[currentFrameIndex]);
  const svgRef = useRef<SVGSVGElement>(null);
  const wasmRef = useRef<any>(null);

  const { handleMouseDown, handleMouseMove, handleMouseUp, draggingPivotId, pickerState, setPickerState } = useInteraction(svgRef);
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

  return (
    <>
      <svg 
        ref={svgRef}
        viewBox="0 0 1280 720" 
        onMouseMove={(e) => {
          if (svgRef.current && draggingPivotId) {
            const rect = svgRef.current.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * 1280;
            const svgY = ((e.clientY - rect.top) / rect.height) * 720;
            handleMouseMove(e);
            handleDeleteMouseMove(svgX, svgY);
          } else {
            handleMouseMove(e);
          }
        }}
        onMouseUp={(e) => {
          if (svgRef.current && draggingPivotId) {
            const rect = svgRef.current.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * 1280;
            const svgY = ((e.clientY - rect.top) / rect.height) * 720;
            
            // Find figure ID from dragging pivot
            const findFigureByPivot = (pivotId: string): string | null => {
              const findInTree = (pivot: Pivot): boolean => {
                if (pivot.id === pivotId) return true;
                return pivot.children?.some((child: Pivot) => findInTree(child)) || false;
              };
              return frameToShow?.figures.find(fig => findInTree(fig.root_pivot))?.id || null;
            };
            
            const figureId = findFigureByPivot(draggingPivotId);
            handleMouseUp();
            handleDeleteMouseUp(svgX, svgY, figureId);
          } else {
            handleMouseUp();
          }
        }}
        onMouseLeave={() => {
          handleMouseUp();
          handleDeleteMouseUp(0, 0, null);
        }}
        className="bg-surface shadow-sm"
      >
        {/* Delete Zone - Trash Icon */}
        <g opacity={isOverDeleteZone ? 1 : 0.4} style={{ transition: 'opacity 0.2s', filter: isOverDeleteZone ? 'drop-shadow(0 0 8px #ef4444)' : 'none' }}>
          <text x="1230" y="685" textAnchor="middle" fontSize="56" fill="#ef4444">🗑️</text>
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
      </svg>
      <div className="absolute top-4 left-4 text-xs text-gray-500">
        Frame: {currentFrameIndex + 1} / {project.frames.length}
      </div>
      <div className="absolute bottom-8 right-8 text-4xl font-bold text-gray-200 pointer-events-none select-none">
        {currentFrameIndex + 1}
      </div>
      {pickerState.isOpen && pickerState.figureId && (
        <ColorPicker 
            figureId={pickerState.figureId} 
            onClose={() => setPickerState({ isOpen: false, figureId: null })} 
        />
      )}
    </>
  );
}
