import React, { useRef, useCallback, useEffect, useState } from 'react';
import type { Widget, WidgetType } from '@wzhmi/core';
import { WIDGET_TAG_MAP } from '@wzhmi/widgets';
import type { BaseWidget } from '@wzhmi/widgets';
import { useEditorStore } from '../../store/editorStore';
import { SelectionHandles } from './SelectionHandles';
import { LineHandles } from './LineHandles';

const GRID = 10;
const PAD = 24;

function snap(v: number) {
  return Math.round(v / GRID) * GRID;
}

function applyEditorStyle(el: BaseWidget, widget: Widget) {
  el.configure(widget);
  el.style.position = 'absolute';
  el.style.left = '0';
  el.style.top = '0';
  el.style.width = '100%';
  el.style.height = '100%';
  el.style.transform = '';
  el.style.zIndex = '';
  el.style.opacity = String(widget.styles.opacity);
  el.style.display = widget.styles.visible ? 'block' : 'none';

  const pv = widget.properties.previewValue;
  if (pv !== undefined && pv !== null && pv !== '') {
    const s = String(pv);
    let val: number | string | boolean;
    if (s === 'true') val = true;
    else if (s === 'false') val = false;
    else if (!isNaN(Number(s))) val = Number(s);
    else val = s;
    el.setValue(val);
  } else {
    el.setValue(0);
  }
}

function createFallbackWidgetContainer(widget: Widget) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = widget.styles.visible ? 'block' : 'none';
  container.style.opacity = String(widget.styles.opacity);
  container.style.backgroundColor = 'transparent';
  container.style.overflow = 'hidden';

  const imageData = widget.properties.imageData as string | undefined;
  const imageUrl = widget.properties.imageUrl as string | undefined;
  const imageSrc = imageData || imageUrl;

  if (imageSrc) {
    const imageLayer = document.createElement('div');
    imageLayer.className = 'fallback-image-layer';
    imageLayer.style.position = 'absolute';
    imageLayer.style.top = '0';
    imageLayer.style.left = '0';
    imageLayer.style.width = '100%';
    imageLayer.style.height = '100%';
    imageLayer.style.backgroundImage = `url(${imageSrc})`;
    imageLayer.style.backgroundSize = 'contain';
    imageLayer.style.backgroundPosition = 'top center';
    imageLayer.style.backgroundRepeat = 'no-repeat';
    imageLayer.style.pointerEvents = 'none';
    container.appendChild(imageLayer);
  } else {
    const label = document.createElement('div');
    const rotation = widget.geometry.rotation || 0;
    label.textContent = String(widget.properties.label || widget.type || '커스텀 위젯');
    label.style.color = '#ddd';
    label.style.fontSize = '12px';
    label.style.textAlign = 'center';
    label.style.padding = '8px';
    label.style.pointerEvents = 'none';
    label.style.transform = rotation ? `rotate(${-rotation}deg)` : '';
    label.style.transformOrigin = 'center center';
    container.appendChild(label);
  }

  return container;
}

