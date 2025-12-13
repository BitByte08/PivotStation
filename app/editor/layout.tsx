'use client'
import React, { useState } from 'react'
import Header from './components/layouts/Header'
import Timeline from './components/layouts/Timeline'
import Modal from './components/modals'
import EditorContainer from './components/containers/EditorContainer'

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const [uiVisible, setUiVisible] = useState(true)

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
          ${uiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <Timeline />
      </div>
      
      {/* UI Toggle Button */}
      <button 
        onClick={() => setUiVisible(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all border border-gray-200"
        title={uiVisible ? "UI 숨기기 (Hide UI)" : "UI 보이기 (Show UI)"}
      >
        {uiVisible ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
             <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>

      <Modal />
    </>
  )
}
