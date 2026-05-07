import React, { useState, useEffect } from 'react';
import type { CustomWidgetMetadata } from '@wzhmi/core';
import { customWidgetStorage } from '../../services/customWidgetStorage';
import { WidgetRegistryForm } from './WidgetRegistryForm';
import { WidgetList } from './WidgetList';

interface WidgetRegistryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (metadata: CustomWidgetMetadata) => void;
}

export const WidgetRegistryDialog: React.FC<WidgetRegistryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [customWidgets, setCustomWidgets] = useState<CustomWidgetMetadata[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWidget, setEditingWidget] = useState<CustomWidgetMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCustomWidgets();
    }
  }, [isOpen]);

  const loadCustomWidgets = async () => {
    setLoading(true);
    try {
      const widgets = await customWidgetStorage.loadAllCustomWidgets();
      setCustomWidgets(widgets);
    } catch (error) {
      console.error('Failed to load custom widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWidget = async (metadata: CustomWidgetMetadata) => {
    try {
      await customWidgetStorage.saveCustomWidget(metadata);
      await loadCustomWidgets();
      setShowForm(false);
      setEditingWidget(null);
      onSave?.(metadata);
    } catch (error) {
      console.error('Failed to save widget:', error);
      alert('위젯 저장에 실패했습니다.');
    }
  };

  const handleEditWidget = (widget: CustomWidgetMetadata) => {
    setEditingWidget(widget);
    setShowForm(true);
  };

  const handleDeleteWidget = async (id: string) => {
    if (!confirm('정말로 이 위젯을 삭제하시겠습니까?')) return;

    try {
      await customWidgetStorage.deleteCustomWidget(id);
      await loadCustomWidgets();
    } catch (error) {
      console.error('Failed to delete widget:', error);
      alert('위젯 삭제에 실패했습니다.');
    }
  };

  const handleDuplicateWidget = async (widget: CustomWidgetMetadata) => {
    const duplicated: CustomWidgetMetadata = {
      ...widget,
      id: `${widget.id}_copy_${Date.now()}`,
      label: `${widget.label} 복사본`,
      createdAt: Date.now(),
    };

    try {
      await customWidgetStorage.saveCustomWidget(duplicated);
      await loadCustomWidgets();
    } catch (error) {
      console.error('Failed to duplicate widget:', error);
      alert('위젯 복제에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a2a',
          borderRadius: 8,
          border: '1px solid #333',
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, color: '#fff', fontSize: 18 }}>
            위젯 관리
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* 컨텐츠 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {showForm ? (
            <WidgetRegistryForm
              initialData={editingWidget}
              onSave={handleSaveWidget}
              onCancel={() => {
                setShowForm(false);
                setEditingWidget(null);
              }}
            />
          ) : (
            <WidgetList
              customWidgets={customWidgets}
              loading={loading}
              onEdit={handleEditWidget}
              onDelete={handleDeleteWidget}
              onDuplicate={handleDuplicateWidget}
              onCreateNew={() => setShowForm(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};