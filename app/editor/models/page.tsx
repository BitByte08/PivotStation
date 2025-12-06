'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/app/store/useStore';
import { Figure } from '@/app/types';

export default function ModelsPage() {
  const router = useRouter();
  const { updateFigure, currentFrameIndex } = useStore();

  const createStickman = (): Figure => {
    // New Structure:
    // Root = Hip Junction
    // Child = Shoulder Junction (Torso connects Hip -> Shoulder)
    // Head = Circle (Diameter: Shoulder -> HeadTop)
    // Arms = Connect to Shoulder
    // Legs = Connect to Hip

    const hipId = `p-${Date.now()}-hip`; // Root
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
        id: hipId, type: 'joint', x: 400, y: 350, children: [ // Hip Junction (Root)
          { id: shoulderId, type: 'joint', x: 400, y: 250, children: [ // Shoulder Junction
             { id: headTopId, type: 'joint', x: 400, y: 200, children: [] }, // Head Top (defines diameter with Shoulder)
             { id: lElbowId, type: 'joint', x: 360, y: 280, children: [ // Left Arm
                { id: lHandId, type: 'joint', x: 350, y: 300, children: [] }
             ]},
             { id: rElbowId, type: 'joint', x: 440, y: 280, children: [ // Right Arm
                { id: rHandId, type: 'joint', x: 450, y: 300, children: [] }
             ]}
          ]},
          { id: lKneeId, type: 'joint', x: 370, y: 400, children: [ // Left Leg
              { id: lFootId, type: 'joint', x: 370, y: 430, children: [] }
          ]},
          { id: rKneeId, type: 'joint', x: 430, y: 400, children: [ // Right Leg
              { id: rFootId, type: 'joint', x: 430, y: 430, children: [] }
          ]}
        ]
      },
      shapes: [
        { type: 'line', pivotIds: [hipId, shoulderId] }, // Torso
        { type: 'circle', pivotIds: [shoulderId, headTopId] }, // Head (Diameter)
        { type: 'line', pivotIds: [shoulderId, lElbowId] }, // L Arm 1 (Shoulder to Elbow) - Wait, arm starts at shoulder
        { type: 'line', pivotIds: [lElbowId, lHandId] },
        { type: 'line', pivotIds: [shoulderId, rElbowId] }, // R Arm 1
        { type: 'line', pivotIds: [rElbowId, rHandId] },
        { type: 'line', pivotIds: [hipId, lKneeId] }, // L Leg 1 (Hip to Knee)
        { type: 'line', pivotIds: [lKneeId, lFootId] },
        { type: 'line', pivotIds: [hipId, rKneeId] }, // R Leg 1
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
    router.back();
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Select a Model</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  );
}
