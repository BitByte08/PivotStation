'use client';

import React from 'react';
import { useStore } from '@/app/store/useStore';
import { useModal } from '@/app/editor/store/useModal';

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconPause = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export default function ModeSwitcher() {
  const { interactionMode, setInteractionMode } = useStore();

  const modes = [
    { id: 'rotate', label: 'Rotate', color: 'bg-blue-500' },
    { id: 'stretch', label: 'Stretch', color: 'bg-orange-500' },
    { id: 'flip', label: 'Flip', color: 'bg-purple-500' },
  ] as const;
  const { togglePlay, isPlaying } = useStore();
  const { openModalType } = useModal();

  return (
    <div className="flex-1 flex flex-col bg-surface rounded-2xl p-3 gap-2">
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
      <button
        className='w-10 h-10 flex items-center justify-center rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200'
        onClick={togglePlay}>
       {isPlaying ? <IconPause /> : <IconPlay />}
      </button>
      <button
        className='w-10 h-10 flex items-center justify-center rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200'
        onClick={()=>openModalType('models')}>
        <IconPlus />
      </button>
      <button
        className='w-10 h-10 flex items-center justify-center rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200'
        onClick={()=>openModalType('settings')}>
        <IconSettings />
      </button>
    </div>
  );
}