const WidgetPreview: React.FC<{
  widget: Widget;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}> = ({ widget, isSelected, scale, onSelect, onMove }) => {
  const elRef = useRef<HTMLDivElement>(null);
  const webCompRef = useRef<BaseWidget | null>(null);

  useEffect(() => {
    const container = elRef.current;
    if (!container) return;
    container.innerHTML = '';
    const tagName = WIDGET_TAG_MAP[widget.type];
    if (tagName) {
      const el = document.createElement(tagName) as BaseWidget;
      applyEditorStyle(el, widget);
      container.appendChild(el);
      webCompRef.current = el;
    } else {
      const fallback = createFallbackWidgetContainer(widget);
      container.appendChild(fallback);
      webCompRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget.type]);

  useEffect(() => {
    const el = webCompRef.current;
    if (!el) {
      const container = elRef.current;
      if (!container) return;
      const fallback = container.firstElementChild as HTMLElement | null;
      if (!fallback) return;
      const imageData = widget.properties.imageData as string | undefined;
      const imageUrl = widget.properties.imageUrl as string | undefined;
      const imageSrc = imageData || imageUrl;
      const imageLayer = fallback.querySelector('.fallback-image-layer') as HTMLElement | null;
      const label = fallback.querySelector('div');
      if (imageSrc) {
        if (imageLayer) {
          imageLayer.style.backgroundImage = `url(${imageSrc})`;
        } else {
          fallback.innerHTML = '';
          const newImageLayer = document.createElement('div');
          newImageLayer.className = 'fallback-image-layer';
          newImageLayer.style.position = 'absolute';
          newImageLayer.style.top = '0';
          newImageLayer.style.left = '0';
          newImageLayer.style.width = '100%';
          newImageLayer.style.height = '100%';
          newImageLayer.style.backgroundImage = `url(${imageSrc})`;
          newImageLayer.style.backgroundSize = 'contain';
          newImageLayer.style.backgroundPosition = 'top center';
          newImageLayer.style.backgroundRepeat = 'no-repeat';
          newImageLayer.style.pointerEvents = 'none';
          fallback.appendChild(newImageLayer);
        }
      } else {
        if (imageLayer) {
          fallback.removeChild(imageLayer);
        }
        const rotation = widget.geometry.rotation || 0;
        if (label) {
          label.textContent = String(widget.properties.label || widget.type || '커스텀 위젯');
          label.style.transform = rotation ? `rotate(${-rotation}deg)` : '';
          label.style.transformOrigin = 'center center';
        } else {
          const newLabel = document.createElement('div');
          newLabel.textContent = String(widget.properties.label || widget.type || '커스텀 위젯');
          newLabel.style.color = '#ddd';
          newLabel.style.fontSize = '12px';
          newLabel.style.textAlign = 'center';
          newLabel.style.padding = '8px';
          newLabel.style.pointerEvents = 'none';
          newLabel.style.transform = rotation ? `rotate(${-rotation}deg)` : '';
          newLabel.style.transformOrigin = 'center center';
          fallback.appendChild(newLabel);
        }
      }
      return;
    }
    applyEditorStyle(el, widget);
  }, [widget]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      onSelect();

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = widget.geometry.x;
      const origY = widget.geometry.y;
      let dragging = false;

      const handleMouseMove = (me: MouseEvent) => {
        const dx = (me.clientX - startX) / scale;
        const dy = (me.clientY - startY) / scale;
        if (!dragging && Math.hypot(dx, dy) < 3) return;
        dragging = true;
        onMove(snap(origX + dx), snap(origY + dy));
      };
      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [widget, scale, onSelect, onMove]
  );

  const { x, y, width, height, rotation, zIndex } = widget.geometry;

  return (
    <div
      ref={elRef}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: x, top: y, width, height,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        zIndex,
        cursor: 'move',
        outline: isSelected ? '2px solid #5599ff' : '1px solid transparent',
      }}
    />
  );
};

