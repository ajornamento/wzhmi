import React from 'react';
import type { CustomWidgetMetadata } from '@wzhmi/core';

interface WidgetPreviewProps {
  widget: CustomWidgetMetadata;
  size?: 'small' | 'medium' | 'large';
}

export const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  widget,
  size = 'medium',
}) => {
  const sizeMap = {
    small: { width: 64, height: 64, fontSize: 10 },
    medium: { width: 100, height: 100, fontSize: 12 },
    large: { width: 150, height: 150, fontSize: 14 },
  };

  const dimensions = sizeMap[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: '#242436',
        border: '1px solid #333',
        borderRadius: 8,
      }}
    >
      {/* 위젯 이미지 미리보기 */}
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: 6,
          backgroundColor: '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #555',
        }}
      >
        {widget.imageData ? (
          <img
            src={widget.imageData}
            alt={widget.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : widget.imageUrl ? (
          <img
            src={widget.imageUrl}
            alt={widget.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <span style={{ fontSize: dimensions.width * 0.4 }}>📦</span>
        )}
      </div>

      {/* 위젯 정보 */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: dimensions.fontSize,
            color: '#fff',
            fontWeight: 'bold',
            marginBottom: 2,
          }}
        >
          {widget.label}
        </div>
        <div
          style={{
            fontSize: dimensions.fontSize - 2,
            color: '#888',
          }}
        >
          {widget.defaultGeometry.width} × {widget.defaultGeometry.height}
        </div>
        <div
          style={{
            fontSize: dimensions.fontSize - 2,
            color: '#666',
            marginTop: 2,
          }}
        >
          v{widget.version}
        </div>
      </div>

      {/* 기능 아이콘들 */}
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        {widget.animationSupport && (
          <span title="애니메이션 지원" style={{ fontSize: 12 }}>🎬</span>
        )}
        {widget.bindingSupport && (
          <span title="데이터 바인딩 지원" style={{ fontSize: 12 }}>🔗</span>
        )}
        {widget.supportedProperties.length > 0 && (
          <span title={`${widget.supportedProperties.length}개 속성 지원`} style={{ fontSize: 12 }}>
            ⚙️
          </span>
        )}
      </div>
    </div>
  );
};