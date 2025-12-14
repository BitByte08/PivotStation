import { Figure } from '@/app/types/figure';

export const createStickman = (): Figure => {
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

  // Each segment: 40 units (45-degree angles for consistency)
  return {
    id: `fig-${Date.now()}`,
    root_pivot: {
      id: hipId,
      type: 'joint',
      x: 400,
      y: 350,
      children: [
        {
          id: shoulderId,
          type: 'joint',
          x: 400,
          y: 270,
          children: [
            { id: headTopId, type: 'joint', x: 400, y: 230, children: [] },
            {
              id: lElbowId,
              type: 'joint',
              x: 372,
              y: 298,
              children: [{ id: lHandId, type: 'joint', x: 344, y: 326, children: [] }],
            },
            {
              id: rElbowId,
              type: 'joint',
              x: 428,
              y: 298,
              children: [{ id: rHandId, type: 'joint', x: 456, y: 326, children: [] }],
            },
          ],
        },
        {
          id: lKneeId,
          type: 'joint',
          x: 370,
          y: 390,
          children: [{ id: lFootId, type: 'joint', x: 370, y: 430, children: [] }],
        },
        {
          id: rKneeId,
          type: 'joint',
          x: 430,
          y: 390,
          children: [{ id: rFootId, type: 'joint', x: 430, y: 430, children: [] }],
        },
      ],
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
    ],
  };
};

export const createSimpleStick = (): Figure => {
  const rootId = `p-${Date.now()}-root`;
  const endId = `p-${Date.now()}-end`;
  return {
    id: `fig-${Date.now()}`,
    root_pivot: {
      id: rootId,
      type: 'joint',
      x: 400,
      y: 300,
      children: [{ id: endId, type: 'joint', x: 400, y: 200, children: [] }],
    },
    shapes: [{ type: 'line', pivotIds: [rootId, endId] }],
  };
};

export const createCurve = (): Figure => {
  const rootId = `p-${Date.now()}-root`;
  const controlId = `p-${Date.now()}-control`;
  const endId = `p-${Date.now()}-end`;
  return {
    id: `fig-${Date.now()}`,
    root_pivot: {
      id: rootId,
      type: 'joint',
      x: 350,
      y: 300,
      children: [
        {
          id: controlId,
          type: 'fixed',
          x: 400,
          y: 250,
          children: [{ id: endId, type: 'joint', x: 450, y: 300, children: [] }],
        },
      ],
    },
    shapes: [{ type: 'curve', pivotIds: [rootId, controlId, endId] }],
  };
};

export const createCircle = (): Figure => {
  const rootId = `p-${Date.now()}-root`;
  const radiusId = `p-${Date.now()}-radius`;
  return {
    id: `fig-${Date.now()}`,
    root_pivot: {
      id: rootId,
      type: 'joint',
      x: 400,
      y: 300,
      children: [{ id: radiusId, type: 'joint', x: 450, y: 300, children: [] }],
    },
    shapes: [{ type: 'circle', pivotIds: [rootId, radiusId] }],
  };
};
