'use client';

import React from 'react';
import { useStore } from '@/app/store/useStore';
import { createStickman, createSimpleStick, createCurve, createCircle } from '@/app/models/figures';
import useModal from '@/app/editor/store/useModal';
import ModalContainer from '@/app/components/containers/ModalContainer';

export default function ModelsModal() {
  const { updateFigure, currentFrameIndex } = useStore();
  const { closeModal } = useModal();

  const handleSelect = (type: 'stickman' | 'simple' | 'curve' | 'circle') => {
    let figure;
    switch (type) {
      case 'stickman':
        figure = createStickman();
        break;
      case 'simple':
        figure = createSimpleStick();
        break;
      case 'curve':
        figure = createCurve();
        break;
      case 'circle':
        figure = createCircle();
        break;
    }
    updateFigure(currentFrameIndex, figure);
    closeModal();
  };

  return (
    <ModalContainer>
      <div className="bg-surface rounded-2xl rounded-l-none shadow-sm w-96 max-w-[90vw] h-full overflow-auto flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-foreground/10">
          <h2 className="text-xl font-bold text-foreground">Select a Model</h2>
          <button onClick={closeModal} className="text-foreground/50 hover:text-foreground transition-colors">✕</button>
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-auto">
          <button onClick={() => handleSelect('stickman')} className="p-4 border border-foreground/20 rounded-lg bg-background hover:border-foreground/40 transition-colors flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">🕴</div>
            <div className="text-left">
              <div className="text-sm font-medium">Stickman</div>
              <div className="text-xs text-foreground/60">Basic humanoid rig</div>
            </div>
          </button>
          <button onClick={() => handleSelect('simple')} className="p-4 border border-foreground/20 rounded-lg bg-background hover:border-foreground/40 transition-colors flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 bg-foreground/10 rounded flex items-center justify-center">│</div>
            <div className="text-left">
              <div className="text-sm font-medium">Simple Stick</div>
              <div className="text-xs text-foreground/60">Single segment stick</div>
            </div>
          </button>
          <button onClick={() => handleSelect('curve')} className="p-4 border border-foreground/20 rounded-lg bg-background hover:border-foreground/40 transition-colors flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 bg-foreground/10 rounded flex items-center justify-center">~</div>
            <div className="text-left">
              <div className="text-sm font-medium">Curve</div>
              <div className="text-xs text-foreground/60">Curved segment</div>
            </div>
          </button>
          <button onClick={() => handleSelect('circle')} className="p-4 border border-foreground/20 rounded-lg bg-background hover:border-foreground/40 transition-colors flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center">◯</div>
            <div className="text-left">
              <div className="text-sm font-medium">Circle</div>
              <div className="text-xs text-foreground/60">Circle shape</div>
            </div>
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
