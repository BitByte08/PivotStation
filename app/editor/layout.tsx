'use client'
import React, { useState, useEffect } from 'react'
import Header from './components/layouts/Header'
import Timeline from './components/layouts/Timeline'
import Modal from './components/modals'
import EditorContainer from './components/containers/EditorContainer'

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const [showHeader, setShowHeader] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  // PC: 마우스 위치로 자동 표시
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const y = e.clientY
      const h = window.innerHeight
      
      if(!showHeader) setShowHeader(y < 40)
      if(!showTimeline) setShowTimeline(y > h - 40)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [showHeader, showTimeline])

  return (
    <>
      <div
        className={`
          fixed top-4 left-4 right-4 z-40 transition-all duration-300
          ${showHeader ? 'panel-visible' : 'panel-hidden'}
        `}
      >
        <Header />
      </div>

      <EditorContainer>{children}</EditorContainer>

      <div
        className={`
          fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 shadow-
          ${showTimeline ? 'timeline-visible' : 'timeline-hidden'}
        `}
      >
        <Timeline />
      </div>
      <Modal />
    </>
  )
}
