'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Pivot } from '../types';

// Helper to render a pivot and its children recursively
const RenderPivot = ({ pivot, parentX, parentY }: { pivot: Pivot, parentX?: number, parentY?: number }) => {
  return (
    <g>
      {parentX !== undefined && parentY !== undefined && (
        <line
          x1={parentX}
          y1={parentY}
          x2={pivot.x}
          y2={pivot.y}
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      <circle cx={pivot.x} cy={pivot.y} r={pivot.type === 'joint' ? 4 : 2} fill="red" />
      {pivot.children.map((child) => (
        <RenderPivot key={child.id} pivot={child} parentX={pivot.x} parentY={pivot.y} />
      ))}
    </g>
  );
};



export default function Stage() {
  const { project, currentFrameIndex, isPlaying, updateFigure, setCurrentFrameIndex } = useStore();
  const [interpolatedFrame, setInterpolatedFrame] = useState(project.frames[currentFrameIndex]);
  const [draggingPivotId, setDraggingPivotId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const wasmRef = useRef<any>(null);

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
      const fps = Math.max(1, useStore.getState().fps || 10); // Ensure valid FPS
      const duration = 1000 / fps; // Duration per frame in ms
      const elapsed = time - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      // "Hold then Interpolate" logic:
      // 0% -> 50%: Hold Frame A (t = 0)
      // 50% -> 100%: Interpolate A -> B (t goes 0 -> 1)
      const holdThreshold = useStore.getState().holdThreshold;
      let t = 0;
      
      const nextIndex = currentFrameIndex + 1;
      
      if (rawProgress > holdThreshold) {
          // Prevent divide by zero if threshold is 1
          if (holdThreshold >= 1) {
             t = 0;
          } else {
             t = (rawProgress - holdThreshold) / (1 - holdThreshold);
          }
          // We are interpolating to nextIndex
          if (nextIndex < project.frames.length) {
             useStore.getState().setInterpolatingTarget(nextIndex);
          }
      } else {
          // We are holding
          useStore.getState().setInterpolatingTarget(null);
      }
      
      // Stop if next index is out of bounds
      if (nextIndex >= project.frames.length) {
        useStore.getState().togglePlay(); // Stop playing
        useStore.getState().setInterpolatingTarget(null); // Reset target
        return;
      }

      if (wasmRef.current) {
        const frameA = project.frames[currentFrameIndex];
        const frameB = project.frames[nextIndex];

        if (frameA && frameB) {
           const result = wasmRef.current.interpolate_frame(frameA, frameB, t);
           setInterpolatedFrame(result);
        }
      }

      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Move to next frame
        setCurrentFrameIndex(nextIndex);
        // Reset target for the new frame (it starts with hold)
        useStore.getState().setInterpolatingTarget(null);
        // The effect will re-run because currentFrameIndex changes
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, currentFrameIndex, project.frames, setCurrentFrameIndex]);

  // If not playing, show the static current frame
  const frameToShow = isPlaying ? interpolatedFrame : project.frames[currentFrameIndex];

  const handleMouseDown = (e: React.MouseEvent, pivot: Pivot) => {
    if (isPlaying) return;
    e.stopPropagation();
    setDraggingPivotId(pivot.id);
    
    // Calculate offset to prevent snapping
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
        
        // Helper to find and update pivot and its children
        const updatePivotRecursive = (p: Pivot): boolean => {
            if (p.id === draggingPivotId) {
                const dx = targetX - p.x;
                const dy = targetY - p.y;
                
                // Move this pivot
                p.x = targetX;
                p.y = targetY;
                
                // Move all children by the same delta
                const moveChildren = (parent: Pivot) => {
                    for (const child of parent.children) {
                        child.x += dx;
                        child.y += dy;
                        moveChildren(child);
                    }
                };
                moveChildren(p);
                
                return true;
            }
            for (const child of p.children) {
                if (updatePivotRecursive(child)) return true;
            }
            return false;
        };

        const figureClone = JSON.parse(JSON.stringify(figure));
        if (updatePivotRecursive(figureClone.root_pivot)) {
            updateFigure(currentFrameIndex, figureClone);
            break;
        }
    }
  };

  const handleMouseUp = () => {
    setDraggingPivotId(null);
  };

  // Recursive render with interaction
  const RenderPivotInteractive = ({ pivot, parentX, parentY }: { pivot: Pivot, parentX?: number, parentY?: number }) => {
    // Guard against NaN
    if (isNaN(pivot.x) || isNaN(pivot.y)) return null;
    
    return (
      <g>
        {parentX !== undefined && parentY !== undefined && !isNaN(parentX) && !isNaN(parentY) && (
          <line
            x1={parentX}
            y1={parentY}
            x2={pivot.x}
            y2={pivot.y}
            stroke="black"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        <circle 
            cx={pivot.x} 
            cy={pivot.y} 
            r={pivot.type === 'joint' ? 6 : 4} 
            fill={draggingPivotId === pivot.id ? "blue" : "red"}
            cursor="pointer"
            onMouseDown={(e) => handleMouseDown(e, pivot)}
        />
        {pivot.children.map((child) => (
          <RenderPivotInteractive key={child.id} pivot={child} parentX={pivot.x} parentY={pivot.y} />
        ))}
      </g>
    );
  };

  return (
    <div className="w-full h-full bg-white border border-gray-200 shadow-sm overflow-hidden relative">
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox="0 0 800 600" 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {frameToShow?.figures.map((figure) => (
          <g key={figure.id}>
             <RenderPivotInteractive pivot={figure.root_pivot} />
          </g>
        ))}
      </svg>
      <div className="absolute top-2 left-2 text-xs text-gray-500">
        Frame: {currentFrameIndex + 1} / {project.frames.length}
      </div>
      <div className="absolute bottom-2 right-2 text-4xl font-bold text-gray-200 pointer-events-none select-none">
        {currentFrameIndex + 1}
      </div>
    </div>
  );
}
