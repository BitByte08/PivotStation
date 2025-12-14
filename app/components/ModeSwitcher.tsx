'use client';

import React from 'react';
import { useStore } from '@/app/store/useStore';
import { useModal } from '@/app/editor/store/useModal';

// Icons
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const IconHand = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const IconArrowsOut = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9l-3 3 3 3" />
        <path d="M9 5l3-3 3 3" />
        <path d="M19 9l3 3-3 3" />
        <path d="M9 19l3 3 3-3" />
        <path d="M2 12h20" />
        <path d="M12 2v20" />
    </svg>
);

const IconCrossArrows = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3 4 7l4 4" />
        <path d="M4 7h16" />
        <path d="m16 21 4-4-4-4" />
        <path d="M20 17H4" />
    </svg>
);

const IconSettings = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const IconDuplicate = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const IconEye = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const IconEyeOff = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export default function ModeSwitcher() {
  const { interactionMode, setInteractionMode, togglePlay, isPlaying, addFrame, toggleUiVisible, uiVisible } = useStore();
  const { openModalType } = useModal();

  const modes = [
    { id: 'rotate', label: '이동/회전 (Move/Rotate)', icon: <IconHand />, color: 'bg-blue-500' },
    { id: 'stretch', label: '늘리기 (Stretch)', icon: <IconArrowsOut />, color: 'bg-orange-500' },
    { id: 'flip', label: '뒤집기 (Flip)', icon: <IconCrossArrows />, color: 'bg-purple-500' },
  ] as const;

  return (
    <div className={`flex flex-col bg-surface rounded-2xl p-3 gap-2 shadow-sm transition-all duration-300`}>
      {/* Mode Buttons */}
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setInteractionMode(mode.id)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
            interactionMode === mode.id
              ? `${mode.color} text-white shadow`
              : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200 hover:text-gray-900 icon-btn'
          }`}
          title={mode.label}
        >
          {mode.icon}
        </button>
      ))}
      
      <div className="h-px bg-gray-200 my-1 mx-2" />

      {/* Action Buttons */}
      <button
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
        onClick={togglePlay}
        title={isPlaying ? "일시정지" : "재생"}
      >
       {isPlaying ? <IconPause /> : <IconPlay />}
      </button>

      <button
        className='w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100/50 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors'
        onClick={addFrame}
        title="프레임 추가 (Add Frame)"
      >
        <IconDuplicate />
      </button>

      <button
        className='w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100/50 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors'
        onClick={()=>openModalType('models')}
        title="모델 추가"
      >
        <IconPlus />
      </button>
      
      <button
        className='w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100/50 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors'
        onClick={()=>openModalType('settings')}
        title="설정"
      >
        <IconSettings />
      </button>

      {/* UI Toggle - Always Visible */}
      <button
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${!uiVisible ? 'bg-gray-800 text-white opacity-50 hover:opacity-100' : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
        onClick={toggleUiVisible}
        title={uiVisible ? "UI 숨기기 (Hide UI)" : "UI 보이기 (Show UI)"}
      >
        {uiVisible ? <IconEye /> : <IconEyeOff />}
      </button>
    </div>
  );
}
