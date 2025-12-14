'use client';

import React, { useState } from 'react';
import { useStore } from '@/app/store/useStore';
import { createStickman, createSimpleStick, createCurve, createCircle } from '@/app/models/figures';
import useModal from '@/app/editor/store/useModal';
import ModalContainer from '@/app/components/containers/ModalContainer';
import CustomFiguresModal from './CustomFiguresModal';
import { Figure } from '@/app/types';

export default function ModelsModal() {
  const { updateFigure, currentFrameIndex } = useStore();
  const { closeModal } = useModal();
  const [showCustomFigures, setShowCustomFigures] = useState(false);

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
  
  const handleCustomFigureSelect = (figure: Figure) => {
    // Generate new ID for the figure instance
    const newFigure = {
      ...figure,
      id: `figure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    updateFigure(currentFrameIndex, newFigure);
    closeModal();
  };

  if (showCustomFigures) {
    return (
      <CustomFiguresModal
        onClose={() => setShowCustomFigures(false)}
        onSelectFigure={handleCustomFigureSelect}
      />
    );
  }

  return (
    <ModalContainer>
      <div className="bg-surface rounded-2xl rounded-l-none shadow-sm w-96 max-w-[90vw] h-full overflow-auto flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-foreground/10">
          <h2 className="text-xl font-bold text-foreground">모델 추가 (Add Model)</h2>
          <button onClick={closeModal} className="text-foreground/50 hover:text-foreground transition-colors">✕</button>
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-auto">
          {/* Custom Figures Button */}
          <button 
            onClick={() => setShowCustomFigures(true)} 
            className="p-4 border-2 border-purple-500 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-3 text-foreground"
          >
            <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
              ★
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-purple-700">커스텀 피규어 (Custom Figures)</div>
              <div className="text-xs text-purple-600">저장된 커스텀 피규어 불러오기</div>
            </div>
          </button>
          
          <div className="border-t border-foreground/10 my-2"></div>
          
          <button onClick={() => handleSelect('stickman')} className="p-4 border border-foreground/20 rounded-lg bg-background hover:border-foreground/40 transition-colors flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">🕴</div>
            <div className="text-left">
              <div className="text-sm font-medium">스틱맨 (Stickman)</div>
              <div className="text-xs text-foreground/60">기본 인간형 모델</div>
            </div>
          </button>
          <button onClick={() => handleSelect('simple')} className="p-4 border border-foreground/20 rounded-lg bg-background hover:border-foreground/40 transition-colors flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 bg-foreground/10 rounded flex items-center justify-center">│</div>
            <div className="text-left">
              <div className="text-sm font-medium">단순 막대 (Simple Stick)</div>
              <div className="text-xs text-foreground/60">하나의 관절이 있는 막대</div>
            </div>
          </button>
          <button onClick={() => handleSelect('curve')} className="p-4 border border-foreground/20 rounded-lg bg-background hover:border-foreground/40 transition-colors flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 bg-foreground/10 rounded flex items-center justify-center">~</div>
            <div className="text-left">
              <div className="text-sm font-medium">곡선 (Curve)</div>
              <div className="text-xs text-foreground/60">부드러운 곡선 형태</div>
            </div>
          </button>
          <button onClick={() => handleSelect('circle')} className="p-4 border border-foreground/20 rounded-lg bg-background hover:border-foreground/40 transition-colors flex items-center gap-3 text-foreground">
            <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center">◯</div>
            <div className="text-left">
              <div className="text-sm font-medium">원 (Circle)</div>
              <div className="text-xs text-foreground/60">단순 원형 모델</div>
            </div>
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
