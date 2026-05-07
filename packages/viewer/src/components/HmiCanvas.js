import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useCallback, useState } from 'react';
import { WIDGET_TAG_MAP } from '@wzhmi/widgets';
import { DataBindingEngine } from '../engine/DataBindingEngine';
import { ConfirmDialog } from './ConfirmDialog';
import { useViewerStore } from '../store/viewerStore';
export const HmiCanvas = () => {
    const { schema, serverUrl, scale, setScale, currentUser } = useViewerStore();
    const containerRef = useRef(null);
    const outerRef = useRef(null);
    const engineRef = useRef(null);
    const widgetRefs = useRef(new Map());
    const [confirm, setConfirm] = useState(null);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
    // 컨테이너 크기 추적 + 캔버스 크기 변경 시 자동 스케일 재계산
    useEffect(() => {
        const el = outerRef.current;
        if (!el)
            return;
        const compute = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (!w || !h)
                return;
            setContainerSize({ w, h });
            const s = Math.max(0.05, Math.min(w / schema.canvas.width, h / schema.canvas.height));
            setScale(s);
        };
        compute();
        const obs = new ResizeObserver(compute);
        obs.observe(el);
        return () => obs.disconnect();
    }, [schema.canvas.width, schema.canvas.height, setScale]);
    // offset은 현재 scale과 컨테이너 크기로 실시간 계산 (수동 zoom에도 반응)
    const offsetX = Math.max(0, (containerSize.w - schema.canvas.width * scale) / 2);
    const offsetY = Math.max(0, (containerSize.h - schema.canvas.height * scale) / 2);
    const handleWidgetClick = useCallback((widget) => {
        if (widget.actions.role && widget.actions.role !== currentUser.role) {
            alert(`이 동작은 ${widget.actions.role} 권한이 필요합니다.`);
            return;
        }
        const action = widget.actions.onClick;
        if (!action)
            return;
        if (widget.actions.confirmRequired) {
            setConfirm({
                message: `[${widget.name}] ${action} 작업을 실행하시겠습니까?`,
                action,
                widgetName: widget.name,
                onConfirm: () => {
                    console.log(`[HMI Action] ${widget.id}: ${action}`);
                    setConfirm(null);
                },
            });
        }
        else {
            console.log(`[HMI Action] ${widget.id}: ${action}`);
        }
    }, [currentUser.role]);
    useEffect(() => {
        const engine = new DataBindingEngine(serverUrl);
        engineRef.current = engine;
        engine.connect();
        return () => engine.disconnect();
    }, [serverUrl]);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        container.innerHTML = '';
        widgetRefs.current.clear();
        const engine = engineRef.current;
        const { canvas, widgets } = schema;
        container.style.width = `${canvas.width}px`;
        container.style.height = `${canvas.height}px`;
        container.style.backgroundColor = canvas.backgroundColor;
        if (canvas.backgroundImage) {
            container.style.backgroundImage = `url(${canvas.backgroundImage})`;
            container.style.backgroundSize = 'cover';
        }
        else {
            container.style.backgroundImage = '';
        }
        const sorted = [...widgets].sort((a, b) => a.geometry.zIndex - b.geometry.zIndex);
        for (const widget of sorted) {
            if (!widget.styles.visible)
                continue;
            const tagName = WIDGET_TAG_MAP[widget.type];
            if (!tagName)
                continue;
            const el = document.createElement(tagName);
            el.configure(widget);
            if (widget.actions.onClick || widget.actions.confirmRequired) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => handleWidgetClick(widget));
            }
            if (widget.properties.showTooltip) {
                el.title = `${widget.name}\n태그: ${widget.binding.tagId}`;
            }
            container.appendChild(el);
            widgetRefs.current.set(widget.id, el);
            if (widget.binding.tagId && engine) {
                engine.subscribe(widget.binding.tagId, (value) => {
                    el.setValue(value);
                });
            }
        }
    }, [schema, handleWidgetClick]);
    const { canvas } = schema;
    return (_jsxs("div", { ref: outerRef, style: {
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            background: '#111',
        }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    left: offsetX,
                    top: offsetY,
                    width: canvas.width,
                    height: canvas.height,
                    transform: `scale(${scale})`,
                    transformOrigin: '0 0',
                }, children: _jsx("div", { ref: containerRef, style: {
                        width: canvas.width,
                        height: canvas.height,
                        position: 'relative',
                        overflow: 'hidden',
                    } }) }), confirm && (_jsx(ConfirmDialog, { message: confirm.message, onConfirm: confirm.onConfirm, onCancel: () => setConfirm(null) }))] }));
};
