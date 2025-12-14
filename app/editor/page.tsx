'use client';

import Stage from '@/app/components/Stage';
import ModeSwitcher from '@/app/components/ModeSwitcher';
import BuilderToolbar from './components/layouts/BuilderToolbar';
import BuilderSidebar from './components/layouts/BuilderSidebar';
import { useStore } from '@/app/store/useStore';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function EditorContent() {
  const { setEditorMode, editorMode, initBuilderFigure } = useStore();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'figure') {
      setEditorMode('figure');
      initBuilderFigure();
    } else {
      setEditorMode('anime');
    }
  }, [searchParams, setEditorMode, initBuilderFigure]);
  
  return <>
      {editorMode === 'anime' ? <ModeSwitcher /> : <BuilderToolbar />}
      {editorMode === 'figure' && <BuilderSidebar />}
      <Stage />
    </>;
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
