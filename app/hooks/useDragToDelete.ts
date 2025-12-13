import { useState } from 'react';
import { useStore } from '@/app/store/useStore';

const DELETE_ZONE_X = 1230;
const DELETE_ZONE_Y = 670;
const DELETE_ZONE_RADIUS = 50;

export const useDragToDelete = () => {
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);
  const [draggingFigureId, setDraggingFigureId] = useState<string | null>(null);
  const { currentFrameIndex } = useStore();

  const isInDeleteZone = (svgX: number, svgY: number) => {
    const dx = svgX - DELETE_ZONE_X;
    const dy = svgY - DELETE_ZONE_Y;
    return Math.sqrt(dx * dx + dy * dy) <= DELETE_ZONE_RADIUS;
  };

  const handleFigureMouseDown = (figureId: string) => {
    setDraggingFigureId(figureId);
  };

  const handleMouseMove = (svgX: number, svgY: number) => {
    if (!draggingFigureId) {
      setIsOverDeleteZone(false);
      return;
    }

    if (isInDeleteZone(svgX, svgY)) {
      setIsOverDeleteZone(true);
    } else {
      setIsOverDeleteZone(false);
    }
  };

  const handleMouseUp = (svgX: number, svgY: number, figureId: string | null) => {
    if (figureId && isInDeleteZone(svgX, svgY)) {
      // Delete the figure from current frame
      useStore.setState((state) => {
        const currentFrame = state.project.frames[currentFrameIndex];
        const updatedFigures = currentFrame.figures.filter(f => f.id !== figureId);
        
        return {
          project: {
            ...state.project,
            frames: state.project.frames.map((frame, idx) =>
              idx === currentFrameIndex 
                ? { ...frame, figures: updatedFigures }
                : frame
            ),
          },
        };
      });
    }

    setIsOverDeleteZone(false);
  };

  return {
    isOverDeleteZone,
    draggingFigureId,
    handleFigureMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

