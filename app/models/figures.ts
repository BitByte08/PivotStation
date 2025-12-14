import { Figure, Pivot, Shape } from '@/app/types/figure';

// Helper to convert hierarchical root_pivot into flat pivots + parentMap
const buildFlat = (root: Pivot): { pivots: Pivot[]; parentMap: Record<string, string | null> } => {
  const pivots: Pivot[] = [];
  const parentMap: Record<string, string | null> = {};

  const walk = (node: Pivot, parentId: string | null) => {
    const { children, ...rest } = node;
    // push node (preserve optional children for runtime renderers)
    pivots.push({ ...rest, children });
    parentMap[node.id] = parentId;
    (children || []).forEach(child => walk(child, node.id));
  };

  walk(root, null);
  return { pivots, parentMap };
};

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
  const root_pivot: Pivot = {
      id: hipId,
      type: 'joint',
      x: 400,
      y: 350,
      children: [
        {
          id: shoulderId,
          type: 'joint',
          x: 400,
          y: 254,
          children: [
            { id: headTopId, type: 'joint', x: 400, y: 206, children: [] },
            {
              id: lElbowId,
              type: 'joint',
              x: 366,
              y: 288,
              children: [{ id: lHandId, type: 'joint', x: 333, y: 321, children: [] }],
            },
            {
              id: rElbowId,
              type: 'joint',
              x: 434,
              y: 288,
              children: [{ id: rHandId, type: 'joint', x: 467, y: 321, children: [] }],
            },
          ],
        },
        {
          id: lKneeId,
          type: 'joint',
          x: 364,
          y: 398,
          children: [{ id: lFootId, type: 'joint', x: 364, y: 446, children: [] }],
        },
        {
          id: rKneeId,
          type: 'joint',
          x: 436,
          y: 398,
          children: [{ id: rFootId, type: 'joint', x: 436, y: 446, children: [] }],
        },
      ],
    };
  const shapes: Shape[] = [
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
    ];
  const { pivots, parentMap } = buildFlat(root_pivot);
  return { id: `fig-${Date.now()}`, root_pivot, shapes, pivots, parentMap };
};

export const createSimpleStick = (): Figure => {
  const rootId = `p-${Date.now()}-root`;
  const endId = `p-${Date.now()}-end`;
  const root_pivot: Pivot = {
      id: rootId,
      type: 'joint',
      x: 400,
      y: 300,
      children: [{ id: endId, type: 'joint', x: 400, y: 200, children: [] }],
    };
  const shapes: Shape[] = [{ type: 'line', pivotIds: [rootId, endId] }];
  const { pivots, parentMap } = buildFlat(root_pivot);
  return { id: `fig-${Date.now()}`, root_pivot, shapes, pivots, parentMap };
};

export const createCurve = (): Figure => {
  const rootId = `p-${Date.now()}-root`;
  const controlId = `p-${Date.now()}-control`;
  const endId = `p-${Date.now()}-end`;
  const root_pivot: Pivot = {
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
          children: [{ id: endId, type: 'fixed', x: 450, y: 300, children: [] }],
        },
      ],
    };
  const shapes: Shape[] = [{ type: 'curve', pivotIds: [rootId, controlId, endId] }];
  const { pivots, parentMap } = buildFlat(root_pivot);
  return { id: `fig-${Date.now()}`, root_pivot, shapes, pivots, parentMap };
};

export const createCircle = (): Figure => {
  const rootId = `p-${Date.now()}-root`;
  const radiusId = `p-${Date.now()}-radius`;
  const root_pivot: Pivot = {
      id: rootId,
      type: 'joint',
      x: 400,
      y: 300,
      children: [{ id: radiusId, type: 'joint', x: 450, y: 300, children: [] }],
    };
  const shapes: Shape[] = [{ type: 'circle', pivotIds: [rootId, radiusId] }];
  const { pivots, parentMap } = buildFlat(root_pivot);
  return { id: `fig-${Date.now()}`, root_pivot, shapes, pivots, parentMap };
};
