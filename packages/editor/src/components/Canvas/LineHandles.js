import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 라인 위젯의 엔드포인트/관절 핸들 및 위젯 연결점 스냅 처리
import { useCallback, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
const R = 7;
const SNAP_RADIUS = 20;
const CONNECTION_POINTS = ['top', 'right', 'bottom', 'left'];
function getConnectionPoint(w, point) {
    const { x, y, width, height } = w.geometry;
    if (point === 'top')
        return { x: x + width / 2, y };
    if (point === 'bottom')
        return { x: x + width / 2, y: y + height };
    if (point === 'left')
        return { x, y: y + height / 2 };
    return { x: x + width, y: y + height / 2 };
}
function findNearestConnection(px, py, widgets) {
    let best = null;
    let bestDist = SNAP_RADIUS;
    for (const w of widgets) {
        for (const point of CONNECTION_POINTS) {
            const cp = getConnectionPoint(w, point);
            const d = Math.hypot(px - cp.x, py - cp.y);
            if (d < bestDist) {
                bestDist = d;
                best = { ...cp, widgetId: w.id, point };
            }
        }
    }
    return best;
}
function distToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0)
        return Math.hypot(px - ax, py - ay);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function nearestSegment(px, py, allPts) {
    let minDist = Infinity, minIndex = 0;
    for (let i = 0; i < allPts.length - 1; i++) {
        const d = distToSegment(px, py, allPts[i].x, allPts[i].y, allPts[i + 1].x, allPts[i + 1].y);
        if (d < minDist) {
            minDist = d;
            minIndex = i;
        }
    }
    return { index: minIndex, dist: minDist };
}
export const LineHandles = ({ widget, canvasEl, nonLineWidgets }) => {
    const { moveLineEndpoint, finalizeLineEndpoint, moveWidget, addLineWaypoint, removeLineWaypoint, moveLineWaypoint, canvasScale } = useEditorStore();
    const [draggingEndpoint, setDraggingEndpoint] = useState(null);
    const [snapTarget, setSnapTarget] = useState(null);
    const p = widget.properties;
    const x1 = Number(p.x1 ?? widget.geometry.x);
    const y1 = Number(p.y1 ?? widget.geometry.y);
    const x2 = Number(p.x2 ?? widget.geometry.x + widget.geometry.width);
    const y2 = Number(p.y2 ?? widget.geometry.y + widget.geometry.height);
    const waypoints = p.waypoints ?? [];
    const allPts = [{ x: x1, y: y1 }, ...waypoints, { x: x2, y: y2 }];
    const startConn = p.startConnection;
    const endConn = p.endConnection;
    const canvasCoords = useCallback((e) => {
        if (!canvasEl)
            return { cx: 0, cy: 0 };
        const rect = canvasEl.getBoundingClientRect();
        return {
            cx: (e.clientX - rect.left) / canvasScale,
            cy: (e.clientY - rect.top) / canvasScale,
        };
    }, [canvasEl, canvasScale]);
    const handleDragMouseDown = useCallback((e) => {
        if (e.button !== 0)
            return;
        const { cx, cy } = canvasCoords(e);
        if (nearestSegment(cx, cy, allPts).dist > 12)
            return;
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        const origX = widget.geometry.x, origY = widget.geometry.y;
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
    }, [canvasCoords, allPts, widget.geometry, widget.id, moveWidget, canvasScale]);
    const handleLineDoubleClick = useCallback((e) => {
        const { cx, cy } = canvasCoords(e);
        const { index, dist } = nearestSegment(cx, cy, allPts);
        if (dist > 12)
            return;
        e.stopPropagation();
        e.preventDefault();
        addLineWaypoint(widget.id, index, cx, cy);
    }, [canvasCoords, allPts, widget.id, addLineWaypoint]);
    const makeEndpointMouseDown = useCallback((endpoint) => (e) => {
        e.stopPropagation();
        e.preventDefault();
        const startMouseX = e.clientX, startMouseY = e.clientY;
        const origX = endpoint === 'start' ? x1 : x2;
        const origY = endpoint === 'start' ? y1 : y2;
        setDraggingEndpoint(endpoint);
        setSnapTarget(null);
        const onMove = (me) => {
            const fx = origX + (me.clientX - startMouseX) / canvasScale;
            const fy = origY + (me.clientY - startMouseY) / canvasScale;
            moveLineEndpoint(widget.id, endpoint, fx, fy);
            const snap = findNearestConnection(fx, fy, nonLineWidgets);
            setSnapTarget(snap ? { x: snap.x, y: snap.y } : null);
        };
        const onUp = (me) => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            setDraggingEndpoint(null);
            setSnapTarget(null);
            const fx = origX + (me.clientX - startMouseX) / canvasScale;
            const fy = origY + (me.clientY - startMouseY) / canvasScale;
            const snap = findNearestConnection(fx, fy, nonLineWidgets);
            finalizeLineEndpoint(widget.id, endpoint, snap ? snap.x : fx, snap ? snap.y : fy, snap ? { widgetId: snap.widgetId, point: snap.point } : null);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [x1, y1, x2, y2, widget.id, moveLineEndpoint, finalizeLineEndpoint, canvasScale, nonLineWidgets]);
    const makeWaypointMouseDown = useCallback((index) => (e) => {
        e.stopPropagation();
        e.preventDefault();
        const startMouseX = e.clientX, startMouseY = e.clientY;
        const origX = waypoints[index].x, origY = waypoints[index].y;
        const onMove = (me) => {
            moveLineWaypoint(widget.id, index, origX + (me.clientX - startMouseX) / canvasScale, origY + (me.clientY - startMouseY) / canvasScale);
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [waypoints, widget.id, moveLineWaypoint, canvasScale]);
    const polylinePoints = allPts.map(pt => `${pt.x},${pt.y}`).join(' ');
    return (_jsxs(_Fragment, { children: [_jsx("div", { onMouseDown: handleDragMouseDown, onDoubleClick: handleLineDoubleClick, title: "\uB77C\uC778 \uC774\uB3D9 \u00B7 \uB354\uBE14\uD074\uB9AD\uC73C\uB85C \uAD00\uC808 \uCD94\uAC00", style: {
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
                }, children: [_jsx("polyline", { points: polylinePoints, stroke: "#5599ff", strokeWidth: "1.5", strokeDasharray: "5 3", fill: "none" }), _jsx("circle", { cx: x1, cy: y1, r: R + 2, fill: "none", stroke: "#5599ff", strokeWidth: "1.5" }), _jsx("circle", { cx: x2, cy: y2, r: R + 2, fill: "none", stroke: "#5599ff", strokeWidth: "1.5" }), waypoints.map((wp, i) => (_jsx("circle", { cx: wp.x, cy: wp.y, r: R, fill: "none", stroke: "#ffaa33", strokeWidth: "1.5", strokeDasharray: "3 2" }, i))), draggingEndpoint && nonLineWidgets.map((w) => CONNECTION_POINTS.map((point) => {
                        const cp = getConnectionPoint(w, point);
                        const isSnap = snapTarget && Math.abs(cp.x - snapTarget.x) < 1 && Math.abs(cp.y - snapTarget.y) < 1;
                        return (_jsx("circle", { cx: cp.x, cy: cp.y, r: isSnap ? 8 : 5, fill: isSnap ? '#00ffcc' : 'none', stroke: "#00ffcc", strokeWidth: isSnap ? 2 : 1.5, opacity: isSnap ? 1 : 0.6 }, `${w.id}-${point}`));
                    }))] }), _jsx("div", { onMouseDown: makeEndpointMouseDown('start'), title: "\uC2DC\uC791\uC810", style: {
                    position: 'absolute',
                    left: x1 - R, top: y1 - R,
                    width: R * 2, height: R * 2,
                    borderRadius: '50%',
                    background: startConn ? '#00cc88' : '#ffffff',
                    border: `2px solid ${startConn ? '#00ffcc' : '#5599ff'}`,
                    cursor: 'crosshair',
                    zIndex: 10001,
                } }), _jsx("div", { onMouseDown: makeEndpointMouseDown('end'), title: "\uB05D\uC810", style: {
                    position: 'absolute',
                    left: x2 - R, top: y2 - R,
                    width: R * 2, height: R * 2,
                    borderRadius: '50%',
                    background: endConn ? '#00cc88' : '#5599ff',
                    border: `2px solid ${endConn ? '#00ffcc' : '#ffffff'}`,
                    cursor: 'crosshair',
                    zIndex: 10001,
                } }), waypoints.map((wp, i) => (_jsx("div", { onMouseDown: makeWaypointMouseDown(i), onDoubleClick: (e) => {
                    e.stopPropagation();
                    removeLineWaypoint(widget.id, i);
                }, title: "\uAD00\uC808 \u00B7 \uB354\uBE14\uD074\uB9AD\uC73C\uB85C \uC81C\uAC70", style: {
                    position: 'absolute',
                    left: wp.x - R, top: wp.y - R,
                    width: R * 2, height: R * 2,
                    borderRadius: '50%',
                    background: '#ffaa33',
                    border: '2px solid #ffffff',
                    cursor: 'crosshair',
                    zIndex: 10001,
                } }, i)))] }));
};
