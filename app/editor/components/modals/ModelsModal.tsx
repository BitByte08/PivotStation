'use client';

import React from 'react';
import { useStore } from '@/app/store/useStore';
import { Figure } from '@/app/types';
import useModal from '@/app/editor/store/useModal';
import ModalContainer from '@/app/components/containers/ModalContainer';

export default function ModelsModal() {
  const { updateFigure, currentFrameIndex } = useStore();
  const { closeModal } = useModal();
  const createStickman = (): Figure => {
    const hipId = `p-${Date.now()}-hip`;
    const shoulderId = `p-${Date.now()}-shoulder`;
    const headTopId = `p-${Date.now()}-head-top`;
    const lElbowId = `p-${Date.now()}-le`;
    const rElbowId = `p-${Date.now()}-re`;
    const lHandId = `p-${Date.now()}-lh`;
    const rHandId = `p-${Date.now()}-rh`;
    const lKneeId = `p-${Date.now()}-lk`;
    const rKneeId = `p-${Date.now()}-rk`;
    const lFootId = `p-${Date.now()}-lf`;
    const rFootId = `p-${Date.now()}-rf`;

    return {
      id: `fig-${Date.now()}`,
      root_pivot: {
        id: hipId, type: 'joint', x: 400, y: 350, children: [
          { id: shoulderId, type: 'joint', x: 400, y: 250, children: [
             { id: headTopId, type: 'joint', x: 400, y: 200, children: [] },
             { id: lElbowId, type: 'joint', x: 360, y: 280, children: [
                { id: lHandId, type: 'joint', x: 350, y: 300, children: [] }
             ]},
             { id: rElbowId, type: 'joint', x: 440, y: 280, children: [
                { id: rHandId, type: 'joint', x: 450, y: 300, children: [] }
             ]}
          ]},
          { id: lKneeId, type: 'joint', x: 370, y: 400, children: [
              { id: lFootId, type: 'joint', x: 370, y: 430, children: [] }
          ]},
          { id: rKneeId, type: 'joint', x: 430, y: 400, children: [
              { id: rFootId, type: 'joint', x: 430, y: 430, children: [] }
          ]}
        ]
      },
      shapes: [
        { type: 'line', pivotIds: [hipId, shoulderId] },
        { type: 'circle', pivotIds: [shoulderId, headTopId] },
        { type: 'line', pivotIds: [shoulderId, lElbowId] },
        { type: 'line', pivotIds: [lElbowId, lHandId] },
        { type: 'line', pivotIds: [shoulderId, rElbowId] },
        { type: 'line', pivotIds: [rElbowId, rHandId] },
        { type: 'line', pivotIds: [hipId, lKneeId] },
        { type: 'line', pivotIds: [lKneeId, lFootId] },
        { type: 'line', pivotIds: [hipId, rKneeId] },
        { type: 'line', pivotIds: [rKneeId, rFootId] },
      ]
    };
  };

  const createSimpleStick = (): Figure => {
    const rootId = `p-${Date.now()}-root`;
    const endId = `p-${Date.now()}-end`;
    return {
      id: `fig-${Date.now()}`,
      root_pivot: {
        id: rootId, type: 'joint', x: 400, y: 300, children: [
          { id: endId, type: 'joint', x: 400, y: 200, children: [] }
        ]
      },
      shapes: [
        { type: 'line', pivotIds: [rootId, endId] }
      ]
    };
  };

  const createCurve = (): Figure => {
    const rootId = `p-${Date.now()}-root`;
    const controlId = `p-${Date.now()}-control`;
    const endId = `p-${Date.now()}-end`;
    return {
      id: `fig-${Date.now()}`,
      root_pivot: {
        id: rootId, type: 'joint', x: 350, y: 300, children: [
          { id: controlId, type: 'joint', x: 400, y: 250, children: [
             { id: endId, type: 'joint', x: 450, y: 300, children: [] }
          ]}
        ]
      },
      shapes: [
        { type: 'curve', pivotIds: [rootId, controlId, endId] }
      ]
    };
  };

  const createCircle = (): Figure => {
    const rootId = `p-${Date.now()}-root`;
    const radiusId = `p-${Date.now()}-radius`;
    return {
      id: `fig-${Date.now()}`,
      root_pivot: {
        id: rootId, type: 'joint', x: 400, y: 300, children: [
          { id: radiusId, type: 'joint', x: 450, y: 300, children: [] }
        ]
      },
      shapes: [
        { type: 'circle', pivotIds: [rootId, radiusId] }
      ]
    };
  };

  const handleSelect = (type: 'stickman' | 'simple' | 'curve' | 'circle') => {
    let figure: Figure;
    switch (type) {
      case 'stickman': figure = createStickman(); break;
      case 'simple': figure = createSimpleStick(); break;
      case 'curve': figure = createCurve(); break;
      case 'circle': figure = createCircle(); break;
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
