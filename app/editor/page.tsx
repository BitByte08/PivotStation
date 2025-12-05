'use client';

import React from 'react';
import Link from 'next/link';
import Stage from '../components/Stage';
import { useStore } from '../store/useStore';
import { Figure } from '../types';

export default function EditorPage() {
  const { addFrame, togglePlay, isPlaying, updateFigure, currentFrameIndex, project, setCurrentFrameIndex } = useStore();

  const handleAddStickman = () => {
    // Create a basic stickman figure
    const stickman: Figure = {
      id: `fig-${Date.now()}`,
      root_pivot: {
        id: `p-${Date.now()}-root`,
        type: 'joint',
        x: 400,
        y: 300,
        children: [
          {
            id: `p-${Date.now()}-head`,
            type: 'joint',
            x: 400,
            y: 250,
            children: []
          },
          {
            id: `p-${Date.now()}-spine`,
            type: 'joint',
            x: 400,
            y: 350,
            children: [
               {
                id: `p-${Date.now()}-leg-l`,
                type: 'joint',
                x: 380,
                y: 400,
                children: []
               },
               {
                id: `p-${Date.now()}-leg-r`,
                type: 'joint',
                x: 420,
                y: 400,
                children: []
               }
            ]
          }
        ]
      }
    };
    updateFigure(currentFrameIndex, stickman);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-50 text-black">
      {/* Header / Toolbar */}
      <header className="h-14 border-b bg-white flex items-center px-4 gap-4">
        <h1 className="font-bold text-lg">Pivot Animator</h1>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <button 
          onClick={handleAddStickman}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Add Stickman
        </button>
        <button 
          onClick={addFrame}
          className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm font-medium border"
        >
          Add Frame
        </button>
        <div className="flex items-center gap-2 mr-4">
          <span className="text-sm text-gray-600">FPS: {useStore.getState().fps}</span>
          <Link 
            href="/editor/setting"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Settings"
          >
            ⚙️
          </Link>
        </div>
        <button 
          onClick={togglePlay}
          className={`px-3 py-1.5 rounded text-sm font-medium border ${isPlaying ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to reset the project?')) {
              useStore.getState().resetProject();
            }
          }}
          className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium border border-red-200 ml-auto"
        >
          Reset Project
        </button>
        <button 
          onClick={() => useStore.getState().checkIntegrity()}
          className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 text-sm font-medium border border-yellow-200"
        >
          Debug
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r p-4 hidden md:block">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Figures</h2>
          {/* Figure list would go here */}
          <div className="text-sm text-gray-400 italic">No figures selected</div>
        </aside>

        {/* Stage Area */}
        <main className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-auto">
          <div className="w-[800px] h-[600px] bg-white shadow-lg">
            <Stage />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-64 bg-white border-l p-4 hidden md:block">
           <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Properties</h2>
           {/* Properties would go here */}
        </aside>
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
    </div>
  );
}