export const EditorCanvas: React.FC = () => {
  const { schema, selectedId, selectWidget, moveWidget, addWidget, setCanvasScale } = useEditorStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const { canvas, widgets } = schema;

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 컨테이너 크기 변화 또는 설계 해상도 변화 시 스케일 재계산
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;
      const s = Math.max(0.05, Math.min(
        (cw - PAD * 2) / canvas.width,
        (ch - PAD * 2) / canvas.height,
      ));
      setScale(s);
      setCanvasScale(s);
      setOffset({
        x: Math.max(PAD, (cw - canvas.width * s) / 2),
        y: Math.max(PAD, (ch - canvas.height * s) / 2),
      });
    };
    compute();
    const obs = new ResizeObserver(compute);
    obs.observe(el);
    return () => obs.disconnect();
  }, [canvas.width, canvas.height, setCanvasScale]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('widget-type') as WidgetType;
      if (!type) return;
      const metadataJson = e.dataTransfer.getData('widget-metadata');
      const customProps = metadataJson ? JSON.parse(metadataJson) : undefined;
      addWidget(type, customProps);
    },
    [addWidget]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
        || (e.target as HTMLElement).isContentEditable;

      if (isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        useEditorStore.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
      if (!isEditing && (e.key === 'Delete' || e.key === 'Backspace')) {
        const { selectedId } = useEditorStore.getState();
        if (selectedId) useEditorStore.getState().removeWidget(selectedId);
      }
      if (!isEditing && e.key === 'Tab') {
        e.preventDefault();
        const { schema, selectedId } = useEditorStore.getState();
        const all = [...schema.widgets].sort((a, b) => a.geometry.zIndex - b.geometry.zIndex);
        if (all.length === 0) return;
        const currentIdx = all.findIndex((w) => w.id === selectedId);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + all.length) % all.length
          : (currentIdx + 1) % all.length;
        useEditorStore.getState().selectWidget(all[nextIdx].id);
      }
      if (!isEditing && e.key === 'Escape') {
        useEditorStore.getState().selectWidget(null);
      }
      if (!isEditing && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const { selectedId, schema } = useEditorStore.getState();
        if (!selectedId) return;
        const w = schema.widgets.find((ww) => ww.id === selectedId);
        if (!w) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        useEditorStore.getState().moveWidget(selectedId, w.geometry.x + dx, w.geometry.y + dy);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const sortedWidgets = [...widgets].sort((a, b) => a.geometry.zIndex - b.geometry.zIndex);
  const selectedWidget = widgets.find((w) => w.id === selectedId);

  return (
    <div
      ref={outerRef}
      style={{
        flex: 1,
        overflow: 'hidden',
        background: '#111118',
        position: 'relative',
      }}
    >
      {/* 스케일 변환 레이어: 설계 좌표계와 화면 좌표계를 분리 */}
      <div
        style={{
          position: 'absolute',
          left: offset.x,
          top: offset.y,
          width: canvas.width,
          height: canvas.height,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* 실제 캔버스 */}
        <div
          ref={canvasRef}
          onClick={() => selectWidget(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: canvas.width,
            height: canvas.height,
            backgroundColor: canvas.backgroundColor,
            boxShadow: '0 0 0 1px #444, 0 8px 32px rgba(0,0,0,0.5)',
            backgroundImage: [
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              ...(canvas.backgroundImage ? [`url(${canvas.backgroundImage})`] : []),
            ].join(', '),
            backgroundSize: canvas.backgroundImage
              ? `${GRID * 5}px ${GRID * 5}px, ${GRID * 5}px ${GRID * 5}px, ${canvas.backgroundImageFit ?? 'cover'}`
              : `${GRID * 5}px ${GRID * 5}px`,
            backgroundPosition: canvas.backgroundImage ? 'top left, top left, center' : 'top left',
            backgroundRepeat: canvas.backgroundImage ? 'repeat, repeat, no-repeat' : 'repeat',
            overflow: 'hidden',
          }}
        >
          {sortedWidgets.map((widget) => (
            <WidgetPreview
              key={widget.id}
              widget={widget}
              scale={scale}
              isSelected={widget.id === selectedId}
              onSelect={() => selectWidget(widget.id)}
              onMove={(x, y) => moveWidget(widget.id, x, y)}
            />
          ))}
        </div>

        {/* 핸들은 캔버스 overflow:hidden 바깥에 위치하되, 동일한 스케일 변환 안에 있음 */}
        {selectedWidget && selectedWidget.type !== 'LINE' && (
          <SelectionHandles widget={selectedWidget} />
        )}
        {selectedWidget && selectedWidget.type === 'LINE' && (
          <LineHandles
            widget={selectedWidget}
            canvasEl={canvasRef.current}
            nonLineWidgets={widgets.filter((w) => w.type !== 'LINE')}
          />
        )}
      </div>

      {/* 스케일 표시 */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          fontSize: 10,
          color: '#445',
          background: '#0a0a14',
          padding: '2px 8px',
          borderRadius: 3,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {Math.round(scale * 100)}% · {canvas.width} × {canvas.height}
      </div>
    </div>
  );
};
