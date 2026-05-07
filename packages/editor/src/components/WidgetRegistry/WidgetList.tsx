import React from 'react';
import type { CustomWidgetMetadata } from '@wzhmi/core';

interface WidgetListProps {
  customWidgets: CustomWidgetMetadata[];
  loading: boolean;
  onEdit: (widget: CustomWidgetMetadata) => void;
  onDelete: (id: string) => void;
  onDuplicate: (widget: CustomWidgetMetadata) => void;
  onCreateNew: () => void;
}

export const WidgetList: React.FC<WidgetListProps> = ({
  customWidgets,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateNew,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      {/* 헤더와 새 위젯 등록 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: 16 }}>
          커스텀 위젯 ({customWidgets.length}개)
        </h3>
        <button
          onClick={onCreateNew}
          style={{
            backgroundColor: '#4a5fd5',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          + 새 위젯 등록
        </button>
      </div>

      {/* 위젯 목록 */}
      {customWidgets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          border: '2px dashed #444',
          borderRadius: 8,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>등록된 커스텀 위젯이 없습니다</div>
          <div style={{ fontSize: 14, color: '#888' }}>
            위쪽의 "새 위젯 등록" 버튼을 클릭하여 첫 번째 위젯을 만들어보세요
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {customWidgets.map((widget) => (
            <WidgetListItem
              key={widget.id}
              widget={widget}
              onEdit={() => onEdit(widget)}
              onDelete={() => onDelete(widget.id)}
              onDuplicate={() => onDuplicate(widget)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface WidgetListItemProps {
  widget: CustomWidgetMetadata;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const WidgetListItem: React.FC<WidgetListItemProps> = ({
  widget,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: '#242436',
        border: '1px solid #333',
        borderRadius: 6,
      }}
    >
      {/* 위젯 이미지 */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 4,
          backgroundColor: '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {widget.imageData ? (
          <img
            src={widget.imageData}
            alt={widget.label}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : widget.imageUrl ? (
          <img
            src={widget.imageUrl}
            alt={widget.label}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: 24 }}>📦</span>
        )}
      </div>

      {/* 위젯 정보 */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 'bold' }}>
          {widget.label}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
          {widget.description}
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
          v{widget.version} • {formatDate(widget.createdAt)}
          {widget.author && ` • ${widget.author}`}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onEdit}
          style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: 11,
          }}
          title="편집"
        >
          ✏️
        </button>
        <button
          onClick={onDuplicate}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: 11,
          }}
          title="복제"
        >
          📋
        </button>
        <button
          onClick={onDelete}
          style={{
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: 11,
          }}
          title="삭제"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};