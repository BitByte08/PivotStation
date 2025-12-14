'use client';

import { useStore } from '@/app/store/useStore';
import { useState, useRef } from 'react';
import { Figure, Pivot } from '@/app/types';

// Simple icon components
const X = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const Upload = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);

const Trash2 = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </svg>
);

interface CustomFigureData {
  id: string;
  name: string;
  figure: Figure;
  createdAt: number;
}

interface CustomFiguresModalProps {
  onClose: () => void;
  onSelectFigure: (figure: Figure) => void;
}

export default function CustomFiguresModal({ onClose, onSelectFigure }: CustomFiguresModalProps) {
  const [customFigures, setCustomFigures] = useState<CustomFigureData[]>(() => {
    const stored = localStorage.getItem('customFigures');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Object.entries(parsed).map(([id, data]) => ({
      id,
      ...(data as Omit<CustomFigureData, 'id'>)
    }));
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const figure: Figure = JSON.parse(content);
        
        // Validate figure structure
        if (!figure.id || !figure.root_pivot || !figure.shapes) {
          alert('Invalid .psfigure file format');
          return;
        }
        
        // Save to localStorage
        const customFigures = JSON.parse(localStorage.getItem('customFigures') || '{}');
        const figureId = `imported-${Date.now()}`;
        const fileName = file.name.replace('.psfigure', '');
        
        customFigures[figureId] = {
          id: figureId,
          name: fileName,
          figure: figure,
          createdAt: Date.now()
        };
        
        localStorage.setItem('customFigures', JSON.stringify(customFigures));
        
        // Refresh list
        const parsed = JSON.parse(localStorage.getItem('customFigures') || '{}');
        setCustomFigures(
          Object.entries(parsed).map(([id, data]) => ({
            id,
            ...(data as Omit<CustomFigureData, 'id'>)
          }))
        );
        
        alert('Figure imported successfully!');
      } catch (error) {
        alert('Failed to import figure: ' + error);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteFigure = (figureId: string) => {
    if (!confirm('Delete this custom figure?')) return;
    
    const customFigures = JSON.parse(localStorage.getItem('customFigures') || '{}');
    delete customFigures[figureId];
    localStorage.setItem('customFigures', JSON.stringify(customFigures));
    
    // Refresh list
    const parsed = JSON.parse(localStorage.getItem('customFigures') || '{}');
    setCustomFigures(
      Object.entries(parsed).map(([id, data]) => ({
        id,
        ...(data as Omit<CustomFigureData, 'id'>)
      }))
    );
  };

  const handleSelectFigure = (figureData: CustomFigureData) => {
    onSelectFigure(figureData.figure);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Custom Figures</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Import Button */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <input
            ref={fileInputRef}
            type="file"
            accept=".psfigure"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Upload size={20} />
            Import .psfigure File
          </button>
        </div>

        {/* Figures List */}
        <div className="flex-1 overflow-y-auto p-6">
          {customFigures.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No custom figures yet</p>
              <p className="text-sm">Import a .psfigure file or create one in the figure builder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFigures.map((figureData) => (
                <div
                  key={figureData.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => handleSelectFigure(figureData)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{figureData.name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(figureData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFigure(figureData.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {/* Figure Preview - Simple stats */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Pivots: {countPivots(figureData.figure.root_pivot)}</div>
                    <div>Shapes: {figureData.figure.shapes.length}</div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFigure(figureData);
                    }}
                    className="w-full mt-3 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Add to Project
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to count pivots
function countPivots(pivot: Pivot): number {
  let count = 1;
  if (pivot.children) {
    pivot.children.forEach((child: Pivot) => {
      count += countPivots(child);
    });
  }
  return count;
}
