'use client'
import React, { useEffect, useRef } from 'react'
import Header from './components/layouts/Header'
import Timeline from './components/layouts/Timeline'
import Modal from './components/modals'
import EditorContainer from './components/containers/EditorContainer'
import TutorialOverlay from './components/overlays/TutorialOverlay'
import { useStore } from '@/app/store/useStore'

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const { uiVisible, editorMode, project, saveToLocalStorage } = useStore() // Get global UI state and editor mode
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  useEffect(() => {
    // Save immediately when project changes
    saveToLocalStorage();

    // Set up interval for periodic auto-save (every 30 seconds)
    autoSaveIntervalRef.current = setInterval(() => {
      saveToLocalStorage();
    }, 30000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [project, saveToLocalStorage]);

  return (
    <>
      <div
        className={`
          fixed top-4 left-4 right-4 z-40 transition-all duration-300 select-none
          ${uiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
        <Header />
      </div>

      <EditorContainer>{children}</EditorContainer>

      <div
        className={`
          fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 select-none
          ${uiVisible && editorMode === 'anime' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <Timeline />
      </div>
      
      {/* UI Toggle Button Removed - Moved to Sidebar */}

      <TutorialOverlay />
      <Modal />
    </>
  )
}
