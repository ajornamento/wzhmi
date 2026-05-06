import type { Widget, HmiSchema } from './types';

const LINE_PAD = 8;

export function defaultWidget(type: Widget['type'], id: string): Widget {
  if (type === 'LINE') {
    const x1 = 150, y1 = 200, x2 = 350, y2 = 200;
    return {
      id,
      type,
      name: `LINE-${id}`,
      geometry: {
        x: Math.min(x1, x2) - LINE_PAD,
        y: Math.min(y1, y2) - LINE_PAD,
        width: Math.abs(x2 - x1) + LINE_PAD * 2,
        height: Math.abs(y2 - y1) + LINE_PAD * 2,
        rotation: 0,
        zIndex: 1,
      },
      binding: { tagId: '', dataType: 'INT', refreshRate: 500 },
      styles: { opacity: 1, visible: true, baseColor: '#888888', animations: [] },
      actions: {},
      properties: {
        label: '', showTooltip: false,
        x1, y1, x2, y2,
        lineWidth: 2, lineStyle: 'solid', lineType: 'straight',
        arrowEnd: true, arrowStart: false,
      },
    };
  }
  return {
    id,
    type,
    name: `${type}-${id}`,
    geometry: { x: 100, y: 100, width: 120, height: 120, rotation: 0, zIndex: 1 },
    binding: { tagId: '', dataType: 'INT', refreshRate: 500 },
    styles: { opacity: 1, visible: true, baseColor: '#808080', animations: [] },
    actions: { confirmRequired: false },
    properties: { label: type, showTooltip: true },
  };
}

export { LINE_PAD };

export function emptySchema(): HmiSchema {
  return {
    v: '1.0.0',
    canvas: { width: 1920, height: 1080, backgroundColor: '#1a1a1a' },
    widgets: [],
  };
}
