import React, { useCallback } from 'react';
import type { Widget } from '@wzhmi/core';
import { useEditorStore } from '../../store/editorStore';

const GRID = 10;
function snap(v: number) { return Math.round(v / GRID) * GRID; }

const HANDLE_SIZE = 8;

type HandlePos = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLES: Array<{ pos: HandlePos; cursor: string; x: string; y: string }> = [
  { pos: 'nw', cursor: 'nw-resize', x: '0%', y: '0%' },
  { pos: 'n',  cursor: 'n-resize',  x: '50%', y: '0%' },
  { pos: 'ne', cursor: 'ne-resize', x: '100%', y: '0%' },
  { pos: 'e',  cursor: 'e-resize',  x: '100%', y: '50%' },
  { pos: 'se', cursor: 'se-resize', x: '100%', y: '100%' },
  { pos: 's',  cursor: 's-resize',  x: '50%', y: '100%' },
  { pos: 'sw', cursor: 'sw-resize', x: '0%', y: '100%' },
  { pos: 'w',  cursor: 'w-resize',  x: '0%', y: '50%' },
];

interface Props {
  widget: Widget;
}

export const SelectionHandles: React.FC<Props> = ({ widget }) => {
  const { resizeWidget, moveWidget, canvasScale } = useEditorStore();
  const { geometry } = widget;

  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = geometry.x;
      const origY = geometry.y;
      let dragging = false;

      const onMove = (me: MouseEvent) => {
        const dx = (me.clientX - startX) / canvasScale;
        const dy = (me.clientY - startY) / canvasScale;
        if (!dragging && Math.hypot(dx, dy) < 3) return;
        dragging = true;
        moveWidget(widget.id, snap(origX + dx), snap(origY + dy));
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [geometry, widget.id, moveWidget, canvasScale]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, pos: HandlePos) => {
      e.stopPropagation();
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = geometry.width;
      const startH = geometry.height;

      const onMove = (me: MouseEvent) => {
        const dx = (me.clientX - startX) / canvasScale;
        const dy = (me.clientY - startY) / canvasScale;
        let newW = startW, newH = startH;
        if (pos.includes('e')) newW = startW + dx;
        if (pos.includes('w')) newW = startW - dx;
        if (pos.includes('s')) newH = startH + dy;
        if (pos.includes('n')) newH = startH - dy;
        resizeWidget(widget.id, newW, newH);
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [geometry, widget.id, resizeWidget, canvasScale]
  );

  return (
    <div style={{
      position: 'absolute',
      left: geometry.x - 1,
      top: geometry.y - 1,
      width: geometry.width + 2,
      height: geometry.height + 2,
      border: '2px solid #5599ff',
      pointerEvents: 'none',
      zIndex: 10000,
      boxSizing: 'border-box',
    }}>
      {/* 선택된 위젯 전체를 덮는 드래그 존 — 겹친 위젯보다 위에 있어 항상 이동 가능 */}
      <div
        onMouseDown={handleDragMouseDown}
        style={{
          position: 'absolute',
          inset: 0,
          cursor: 'move',
          pointerEvents: 'all',
        }}
      />
      {HANDLES.map(({ pos, cursor, x, y }) => (
        <div
          key={pos}
          onMouseDown={(e) => handleResizeMouseDown(e, pos)}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: '#fff',
            border: '1.5px solid #5599ff',
            borderRadius: 1,
            transform: 'translate(-50%, -50%)',
            cursor,
            pointerEvents: 'all',
          }}
        />
      ))}
    </div>
  );
};
