import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ConfirmDialog = ({ message, onConfirm, onCancel }) => (_jsx("div", { style: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }, children: _jsxs("div", { style: {
            background: '#2a2a3a', border: '1px solid #555', borderRadius: 8,
            padding: '24px 32px', minWidth: 320, textAlign: 'center',
        }, children: [_jsx("div", { style: { fontSize: 32, marginBottom: 12 }, children: "\u26A0\uFE0F" }), _jsx("p", { style: { color: '#fff', marginBottom: 20, lineHeight: 1.5 }, children: message }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'center' }, children: [_jsx("button", { onClick: onConfirm, style: {
                            background: '#e55', color: '#fff', border: 'none', borderRadius: 4,
                            padding: '8px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
                        }, children: "\uC2E4\uD589" }), _jsx("button", { onClick: onCancel, style: {
                            background: '#555', color: '#fff', border: 'none', borderRadius: 4,
                            padding: '8px 24px', cursor: 'pointer', fontSize: 14,
                        }, children: "\uCDE8\uC18C" })] })] }) }));
