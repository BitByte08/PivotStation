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
  const [thickness, setThickness] = useState(figure?.thickness || 4);

  const [scale, setScale] = useState(100);

  useEffect(() => {
    if (figure) {
      setColor(figure.color || '#000000');
      setOpacity(figure.opacity ?? 1);
      setThickness(figure.thickness || 4);
    }
  }, [figure?.id, figure?.color, figure?.opacity, figure?.thickness]);

  const handleScale = () => {
    if (figure && scale !== 100) {
        const newFigure = JSON.parse(JSON.stringify(figure));
        const ratio = scale / 100;
        const rootX = newFigure.root_pivot.x;
        const rootY = newFigure.root_pivot.y;

        const scaleRecursive = (p: any) => {
            if (p.id !== newFigure.root_pivot.id) {
                p.x = rootX + (p.x - rootX) * ratio;
                p.y = rootY + (p.y - rootY) * ratio;
            }
            p.children.forEach(scaleRecursive);
        };
        
        scaleRecursive(newFigure.root_pivot);
        updateFigure(currentFrameIndex, newFigure);
        setScale(100); // Reset after applying
    }
  };

  const handleSave = () => {
    if (figure) {
      const newFigure = { ...figure, color, opacity, thickness };
      updateFigure(currentFrameIndex, newFigure);
    }
    onClose();
  };

  if (!figure) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl border-l z-50 p-6 flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Figure Settings</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
        </button>
      </div>
      
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
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Thickness: {thickness}px</label>
        <div className="flex gap-2 items-center">
             <input 
                type="range" 
                min="1" 
                max="20" 
                step="1" 
                value={thickness} 
                onChange={(e) => setThickness(parseInt(e.target.value))}
                className="flex-1"
            />
            <input 
                type="number" 
                min="1" 
                max="20" 
                value={thickness}
                onChange={(e) => setThickness(parseInt(e.target.value) || 4)}
                className="w-16 border rounded px-2 text-sm"
            />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Scale (%)</label>
        <div className="flex gap-2">
            <input 
                type="number" 
                min="10" 
                max="500" 
                value={scale} 
                onChange={(e) => setScale(parseInt(e.target.value) || 100)}
                className="flex-1 border rounded px-2 text-sm"
            />
            <button 
                onClick={handleScale}
                className="px-3 py-1.5 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded"
            >
                Apply
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-6 border-t">
        <button 
          onClick={handleSave}
          className="w-full py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded shadow-sm"
        >
          Save Changes
        </button>
        <button 
          onClick={onClose}
          className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
