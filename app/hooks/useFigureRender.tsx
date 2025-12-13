import React from 'react';
import { useStore } from '@/app/store/useStore';
import { Figure, Pivot, Shape } from '@/app/types';

export const useFigureRender = () => {
  const { interactionMode } = useStore();

  const renderShape = (shape: Shape, allPivots: Map<string, Pivot>, figureColor?: string, figureOpacity?: number) => {
    const pivots = shape.pivotIds.map(id => allPivots.get(id)).filter(p => p !== undefined) as Pivot[];
    
    // Common styles
    const stroke = shape.color || figureColor || 'black';
    const strokeWidth = 4;
    const opacity = figureOpacity ?? 1;

    if (shape.type === 'line' && pivots.length >= 2) {
      return (
        <line
          key={`shape-${shape.pivotIds.join('-')}`}
          x1={pivots[0].x}
          y1={pivots[0].y}
          x2={pivots[1].x}
          y2={pivots[1].y}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={opacity}
        />
      );
    } else if (shape.type === 'circle' && pivots.length >= 2) {
      // Circle defined by center (pivots[0]) and radius point (pivots[1]) OR diameter?
      // Plan said: "Head is two pivots (diameter)"
      // Let's assume pivots[0] and pivots[1] form the diameter.
      const cx = (pivots[0].x + pivots[1].x) / 2;
      const cy = (pivots[0].y + pivots[1].y) / 2;
      const r = Math.sqrt(Math.pow(pivots[0].x - pivots[1].x, 2) + Math.pow(pivots[0].y - pivots[1].y, 2)) / 2;
      
      return (
        <circle
          key={`shape-${shape.pivotIds.join('-')}`}
          cx={cx}
          cy={cy}
          r={r}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none" // Or fill with color? Stickman usually lines. Let's assume fill="white" or transparent.
          opacity={opacity}
        />
      );
    } else if (shape.type === 'polygon' && pivots.length >= 3) {
      const points = pivots.map(p => `${p.x},${p.y}`).join(' ');
      return (
        <polygon
          key={`shape-${shape.pivotIds.join('-')}`}
          points={points}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none" // Stickman style
          strokeLinejoin="round"
          opacity={opacity}
        />
      );
    } else if (shape.type === 'curve' && pivots.length >= 3) {
      // Quadratic Bezier: Start(0), Control(1), End(2)
      const d = `M ${pivots[0].x} ${pivots[0].y} Q ${pivots[1].x} ${pivots[1].y} ${pivots[2].x} ${pivots[2].y}`;
      return (
        <path
          key={`shape-${shape.pivotIds.join('-')}`}
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          opacity={opacity}
        />
      );
    }
    return null;
  };

  const renderPivot = (
    pivot: Pivot, 
    draggingPivotId: string | null, 
    onMouseDown: (e: React.MouseEvent, p: Pivot, isRoot: boolean) => void,
    isRoot: boolean
  ) => {
    // Determine color based on mode
    let fill = 'red'; // Default child color
    
    if (interactionMode === 'rotate') {
        fill = isRoot ? 'blue' : 'red';
    } else if (interactionMode === 'stretch') {
        fill = isRoot ? 'skyblue' : 'orange';
    } else if (interactionMode === 'flip') {
        fill = isRoot ? 'purple' : 'gray'; // Show all pivots, root is special
    }

    // If dragging, maybe highlight?
    if (draggingPivotId === pivot.id) {
        fill = 'green'; // Highlight active
    }

    return (
      <g key={pivot.id}>
        <circle
          cx={pivot.x}
          cy={pivot.y}
          r={isRoot ? 6 : 4}
          fill={fill}
          cursor="pointer"
          onMouseDown={(e) => onMouseDown(e, pivot, isRoot)}
        />
        {pivot.children.map(child => renderPivot(child, draggingPivotId, onMouseDown, false))}
      </g>
    );
  };

  const renderFigure = (
    figure: Figure, 
    draggingPivotId: string | null, 
    onMouseDown: (e: React.MouseEvent, p: Pivot, fId: string, isRoot: boolean) => void
  ) => {
    // Flatten pivots to Map for easy access by shapes
    const allPivots = new Map<string, Pivot>();
    const collectPivots = (p: Pivot) => {
        allPivots.set(p.id, p);
        p.children.forEach(collectPivots);
    };
    collectPivots(figure.root_pivot);

    return (
      <g key={figure.id} opacity={figure.opacity ?? 1}>
        {/* Render Shapes First */}
        {figure.shapes && figure.shapes.map((shape) => renderShape(shape, allPivots, figure.color, figure.opacity))}
        
        {/* Render Pivots on top */}
        {renderPivot(figure.root_pivot, draggingPivotId, (e, p, isRoot) => onMouseDown(e, p, figure.id, isRoot), true)}
      </g>
    );
  };


  return { renderFigure };
};
