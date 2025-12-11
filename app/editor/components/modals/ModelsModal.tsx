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
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90vw] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Select a Model</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <button onClick={() => handleSelect('stickman')} className="p-6 border rounded hover:bg-gray-50 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-200 mb-2 rounded-full"></div>
            <span>Stickman</span>
          </button>
          <button onClick={() => handleSelect('simple')} className="p-6 border rounded hover:bg-gray-50 flex flex-col items-center">
            <div className="w-1 h-16 bg-black mb-2"></div>
            <span>Simple Stick</span>
          </button>
          <button onClick={() => handleSelect('curve')} className="p-6 border rounded hover:bg-gray-50 flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-black rounded-full mb-2"></div>
            <span>Curve</span>
          </button>
          <button onClick={() => handleSelect('circle')} className="p-6 border rounded hover:bg-gray-50 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-black rounded-full mb-2"></div>
            <span>Circle</span>
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
