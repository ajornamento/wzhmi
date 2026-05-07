import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
const R = 7;
function distToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0)
        return Math.hypot(px - ax, py - ay);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
export const LineHandles = ({ widget, canvasEl }) => {
    const { moveLineEndpoint, moveWidget, canvasScale } = useEditorStore();
    const p = widget.properties;
    const x1 = Number(p.x1 ?? widget.geometry.x);
    const y1 = Number(p.y1 ?? widget.geometry.y);
    const x2 = Number(p.x2 ?? widget.geometry.x + widget.geometry.width);
    const y2 = Number(p.y2 ?? widget.geometry.y + widget.geometry.height);
    const handleDragMouseDown = useCallback((e) => {
        if (e.button !== 0)
            return;
        if (canvasEl) {
            const rect = canvasEl.getBoundingClientRect();
            const cx = (e.clientX - rect.left) / canvasScale;
            const cy = (e.clientY - rect.top) / canvasScale;
            if (distToSegment(cx, cy, x1, y1, x2, y2) > 12)
                return;
        }
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const origX = widget.geometry.x;
        const origY = widget.geometry.y;
        let dragging = false;
        const onMove = (me) => {
            const dx = (me.clientX - startX) / canvasScale;
            const dy = (me.clientY - startY) / canvasScale;
            if (!dragging && Math.hypot(dx, dy) < 3)
                return;
            dragging = true;
            moveWidget(widget.id, Math.round(origX + dx), Math.round(origY + dy));
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [canvasEl, x1, y1, x2, y2, widget.geometry, widget.id, moveWidget, canvasScale]);
    const makeMouseDown = useCallback((endpoint) => (e) => {
        e.stopPropagation();
        e.preventDefault();
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const origX = endpoint === 'start' ? x1 : x2;
        const origY = endpoint === 'start' ? y1 : y2;
        const handleMove = (me) => {
            const nx = origX + (me.clientX - startMouseX) / canvasScale;
            const ny = origY + (me.clientY - startMouseY) / canvasScale;
            moveLineEndpoint(widget.id, endpoint, nx, ny);
        };
        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
    }, [x1, y1, x2, y2, widget.id, moveLineEndpoint, canvasScale]);
    return (_jsxs(_Fragment, { children: [_jsx("div", { onMouseDown: handleDragMouseDown, title: "\uB77C\uC778 \uC774\uB3D9", style: {
                    position: 'absolute',
                    left: widget.geometry.x,
                    top: widget.geometry.y,
                    width: widget.geometry.width,
                    height: widget.geometry.height,
                    cursor: 'move',
                    pointerEvents: 'all',
                    zIndex: 10000,
                } }), _jsxs("svg", { style: {
                    position: 'absolute', left: 0, top: 0,
                    width: '100%', height: '100%',
                    pointerEvents: 'none', zIndex: 9998,
                    overflow: 'visible',
                }, children: [_jsx("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#5599ff", strokeWidth: "1.5", strokeDasharray: "5 3" }), _jsx("circle", { cx: x1, cy: y1, r: R + 2, fill: "none", stroke: "#5599ff", strokeWidth: "1.5" }), _jsx("circle", { cx: x2, cy: y2, r: R + 2, fill: "none", stroke: "#5599ff", strokeWidth: "1.5" })] }), _jsx("div", { onMouseDown: makeMouseDown('start'), title: "\uC2DC\uC791\uC810", style: {
                    position: 'absolute',
                    left: x1 - R, top: y1 - R,
                    width: R * 2, height: R * 2,
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #5599ff',
                    cursor: 'crosshair',
                    zIndex: 10000,
                } }), _jsx("div", { onMouseDown: makeMouseDown('end'), title: "\uB05D\uC810", style: {
                    position: 'absolute',
                    left: x2 - R, top: y2 - R,
                    width: R * 2, height: R * 2,
                    borderRadius: '50%',
                    background: '#5599ff',
                    border: '2px solid #ffffff',
                    cursor: 'crosshair',
                    zIndex: 10000,
                } })] }));
};
