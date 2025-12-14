'use client';

import Stage from '@/app/components/Stage';
import ModeSwitcher from '@/app/components/ModeSwitcher';

export default function EditorPage() {
  // Pure animation editor – no editorMode or query params
  return (
    <>
      <ModeSwitcher />
      <Stage />
    </>
  );
}
