'use client';

import React from 'react';
import { useStore } from '@/app/store/useStore';

export default function ModeSwitcher() {
  const { interactionMode, setInteractionMode } = useStore();

  const modes = [
    { id: 'rotate', label: 'Rotate', color: 'bg-blue-500' },
    { id: 'stretch', label: 'Stretch', color: 'bg-orange-500' },
    { id: 'flip', label: 'Flip', color: 'bg-purple-500' },
  ] as const;

  return (
    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-lg shadow-md flex flex-col gap-2 z-10">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setInteractionMode(mode.id)}
          className={`w-10 h-10 flex items-center justify-center rounded text-xs font-medium transition-colors ${
            interactionMode === mode.id
              ? `${mode.color} text-white`
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={mode.label}
        >
          {mode.label[0]}
        </button>
      ))}
    </div>
  );
}
