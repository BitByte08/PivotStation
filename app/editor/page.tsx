'use client';

import React, { useState } from 'react';
import Stage from '@/app/components/Stage';
import { useStore } from '@/app/store/useStore';
import ModeSwitcher from '@/app/components/ModeSwitcher';
import ExportModal from '@/app/components/ExportModal';
import SettingsModal from '@/app/components/SettingsModal';
import ModelsModal from '@/app/components/ModelsModal';

export default function EditorPage() {
  const { addFrame, togglePlay, isPlaying, currentFrameIndex, project, setCurrentFrameIndex } = useStore();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-50 text-black">
      {/* Header / Toolbar */}
      <header className="h-14 border-b bg-white flex items-center px-4 gap-4">
        <h1 className="font-bold text-lg">Pivot Animator</h1>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <button 
          onClick={() => setIsModelsModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Add Figure
        </button>
        <button 
          onClick={addFrame}
          className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm font-medium border"
        >
          Add Frame
        </button>
        <div className="flex items-center gap-2 mr-4">
          <span className="text-sm text-gray-600">FPS: {useStore.getState().fps}</span>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
        <button 
          onClick={togglePlay}
          className={`px-3 py-1.5 rounded text-sm font-medium border ${isPlaying ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium border border-purple-200 ml-auto"
        >
          Export
        </button>
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to reset the project?')) {
              useStore.getState().resetProject();
            }
          }}
          className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium border border-red-200"
        >
          Reset
        </button>
        <button 
          onClick={() => useStore.getState().checkIntegrity()}
          className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 text-sm font-medium border border-yellow-200"
        >
          Debug
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Stage Area - Full Screen */}
        <main className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative">
            <ModeSwitcher />
            <div className="w-full h-full bg-white shadow-lg">
                <Stage />
            </div>
        </main>
      </div>

      {/* Timeline (Bottom) */}
      <div className="h-32 bg-white border-t p-4 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2">
           {project.frames.map((frame, index) => {
             const isCurrent = currentFrameIndex === index;
             const isTarget = useStore.getState().interpolatingTargetIndex === index;
             
             return (
               <div 
                 key={frame.id}
                 onClick={() => setCurrentFrameIndex(index)}
                 className={`
                   w-24 h-20 border-2 rounded flex items-center justify-center cursor-pointer relative transition-colors
                   ${isCurrent ? 'bg-blue-50 border-blue-500 text-blue-500' : 
                     isTarget ? 'bg-green-50 border-green-400 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}
                 `}
               >
                 <span className="font-bold">{index + 1}</span>
                 {isTarget && (
                    <div className="absolute inset-0 border-2 border-green-400 animate-pulse pointer-events-none rounded"></div>
                 )}
               </div>
             );
           })}
        </div>
      </div>

      {isExportModalOpen && (
        <ExportModal onClose={() => setIsExportModalOpen(false)} />
      )}
      {isModelsModalOpen && (
        <ModelsModal onClose={() => setIsModelsModalOpen(false)} />
      )}
      {isSettingsModalOpen && (
        <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />
      )}
    </div>
  );
}
