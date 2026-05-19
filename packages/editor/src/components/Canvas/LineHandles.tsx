// 라인 위젯의 엔드포인트/관절 핸들 및 위젯 연결점 스냅 처리
import React, { useCallback, useState } from 'react';
import type { Widget, LineConnection } from '@wzhmi/core';
import { useEditorStore } from '../../store/editorStore';

const R = 7;
const SNAP_RADIUS = 20;
const CONNECTION_POINTS = ['top', 'right', 'bottom', 'left'] as const;

type Pt = { x: number; y: number };

function getConnectionPoint(w: Widget, point: string): Pt {
  const { x, y, width, height } = w.geometry;
  if (point === 'top')    return { x: x + width / 2, y };
  if (point === 'bottom') return { x: x + width / 2, y: y + height };
  if (point === 'left')   return { x, y: y + height / 2 };
  return { x: x + width, y: y + height / 2 };
}

function findNearestConnection(px: number, py: number, widgets: Widget[]): (Pt & { widgetId: string; point: string }) | null {
  let best: (Pt & { widgetId: string; point: string }) | null = null;
  let bestDist = SNAP_RADIUS;
  for (const w of widgets) {
    for (const point of CONNECTION_POINTS) {
      const cp = getConnectionPoint(w, point);
      const d = Math.hypot(px - cp.x, py - cp.y);
      if (d < bestDist) { bestDist = d; best = { ...cp, widgetId: w.id, point }; }
    }
  }
  return best;
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function nearestSegment(px: number, py: number, allPts: Pt[]): { index: number; dist: number } {
  let minDist = Infinity, minIndex = 0;
  for (let i = 0; i < allPts.length - 1; i++) {
    const d = distToSegment(px, py, allPts[i].x, allPts[i].y, allPts[i + 1].x, allPts[i + 1].y);
    if (d < minDist) { minDist = d; minIndex = i; }
  }
  return { index: minIndex, dist: minDist };
}

interface Props {
  widget: Widget;
  canvasEl: HTMLDivElement | null;
  nonLineWidgets: Widget[];
}

export const LineHandles: React.FC<Props> = ({ widget, canvasEl, nonLineWidgets }) => {
  const { moveLineEndpoint, finalizeLineEndpoint, moveWidget, addLineWaypoint, removeLineWaypoint, moveLineWaypoint, canvasScale } = useEditorStore();
  const [draggingEndpoint, setDraggingEndpoint] = useState<'start' | 'end' | null>(null);
  const [snapTarget, setSnapTarget] = useState<Pt | null>(null);

  const p = widget.properties;
  const x1 = Number(p.x1 ?? widget.geometry.x);
  const y1 = Number(p.y1 ?? widget.geometry.y);
  const x2 = Number(p.x2 ?? widget.geometry.x + widget.geometry.width);
  const y2 = Number(p.y2 ?? widget.geometry.y + widget.geometry.height);
  const waypoints = (p.waypoints as Pt[] | undefined) ?? [];
  const allPts: Pt[] = [{ x: x1, y: y1 }, ...waypoints, { x: x2, y: y2 }];
  const startConn = p.startConnection as LineConnection | undefined;
  const endConn = p.endConnection as LineConnection | undefined;

  const canvasCoords = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!canvasEl) return { cx: 0, cy: 0 };
    const rect = canvasEl.getBoundingClientRect();
    return {
      cx: (e.clientX - rect.left) / canvasScale,
      cy: (e.clientY - rect.top) / canvasScale,
    };
  }, [canvasEl, canvasScale]);

  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const { cx, cy } = canvasCoords(e);
      if (nearestSegment(cx, cy, allPts).dist > 12) return;
      e.stopPropagation();
      e.preventDefault();
      const startX = e.clientX, startY = e.clientY;
      const origX = widget.geometry.x, origY = widget.geometry.y;
      let dragging = false;
      const onMove = (me: MouseEvent) => {
        const dx = (me.clientX - startX) / canvasScale;
        const dy = (me.clientY - startY) / canvasScale;
        if (!dragging && Math.hypot(dx, dy) < 3) return;
        dragging = true;
        moveWidget(widget.id, Math.round(origX + dx), Math.round(origY + dy));
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [canvasCoords, allPts, widget.geometry, widget.id, moveWidget, canvasScale]
  );

  const handleLineDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const { cx, cy } = canvasCoords(e);
      const { index, dist } = nearestSegment(cx, cy, allPts);
      if (dist > 12) return;
      e.stopPropagation();
      e.preventDefault();
      addLineWaypoint(widget.id, index, cx, cy);
    },
    [canvasCoords, allPts, widget.id, addLineWaypoint]
  );

  const makeEndpointMouseDown = useCallback(
    (endpoint: 'start' | 'end') => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const startMouseX = e.clientX, startMouseY = e.clientY;
      const origX = endpoint === 'start' ? x1 : x2;
      const origY = endpoint === 'start' ? y1 : y2;
      setDraggingEndpoint(endpoint);
      setSnapTarget(null);
      const onMove = (me: MouseEvent) => {
        const fx = origX + (me.clientX - startMouseX) / canvasScale;
        const fy = origY + (me.clientY - startMouseY) / canvasScale;
        moveLineEndpoint(widget.id, endpoint, fx, fy);
        const snap = findNearestConnection(fx, fy, nonLineWidgets);
        setSnapTarget(snap ? { x: snap.x, y: snap.y } : null);
      };
      const onUp = (me: MouseEvent) => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        setDraggingEndpoint(null);
        setSnapTarget(null);
        const fx = origX + (me.clientX - startMouseX) / canvasScale;
        const fy = origY + (me.clientY - startMouseY) / canvasScale;
        const snap = findNearestConnection(fx, fy, nonLineWidgets);
        finalizeLineEndpoint(
          widget.id, endpoint,
          snap ? snap.x : fx,
          snap ? snap.y : fy,
          snap ? { widgetId: snap.widgetId, point: snap.point as LineConnection['point'] } : null,
        );
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [x1, y1, x2, y2, widget.id, moveLineEndpoint, finalizeLineEndpoint, canvasScale, nonLineWidgets]
  );

  const makeWaypointMouseDown = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const startMouseX = e.clientX, startMouseY = e.clientY;
      const origX = waypoints[index].x, origY = waypoints[index].y;
      const onMove = (me: MouseEvent) => {
        moveLineWaypoint(widget.id, index,
          origX + (me.clientX - startMouseX) / canvasScale,
          origY + (me.clientY - startMouseY) / canvasScale,
        );
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [waypoints, widget.id, moveLineWaypoint, canvasScale]
  );

  const polylinePoints = allPts.map(pt => `${pt.x},${pt.y}`).join(' ');

  return (
    <>
      {/* 전체 라인 드래그/더블클릭 영역 */}
      <div
        onMouseDown={handleDragMouseDown}
        onDoubleClick={handleLineDoubleClick}
        title="라인 이동 · 더블클릭으로 관절 추가"
        style={{
          position: 'absolute',
          left: widget.geometry.x,
          top: widget.geometry.y,
          width: widget.geometry.width,
          height: widget.geometry.height,
          cursor: 'move',
          pointerEvents: 'all',
          zIndex: 10000,
        }}
      />

      <svg
        style={{
          position: 'absolute', left: 0, top: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 9998,
          overflow: 'visible',
        }}
      >
        <polyline points={polylinePoints} stroke="#5599ff" strokeWidth="1.5" strokeDasharray="5 3" fill="none" />
        <circle cx={x1} cy={y1} r={R + 2} fill="none" stroke="#5599ff" strokeWidth="1.5" />
        <circle cx={x2} cy={y2} r={R + 2} fill="none" stroke="#5599ff" strokeWidth="1.5" />
        {waypoints.map((wp, i) => (
          <circle key={i} cx={wp.x} cy={wp.y} r={R} fill="none" stroke="#ffaa33" strokeWidth="1.5" strokeDasharray="3 2" />
        ))}

        {/* 엔드포인트 드래그 중: 연결 가능한 포인트 표시 */}
        {draggingEndpoint && nonLineWidgets.map((w) =>
          CONNECTION_POINTS.map((point) => {
            const cp = getConnectionPoint(w, point);
            const isSnap = snapTarget && Math.abs(cp.x - snapTarget.x) < 1 && Math.abs(cp.y - snapTarget.y) < 1;
            return (
              <circle
                key={`${w.id}-${point}`}
                cx={cp.x} cy={cp.y}
                r={isSnap ? 8 : 5}
                fill={isSnap ? '#00ffcc' : 'none'}
                stroke="#00ffcc"
                strokeWidth={isSnap ? 2 : 1.5}
                opacity={isSnap ? 1 : 0.6}
              />
            );
          })
        )}
      </svg>

      {/* 시작점 핸들 */}
      <div
        onMouseDown={makeEndpointMouseDown('start')}
        title="시작점"
        style={{
          position: 'absolute',
          left: x1 - R, top: y1 - R,
          width: R * 2, height: R * 2,
          borderRadius: '50%',
          background: startConn ? '#00cc88' : '#ffffff',
          border: `2px solid ${startConn ? '#00ffcc' : '#5599ff'}`,
          cursor: 'crosshair',
          zIndex: 10001,
        }}
      />

      {/* 끝점 핸들 */}
      <div
        onMouseDown={makeEndpointMouseDown('end')}
        title="끝점"
        style={{
          position: 'absolute',
          left: x2 - R, top: y2 - R,
          width: R * 2, height: R * 2,
          borderRadius: '50%',
          background: endConn ? '#00cc88' : '#5599ff',
          border: `2px solid ${endConn ? '#00ffcc' : '#ffffff'}`,
          cursor: 'crosshair',
          zIndex: 10001,
        }}
      />

      {/* 관절 핸들 */}
      {waypoints.map((wp, i) => (
        <div
          key={i}
          onMouseDown={makeWaypointMouseDown(i)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            removeLineWaypoint(widget.id, i);
          }}
          title="관절 · 더블클릭으로 제거"
          style={{
            position: 'absolute',
            left: wp.x - R, top: wp.y - R,
            width: R * 2, height: R * 2,
            borderRadius: '50%',
            background: '#ffaa33',
            border: '2px solid #ffffff',
            cursor: 'crosshair',
            zIndex: 10001,
          }}
        />
      ))}
    </>
  );
};
