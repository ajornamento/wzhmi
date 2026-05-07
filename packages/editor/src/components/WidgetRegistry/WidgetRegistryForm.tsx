import React, { useState, useRef, useEffect } from 'react';
import type { CustomWidgetMetadata } from '@wzhmi/core';

interface WidgetRegistrationForm {
  name: string;
  label: string;
  description: string;
  image: File | string | null;
  defaultWidth: number;
  defaultHeight: number;
  animationSupport: boolean;
  bindingSupport: boolean;
  supportedProperties: string[];
}

interface WidgetRegistryFormProps {
  initialData?: CustomWidgetMetadata | null;
  onSave: (metadata: CustomWidgetMetadata) => void;
  onCancel: () => void;
}

const PROPERTY_OPTIONS = [
  '표시값', '색상', '회전', '크기', '투명도', '툴팁', '단위', '최소값', '최대값',
  '폰트패밀리', '폰트크기', '미리보기값', '선너비', '선스타일', '선타입',
  '화살표시작', '화살표끝', '흐름속도'
];

export const WidgetRegistryForm: React.FC<WidgetRegistryFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<WidgetRegistrationForm>({
    name: '',
    label: '',
    description: '',
    image: null,
    defaultWidth: 100,
    defaultHeight: 100,
    animationSupport: true,
    bindingSupport: true,
    supportedProperties: ['표시값', '색상'],
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.type.replace('CUSTOM_', ''),
        label: initialData.label,
        description: initialData.description,
        image: initialData.imageData || initialData.imageUrl || null,
        defaultWidth: initialData.defaultGeometry.width,
        defaultHeight: initialData.defaultGeometry.height,
        animationSupport: initialData.animationSupport,
        bindingSupport: initialData.bindingSupport,
        supportedProperties: initialData.supportedProperties,
      });
      setImagePreview(initialData.imageData || initialData.imageUrl || null);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '위젯명을 입력해주세요';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.name)) {
      newErrors.name = '위젯명은 영문자로 시작하고 영문자, 숫자, 밑줄만 사용할 수 있습니다';
    }

    if (!formData.label.trim()) {
      newErrors.label = '표시명을 입력해주세요';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요';
    }

    if (!formData.image) {
      newErrors.image = '이미지를 선택해주세요';
    }

    if (formData.defaultWidth <= 0) {
      newErrors.defaultWidth = '너비는 1 이상이어야 합니다';
    }

    if (formData.defaultHeight <= 0) {
      newErrors.defaultHeight = '높이는 1 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: '이미지 파일만 선택할 수 있습니다' });
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: '이미지 크기는 5MB 이하여야 합니다' });
      return;
    }

    setFormData({ ...formData, image: file });
    setErrors({ ...errors, image: '' });

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePropertyToggle = (property: string) => {
    const current = formData.supportedProperties;
    const updated = current.includes(property)
      ? current.filter(p => p !== property)
      : [...current, property];

    setFormData({ ...formData, supportedProperties: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let imageData: string | undefined;

      if (formData.image instanceof File) {
        // 새 파일인 경우 Base64로 변환
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(formData.image as Blob);
        });
      } else if (typeof formData.image === 'string') {
        // 기존 이미지 데이터
        imageData = formData.image;
      }

      const metadata: CustomWidgetMetadata = {
        id: initialData?.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: `CUSTOM_${formData.name.toUpperCase()}` as any,
        label: formData.label,
        image: `/custom-widgets/${formData.name}.png`, // 런타임용 경로
        description: formData.description,
        imageData,
        isBuiltin: false,
        createdAt: initialData?.createdAt || Date.now(),
        version: initialData?.version || '1.0.0',
        author: initialData?.author,
        defaultGeometry: {
          width: formData.defaultWidth,
          height: formData.defaultHeight,
        },
        supportedProperties: formData.supportedProperties,
        animationSupport: formData.animationSupport,
        bindingSupport: formData.bindingSupport,
      };

      onSave(metadata);
    } catch (error) {
      console.error('Failed to process form:', error);
      alert('폼 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: 16 }}>
        {initialData ? '위젯 편집' : '새 위젯 등록'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 16 }}>
          {/* 위젯명 */}
          <div>
            <label style={{ display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }}>
              위젯명 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: my_motor"
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: 4,
                color: '#fff',
                fontSize: 14,
              }}
            />
            {errors.name && <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
          </div>

          {/* 표시명 */}
          <div>
            <label style={{ display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }}>
              표시명 *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="예: 내 모터"
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: 4,
                color: '#fff',
                fontSize: 14,
              }}
            />
            {errors.label && <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>{errors.label}</div>}
          </div>

          {/* 설명 */}
          <div>
            <label style={{ display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }}>
              설명 *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="위젯에 대한 간단한 설명을 입력하세요"
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: 4,
                color: '#fff',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
            {errors.description && <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>{errors.description}</div>}
          </div>

          {/* 이미지 */}
          <div>
            <label style={{ display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }}>
              이미지 *
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  border: '2px dashed #555',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: imagePreview ? 'transparent' : '#2a2a3a',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6 }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#888' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
                    <div style={{ fontSize: 12 }}>클릭하여 선택</div>
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: '#555',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  파일 선택
                </button>
                <div style={{ fontSize: 12, color: '#888' }}>
                  PNG, JPG, SVG 파일 지원 (최대 5MB)
                </div>
              </div>
            </div>
            {errors.image && <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>{errors.image}</div>}
          </div>

          {/* 기본 크기 */}
          <div>
            <label style={{ display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }}>
              기본 크기
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: 12, color: '#888', marginRight: 4 }}>너비:</label>
                <input
                  type="number"
                  value={formData.defaultWidth}
                  onChange={(e) => setFormData({ ...formData, defaultWidth: Number(e.target.value) })}
                  min={1}
                  max={1000}
                  style={{
                    width: 80,
                    padding: '4px 8px',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>px</span>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#888', marginRight: 4 }}>높이:</label>
                <input
                  type="number"
                  value={formData.defaultHeight}
                  onChange={(e) => setFormData({ ...formData, defaultHeight: Number(e.target.value) })}
                  min={1}
                  max={1000}
                  style={{
                    width: 80,
                    padding: '4px 8px',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>px</span>
              </div>
            </div>
            {(errors.defaultWidth || errors.defaultHeight) && (
              <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
                {errors.defaultWidth || errors.defaultHeight}
              </div>
            )}
          </div>

          {/* 기능 지원 */}
          <div>
            <label style={{ display: 'block', color: '#ddd', fontSize: 14, marginBottom: 8 }}>
              기능 지원
            </label>
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.animationSupport}
                  onChange={(e) => setFormData({ ...formData, animationSupport: e.target.checked })}
                />
                <span style={{ color: '#ddd', fontSize: 14 }}>애니메이션 지원</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.bindingSupport}
                  onChange={(e) => setFormData({ ...formData, bindingSupport: e.target.checked })}
                />
                <span style={{ color: '#ddd', fontSize: 14 }}>데이터 바인딩 지원</span>
              </label>
            </div>
          </div>

          {/* 지원 속성 */}
          <div>
            <label style={{ display: 'block', color: '#ddd', fontSize: 14, marginBottom: 8 }}>
              지원 속성
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 8,
            }}>
              {PROPERTY_OPTIONS.map((property) => (
                <label
                  key={property}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    backgroundColor: formData.supportedProperties.includes(property) ? '#2e7d32' : '#333',
                    borderRadius: 4,
                    fontSize: 12,
                    color: '#ddd',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.supportedProperties.includes(property)}
                    onChange={() => handlePropertyToggle(property)}
                    style={{ display: 'none' }}
                  />
                  {formData.supportedProperties.includes(property) ? '✓' : '○'} {property}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 버튼들 */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            취소
          </button>
          <button
            type="submit"
            style={{
              backgroundColor: '#4a5fd5',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {initialData ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
};