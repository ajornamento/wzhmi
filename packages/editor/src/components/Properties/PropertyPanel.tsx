import React, { useCallback } from 'react';
import type { Widget, Animation } from '@wzhmi/core';
import { useEditorStore } from '../../store/editorStore';
import { useServerTags } from '../../hooks/useServerTags';

function getLatestWidget(id: string): Widget | undefined {
  return useEditorStore.getState().schema.widgets.find((w) => w.id === id);
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 8 }}>
    <label style={{ display: 'block', fontSize: 10, color: '#888', marginBottom: 2 }}>{label}</label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#12121e', border: '1px solid #444',
  color: '#ccc', borderRadius: 3, padding: '3px 6px', fontSize: 12,
};

const sectionStyle: React.CSSProperties = {
  borderBottom: '1px solid #2a2a3a', paddingBottom: 10, marginBottom: 10,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 10, color: '#5577aa', fontWeight: 'bold',
  letterSpacing: 1, marginBottom: 8,
};

interface Props { widget: Widget }

export const PropertyPanel: React.FC<Props> = ({ widget }) => {
  const { updateWidget } = useEditorStore();
  const serverTags = useServerTags();

  const upd = useCallback((patch: Partial<Widget>) => {
    updateWidget(widget.id, patch);
  }, [widget.id, updateWidget]);

  const updAnim = useCallback((index: number, patch: Partial<Animation>) => {
    const w = getLatestWidget(widget.id);
    if (!w) return;
    const animations = (w.styles.animations ?? []).map((a, i) =>
      i === index ? { ...a, ...patch } : a
    );
    updateWidget(widget.id, { styles: { ...w.styles, animations } });
  }, [widget.id, updateWidget]);

  const addAnim = useCallback(() => {
    const w = getLatestWidget(widget.id);
    if (!w) return;
    const animations = [...(w.styles.animations ?? []), {
      condition: '== 1', property: 'fill', value: '#00ff00', effect: 'static' as const,
    }];
    updateWidget(widget.id, { styles: { ...w.styles, animations } });
  }, [widget.id, updateWidget]);

  const removeAnim = useCallback((index: number) => {
    const w = getLatestWidget(widget.id);
    if (!w) return;
    const animations = (w.styles.animations ?? []).filter((_, i) => i !== index);
    updateWidget(widget.id, { styles: { ...w.styles, animations } });
  }, [widget.id, updateWidget]);

  return (
    <div style={{ padding: 10 }}>
      <div style={{ ...sectionStyle }}>
        <div style={sectionTitle}>기본 정보</div>
        <Field label="ID"><span style={{ fontSize: 11, color: '#666' }}>{widget.id}</span></Field>
        <Field label="이름">
          <input style={inputStyle} value={widget.name}
            onChange={(e) => upd({ name: e.target.value })} />
        </Field>
        <Field label="라벨">
          <input style={inputStyle} value={String(widget.properties.label ?? '')}
            onChange={(e) => upd({ properties: { ...widget.properties, label: e.target.value } })} />
        </Field>
        {widget.type === 'TEXT_LABEL' && (
          <Field label="">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={widget.properties.showValue !== false}
                onChange={(e) => upd({ properties: { ...widget.properties, showValue: e.target.checked } })}
              />
              <span style={{ fontSize: 12, color: '#ccc' }}>값 표시 (태그 바인딩)</span>
            </label>
          </Field>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 6 }}>
          <Field label="폰트">
            <select
              title="라벨 폰트 선택"
              style={inputStyle}
              value={String(widget.properties.fontFamily ?? '')}
              onChange={(e) => upd({ properties: { ...widget.properties, fontFamily: e.target.value || undefined } })}
            >
              <option value="">기본</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="monospace">Monospace</option>
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="Courier New">Courier New</option>
              <option value="Nanum Gothic">나눔고딕</option>
            </select>
          </Field>
          <Field label="크기 (px)">
            <input type="number" min={6} max={72} style={inputStyle}
              value={widget.properties.fontSize != null ? Number(widget.properties.fontSize) : ''}
              placeholder="자동"
              onChange={(e) => upd({ properties: { ...widget.properties, fontSize: e.target.value ? Number(e.target.value) : undefined } })} />
          </Field>
        </div>
      </div>

      <div style={{ ...sectionStyle }}>
        <div style={sectionTitle}>위치 및 크기</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {(['x', 'y', 'width', 'height'] as const).map((key) => (
            <Field key={key} label={key.toUpperCase()}>
              <input type="number" style={inputStyle} value={widget.geometry[key]}
                onChange={(e) => upd({ geometry: { ...widget.geometry, [key]: Number(e.target.value) } })} />
            </Field>
          ))}
        </div>
        <Field label="회전 (deg)">
          <input type="number" style={inputStyle} value={widget.geometry.rotation}
            onChange={(e) => upd({ geometry: { ...widget.geometry, rotation: Number(e.target.value) } })} />
        </Field>
        <Field label="Z-Index">
          <input type="number" style={inputStyle} value={widget.geometry.zIndex}
            onChange={(e) => upd({ geometry: { ...widget.geometry, zIndex: Number(e.target.value) } })} />
        </Field>
      </div>

      <div style={{ ...sectionStyle }}>
        <div style={sectionTitle}>데이터 바인딩</div>
        <Field label="미리보기 값 (디자인 모드)">
          <input
            title="미리보기 값"
            style={inputStyle}
            value={String(widget.properties.previewValue ?? '')}
            placeholder="예: 1, 0, true"
            onChange={(e) => upd({ properties: { ...widget.properties, previewValue: e.target.value } })}
          />
        </Field>
        <Field label="태그 ID">
          <input
            style={inputStyle}
            list={`tag-list-${widget.id}`}
            value={widget.binding.tagId}
            onChange={(e) => upd({ binding: { ...widget.binding, tagId: e.target.value } })}
          />
          <datalist id={`tag-list-${widget.id}`}>
            {serverTags.map((t) => (
              <option key={t.tagId} value={t.tagId} label={t.description} />
            ))}
          </datalist>
        </Field>
        <Field label="데이터 타입">
          <select style={inputStyle} value={widget.binding.dataType}
            onChange={(e) => upd({ binding: { ...widget.binding, dataType: e.target.value as Widget['binding']['dataType'] } })}>
            {['INT', 'FLOAT', 'BOOL', 'STRING'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="갱신주기 (ms)">
          <input type="number" style={inputStyle} value={widget.binding.refreshRate}
            onChange={(e) => upd({ binding: { ...widget.binding, refreshRate: Number(e.target.value) } })} />
        </Field>
        <Field label="포매터">
          <select style={inputStyle} value={widget.binding.formatter ?? ''}
            onChange={(e) => upd({ binding: { ...widget.binding, formatter: e.target.value || undefined } })}>
            <option value="">없음</option>
            {['motorStatus', 'valveState', 'onOff', 'percent', 'temperature', 'pressure', 'rpm'].map((f) =>
              <option key={f}>{f}</option>
            )}
          </select>
        </Field>
      </div>

      <div style={{ ...sectionStyle }}>
        <div style={sectionTitle}>스타일</div>
        <Field label="기본 색상">
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="color" value={widget.styles.baseColor}
              onChange={(e) => upd({ styles: { ...widget.styles, baseColor: e.target.value } })}
              style={{ width: 36, height: 26, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }} />
            <input style={{ ...inputStyle, flex: 1 }} value={widget.styles.baseColor}
              onChange={(e) => upd({ styles: { ...widget.styles, baseColor: e.target.value } })} />
          </div>
        </Field>
        <Field label="투명도">
          <input type="range" min={0} max={1} step={0.05} value={widget.styles.opacity}
            onChange={(e) => upd({ styles: { ...widget.styles, opacity: Number(e.target.value) } })}
            style={{ width: '100%' }} />
        </Field>
        <Field label="">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={widget.styles.visible}
              onChange={(e) => upd({ styles: { ...widget.styles, visible: e.target.checked } })} />
            <span style={{ fontSize: 12, color: '#ccc' }}>표시</span>
          </label>
        </Field>
      </div>

      <div style={{ ...sectionStyle }}>
        <div style={{ ...sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>애니메이션 조건</span>
          <button onClick={addAnim} style={{ fontSize: 10, background: '#1a3a2a', color: '#8f8', border: '1px solid #3a5a3a', borderRadius: 3, padding: '2px 6px', cursor: 'pointer' }}>+ 추가</button>
        </div>
        {(widget.styles.animations ?? []).map((anim, i) => (
          <div key={i} style={{ background: '#12121e', border: '1px solid #2a2a3a', borderRadius: 4, padding: 8, marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#666' }}>조건 #{i + 1}</span>
              <button onClick={() => removeAnim(i)} style={{ fontSize: 10, background: 'none', color: '#f66', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <Field label="조건 (예: == 1, > 50)">
              <input style={inputStyle} value={anim.condition}
                onChange={(e) => updAnim(i, { condition: e.target.value })} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <Field label="색상">
                <div style={{ display: 'flex', gap: 4 }}>
                  <input type="color" value={anim.value}
                    onChange={(e) => updAnim(i, { value: e.target.value })}
                    style={{ width: 30, height: 22, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }} />
                  <input style={{ ...inputStyle, flex: 1 }} value={anim.value}
                    onChange={(e) => updAnim(i, { value: e.target.value })} />
                </div>
              </Field>
              <Field label="효과">
                <select style={inputStyle} value={anim.effect}
                  onChange={(e) => updAnim(i, { effect: e.target.value as Animation['effect'] })}>
                  <option value="static">static</option>
                  <option value="blink">blink</option>
                  <option value="pulse">pulse</option>
                  {widget.type === 'LINE' && <option value="flow">flow (흐름)</option>}
                </select>
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...sectionStyle }}>
        <div style={sectionTitle}>인터랙션</div>
        <Field label="클릭 액션">
          <input style={inputStyle} value={widget.actions.onClick ?? ''}
            onChange={(e) => upd({ actions: { ...widget.actions, onClick: e.target.value || undefined } })} />
        </Field>
        <Field label="권한 (Role)">
          <select style={inputStyle} value={widget.actions.role ?? ''}
            onChange={(e) => upd({ actions: { ...widget.actions, role: e.target.value || undefined } })}>
            <option value="">없음 (모두)</option>
            <option value="OPERATOR">OPERATOR</option>
            <option value="ENGINEER">ENGINEER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </Field>
        <Field label="">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!widget.actions.confirmRequired}
              onChange={(e) => upd({ actions: { ...widget.actions, confirmRequired: e.target.checked } })} />
            <span style={{ fontSize: 12, color: '#ccc' }}>조작 전 확인 창</span>
          </label>
        </Field>
      </div>

      {(widget.type === 'GAUGE' || widget.type === 'TANK') && (
        <div style={{ ...sectionStyle }}>
          <div style={sectionTitle}>범위 설정</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Field label="최솟값">
              <input type="number" style={inputStyle} value={Number(widget.properties.min ?? 0)}
                onChange={(e) => upd({ properties: { ...widget.properties, min: Number(e.target.value) } })} />
            </Field>
            <Field label="최댓값">
              <input type="number" style={inputStyle} value={Number(widget.properties.max ?? 100)}
                onChange={(e) => upd({ properties: { ...widget.properties, max: Number(e.target.value) } })} />
            </Field>
          </div>
          <Field label="단위">
            <input style={inputStyle} value={String(widget.properties.unit ?? '')}
              onChange={(e) => upd({ properties: { ...widget.properties, unit: e.target.value } })} />
          </Field>
        </div>
      )}

      {widget.type === 'LINE' && (
        <div style={{ ...sectionStyle }}>
          <div style={sectionTitle}>라인 설정</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Field label="시작 X">
              <input type="number" style={inputStyle} value={Number(widget.properties.x1 ?? 0)}
                onChange={(e) => upd({ properties: { ...widget.properties, x1: Number(e.target.value) } })} />
            </Field>
            <Field label="시작 Y">
              <input type="number" style={inputStyle} value={Number(widget.properties.y1 ?? 0)}
                onChange={(e) => upd({ properties: { ...widget.properties, y1: Number(e.target.value) } })} />
            </Field>
            <Field label="끝 X">
              <input type="number" style={inputStyle} value={Number(widget.properties.x2 ?? 0)}
                onChange={(e) => upd({ properties: { ...widget.properties, x2: Number(e.target.value) } })} />
            </Field>
            <Field label="끝 Y">
              <input type="number" style={inputStyle} value={Number(widget.properties.y2 ?? 0)}
                onChange={(e) => upd({ properties: { ...widget.properties, y2: Number(e.target.value) } })} />
            </Field>
          </div>
          <Field label="두께 (px)">
            <input type="number" min={1} max={20} style={inputStyle} value={Number(widget.properties.lineWidth ?? 2)}
              onChange={(e) => upd({ properties: { ...widget.properties, lineWidth: Number(e.target.value) } })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <Field label="선 스타일">
              <select title="선 스타일" style={inputStyle} value={String(widget.properties.lineStyle ?? 'solid')}
                onChange={(e) => upd({ properties: { ...widget.properties, lineStyle: e.target.value as 'solid' | 'dashed' | 'dotted' } })}>
                <option value="solid">실선</option>
                <option value="dashed">파선</option>
                <option value="dotted">점선</option>
              </select>
            </Field>
            <Field label="경로 유형">
              <select title="경로 유형" style={inputStyle} value={String(widget.properties.lineType ?? 'straight')}
                onChange={(e) => upd({ properties: { ...widget.properties, lineType: e.target.value as 'straight' | 'orthogonal' | 'curved' } })}>
                <option value="straight">직선</option>
                <option value="orthogonal">직각</option>
                <option value="curved">곡선</option>
              </select>
            </Field>
          </div>
          <Field label="">
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!widget.properties.arrowStart}
                  onChange={(e) => upd({ properties: { ...widget.properties, arrowStart: e.target.checked } })} />
                <span style={{ fontSize: 12, color: '#ccc' }}>시작 화살표</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <input type="checkbox" checked={widget.properties.arrowEnd !== false}
                  onChange={(e) => upd({ properties: { ...widget.properties, arrowEnd: e.target.checked } })} />
                <span style={{ fontSize: 12, color: '#ccc' }}>끝 화살표</span>
              </label>
            </div>
          </Field>
          <Field label="흐름 속도 (px/tick)">
            <input
              title="흐름 속도"
              type="number" min={0.5} max={30} step={0.5}
              style={inputStyle}
              value={Number(widget.properties.flowSpeed ?? 2)}
              onChange={(e) => upd({ properties: { ...widget.properties, flowSpeed: Number(e.target.value) } })}
            />
          </Field>
        </div>
      )}
    </div>
  );
};
