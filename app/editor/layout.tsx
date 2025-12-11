'use client'
import React, { useState, useEffect, useRef } from 'react'
import Header from './components/layouts/Header'
import Timeline from './components/layouts/Timeline'
import Modal from './components/modals'
import EditorContainer from './components/containers/EditorContainer'

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const [showHeader, setShowHeader] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  // 이전 프레임에서 상단/하단 근처였는지 저장하는 flag
  const wasNearTop = useRef(false)
  const wasNearBottom = useRef(false)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const y = e.clientY
      const h = window.innerHeight

      const nearTop = y < 40
      const nearBottom = y > h - 40

      // 🔼 상단 토글
      if (nearTop && !wasNearTop.current) {
        setShowHeader(prev => !prev)   // ← 토글
      }
      wasNearTop.current = nearTop

      // 🔽 하단 토글
      if (nearBottom && !wasNearBottom.current) {
        setShowTimeline(prev => !prev) // ← 토글
      }
      wasNearBottom.current = nearBottom
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <>
      <div
        className={`
          fixed top-4 left-4 right-4 z-40 transition-all duration-300 select-none
          ${showHeader ? 'panel-visible' : 'panel-hidden'}
        `}
      >
        <Header />
      </div>

      <EditorContainer>{children}</EditorContainer>

      <div
        className={`
          fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 select-none
          ${showTimeline ? 'timeline-visible' : 'timeline-hidden'}
        `}
      >
        <Timeline />
      </div>
      <Modal />
    </>
  )
}
