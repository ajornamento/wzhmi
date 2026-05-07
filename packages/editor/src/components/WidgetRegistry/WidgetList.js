import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const WidgetList = ({ customWidgets, loading, onEdit, onDelete, onDuplicate, onCreateNew, }) => {
    if (loading) {
        return (_jsx("div", { style: { textAlign: 'center', padding: '40px', color: '#888' }, children: "\uB85C\uB529 \uC911..." }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, children: [_jsxs("h3", { style: { margin: 0, color: '#fff', fontSize: 16 }, children: ["\uCEE4\uC2A4\uD140 \uC704\uC82F (", customWidgets.length, "\uAC1C)"] }), _jsx("button", { onClick: onCreateNew, style: {
                            backgroundColor: '#4a5fd5',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 14,
                        }, children: "+ \uC0C8 \uC704\uC82F \uB4F1\uB85D" })] }), customWidgets.length === 0 ? (_jsxs("div", { style: {
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                    border: '2px dashed #444',
                    borderRadius: 8,
                }, children: [_jsx("div", { style: { fontSize: 48, marginBottom: 16 }, children: "\uD83D\uDCE6" }), _jsx("div", { style: { fontSize: 16, marginBottom: 8 }, children: "\uB4F1\uB85D\uB41C \uCEE4\uC2A4\uD140 \uC704\uC82F\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" }), _jsx("div", { style: { fontSize: 14, color: '#888' }, children: "\uC704\uCABD\uC758 \"\uC0C8 \uC704\uC82F \uB4F1\uB85D\" \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC5EC \uCCAB \uBC88\uC9F8 \uC704\uC82F\uC744 \uB9CC\uB4E4\uC5B4\uBCF4\uC138\uC694" })] })) : (_jsx("div", { style: { display: 'grid', gap: 12 }, children: customWidgets.map((widget) => (_jsx(WidgetListItem, { widget: widget, onEdit: () => onEdit(widget), onDelete: () => onDelete(widget.id), onDuplicate: () => onDuplicate(widget) }, widget.id))) }))] }));
};
const WidgetListItem = ({ widget, onEdit, onDelete, onDuplicate, }) => {
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    return (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: '#242436',
            border: '1px solid #333',
            borderRadius: 6,
        }, children: [_jsx("div", { style: {
                    width: 48,
                    height: 48,
                    borderRadius: 4,
                    backgroundColor: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }, children: widget.imageData ? (_jsx("img", { src: widget.imageData, alt: widget.label, style: { width: '100%', height: '100%', objectFit: 'contain' } })) : widget.imageUrl ? (_jsx("img", { src: widget.imageUrl, alt: widget.label, style: { width: '100%', height: '100%', objectFit: 'contain' } })) : (_jsx("span", { style: { fontSize: 24 }, children: "\uD83D\uDCE6" })) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 14, color: '#fff', fontWeight: 'bold' }, children: widget.label }), _jsx("div", { style: { fontSize: 12, color: '#888', marginTop: 2 }, children: widget.description }), _jsxs("div", { style: { fontSize: 11, color: '#666', marginTop: 2 }, children: ["v", widget.version, " \u2022 ", formatDate(widget.createdAt), widget.author && ` • ${widget.author}`] })] }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { onClick: onEdit, style: {
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: 3,
                            cursor: 'pointer',
                            fontSize: 11,
                        }, title: "\uD3B8\uC9D1", children: "\u270F\uFE0F" }), _jsx("button", { onClick: onDuplicate, style: {
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: 3,
                            cursor: 'pointer',
                            fontSize: 11,
                        }, title: "\uBCF5\uC81C", children: "\uD83D\uDCCB" }), _jsx("button", { onClick: onDelete, style: {
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: 3,
                            cursor: 'pointer',
                            fontSize: 11,
                        }, title: "\uC0AD\uC81C", children: "\uD83D\uDDD1\uFE0F" })] })] }));
};
