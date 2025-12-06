'use client';

import Stage from '@/app/components/Stage';
import ModeSwitcher from '@/app/components/ModeSwitcher';
import ExportModal from '@/app/editor/components/modals/ExportModal';
import SettingsModal from '@/app/editor/components/modals/SettingsModal';
import ModelsModal from '@/app/editor/components/modals/ModelsModal';
import Header from './components/layouts/Header';
import Timeline from './components/layouts/Timeline';
import { useModal } from './store/useModal';
import { useEffect } from 'react';

export default function EditorPage() {
  const { closeModal } = useModal();
  return (
      
    <>
        <section className="flex-1 w-full bg-background flex items-center justify-center relative">
            <ModeSwitcher />
            <Stage />
        </section>
    </>
  );
}
