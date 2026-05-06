import React from 'react';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<Props> = ({ message, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  }}>
    <div style={{
      background: '#2a2a3a', border: '1px solid #555', borderRadius: 8,
      padding: '24px 32px', minWidth: 320, textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: '#fff', marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onConfirm} style={{
          background: '#e55', color: '#fff', border: 'none', borderRadius: 4,
          padding: '8px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
        }}>실행</button>
        <button onClick={onCancel} style={{
          background: '#555', color: '#fff', border: 'none', borderRadius: 4,
          padding: '8px 24px', cursor: 'pointer', fontSize: 14,
        }}>취소</button>
      </div>
    </div>
  </div>
);
