'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';

interface ColorPickerProps {
  figureId: string;
  onClose: () => void;
}

export default function ColorPicker({ figureId, onClose }: ColorPickerProps) {
  const { project, currentFrameIndex, updateFigure } = useStore();
  const frame = project.frames[currentFrameIndex];
  const figure = frame.figures.find(f => f.id === figureId);

  const [color, setColor] = useState(figure?.color || '#000000');
  const [opacity, setOpacity] = useState(figure?.opacity ?? 1);

  useEffect(() => {
    if (figure) {
      setColor(figure.color || '#000000');
      setOpacity(figure.opacity ?? 1);
    }
  }, [figure?.id, figure?.color, figure?.opacity]);

  const handleSave = () => {
    if (figure) {
      const newFigure = { ...figure, color, opacity };
      updateFigure(currentFrameIndex, newFigure);
    }
    onClose();
  };

  if (!figure) return null;

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-lg border z-50 w-64">
      <h3 className="font-bold mb-4">Figure Settings</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Color</label>
        <div className="flex gap-2">
            <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 p-0 border-0"
            />
            <input 
                type="text" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 border rounded px-2 text-sm"
            />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Opacity: {Math.round(opacity * 100)}%</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={opacity} 
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button 
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
