import React, { useCallback, useState, useEffect } from 'react';
import type { Widget, Animation, UserRole } from '@wzhmi/core';
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

  const [localStrokeWidth, setLocalStrokeWidth] = useState(String(widget.properties.strokeWidth ?? 3));
  useEffect(() => {
    setLocalStrokeWidth(String(widget.properties.strokeWidth ?? 3));
  }, [widget.properties.strokeWidth]);

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
        <Field label="라벨 위치">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <label key={side} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#ccc' }}>
                <input
                  type="radio"
                  name={`label-side-${widget.id}`}
                  checked={(widget.properties.labelSide ?? 'bottom') === side}
                  onChange={() => upd({
                    properties: {
                      ...widget.properties,
                      labelSide: side,
                    },
                  })}
                />
                <span>{side === 'top' ? '위쪽' : side === 'bottom' ? '아래쪽' : side === 'left' ? '왼쪽' : '오른쪽'}</span>
              </label>
            ))}
          </div>
        </Field>
        {widget.type !== 'LINE' && (
          <Field label="">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={widget.type === 'TEXT_LABEL' ? widget.properties.showValue !== false : !!widget.properties.showValue}
                onChange={(e) => upd({ properties: { ...widget.properties, showValue: e.target.checked } })}
              />
              <span style={{ fontSize: 12, color: '#ccc' }}>태그값 표시</span>
            </label>
          </Field>
        )}
        <Field label="라벨 색상">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="color"
              title="라벨 색상"
              value={String(widget.properties.labelColor ?? '#cccccc')}
              onChange={(e) => upd({ properties: { ...widget.properties, labelColor: e.target.value } })}
              style={{ width: 36, height: 26, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={String(widget.properties.labelColor ?? '')}
              placeholder="기본 (#ccc)"
              onChange={(e) => upd({ properties: { ...widget.properties, labelColor: e.target.value || undefined } })}
            />
          </div>
        </Field>
        <Field label="비고">
          <textarea
            style={{ ...inputStyle, height: 56, resize: 'vertical', fontFamily: 'sans-serif' }}
            value={String(widget.properties.remarks ?? '')}
            placeholder="위젯에 대한 설명이나 메모를 입력하세요"
            onChange={(e) => upd({ properties: { ...widget.properties, remarks: e.target.value || undefined } })}
          />
        </Field>
        <Field label="">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={widget.properties.showTooltip !== false}
              onChange={(e) => upd({ properties: { ...widget.properties, showTooltip: e.target.checked } })}
            />
            <span style={{ fontSize: 12, color: '#ccc' }}>뷰어에서 비고 툴팁 표시</span>
          </label>
        </Field>
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

      {widget.type === 'TEXT_LABEL' && (
        <div style={{ ...sectionStyle }}>
          <div style={sectionTitle}>도형</div>
          <Field label="도형 종류">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {([
                { value: 'rect',     label: '사각형',    sym: '▭' },
                { value: 'rounded',  label: '둥근사각형', sym: '▢' },
                { value: 'ellipse',  label: '타원형',    sym: '◯' },
                { value: 'triangle', label: '삼각형',    sym: '△' },
                { value: 'diamond',  label: '마름모',    sym: '◇' },
                { value: 'freeform', label: '자유형',    sym: '✦' },
              ] as const).map(({ value, label, sym }) => {
                const active = (widget.properties.shape ?? 'rect') === value;
                return (
                  <button
                    key={value}
                    type="button"
                    title={label}
                    onClick={() => upd({ properties: { ...widget.properties, shape: value } })}
                    style={{
                      padding: '5px 2px', fontSize: 10, cursor: 'pointer', borderRadius: 3,
                      background: active ? '#1e3050' : '#1e1e2e',
                      color: active ? '#7af' : '#aab',
                      border: `1px solid ${active ? '#3a6aaa' : '#334'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{sym}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="외곽선 두께 (viewBox 단위)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="range" min={0} max={20} step={0.5}
                title="외곽선 두께 슬라이더"
                style={{ flex: 1 }}
                value={Number(widget.properties.strokeWidth ?? 3)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLocalStrokeWidth(String(v));
                  upd({ properties: { ...widget.properties, strokeWidth: v } });
                }}
              />
              <input
                type="number" min={0} max={20} step={0.5}
                title="외곽선 두께 입력"
                style={{ ...inputStyle, width: 52, textAlign: 'right' }}
                value={localStrokeWidth}
                onChange={(e) => setLocalStrokeWidth(e.target.value)}
                onBlur={(e) => {
                  const v = Math.max(0, Math.min(20, Number(e.target.value) || 0));
                  setLocalStrokeWidth(String(v));
                  upd({ properties: { ...widget.properties, strokeWidth: v } });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = Math.max(0, Math.min(20, Number(e.currentTarget.value) || 0));
                    setLocalStrokeWidth(String(v));
                    upd({ properties: { ...widget.properties, strokeWidth: v } });
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
          </Field>

          {(widget.properties.shape ?? 'rect') === 'rounded' && (
            <Field label="모서리 반경">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="range" min={0} max={50} step={1}
                  style={{ flex: 1 }}
                  value={Number(widget.properties.cornerRadius ?? 10)}
                  onChange={(e) => upd({ properties: { ...widget.properties, cornerRadius: Number(e.target.value) } })}
                />
                <span style={{ fontSize: 11, color: '#aaa', minWidth: 20, textAlign: 'right' }}>
                  {Number(widget.properties.cornerRadius ?? 10)}
                </span>
              </div>
            </Field>
          )}

          {(widget.properties.shape ?? 'rect') === 'freeform' && (
            <Field label="꼭짓점 (100×100 좌표)">
              <textarea
                title="자유형 꼭짓점 좌표"
                style={{ ...inputStyle, height: 60, resize: 'vertical', fontFamily: 'monospace', fontSize: 11 }}
                placeholder={'예: 50,2 96,26 96,74 50,98 4,74 4,26'}
                value={String(widget.properties.shapePoints ?? '50,2 96,26 96,74 50,98 4,74 4,26')}
                onChange={(e) => upd({ properties: { ...widget.properties, shapePoints: e.target.value } })}
              />
              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                x,y 쌍을 공백으로 구분. 범위: 0~100
              </div>
            </Field>
          )}

          <Field label="배경색">
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="color"
                title="배경색"
                value={(() => {
                  const c = String(widget.properties.bgColor ?? '');
                  return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(c) ? c : '#000000';
                })()}
                onChange={(e) => upd({ properties: { ...widget.properties, bgColor: e.target.value } })}
                style={{ width: 36, height: 26, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
              />
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={String(widget.properties.bgColor ?? '')}
                placeholder="기본 (어두운 반투명)"
                onChange={(e) => upd({ properties: { ...widget.properties, bgColor: e.target.value || undefined } })}
              />
            </div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
              hex, rgba(...), transparent 등 CSS 색상값 가능
            </div>
          </Field>
        </div>
      )}

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
          <input
            style={inputStyle}
            list={`formatter-list-${widget.id}`}
            value={widget.binding.formatter ?? ''}
            placeholder="없음 또는 직접 입력"
            onChange={(e) => upd({ binding: { ...widget.binding, formatter: e.target.value || undefined } })}
          />
          <datalist id={`formatter-list-${widget.id}`}>
            {['motorStatus', 'valveState', 'onOff', 'percent', 'temperature', 'pressure', 'rpm'].map((f) =>
              <option key={f} value={f} />
            )}
          </datalist>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
          <div style={{ marginBottom: 2 }}>목록 선택 또는 JS 템플릿 직접 입력:</div>
          • 수치: {'${Number(value).toFixed(2)} °C'} <br />
          • 상태: {'${value > 0 ? "가동" : "정지"}'}
        </div>
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
                  {(widget.type === 'LINE' || widget.type === 'PIPE') && <option value="flow">flow (흐름)</option>}
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
            onChange={(e) => upd({ actions: { ...widget.actions, role: (e.target.value as UserRole) || undefined } })}>
            <option value="">없음 (모두)</option>
            <option value="VIEWER">VIEWER</option>
            <option value="OPERATOR">OPERATOR</option>
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

      {widget.type === 'OVEN' && (() => {
        const rt = widget.extraBindings?.runtime;
        const setRt = (patch: { tagId?: string; dataType?: Widget['binding']['dataType']; refreshRate?: number }) => {
          const merged = { tagId: '', dataType: 'INT' as Widget['binding']['dataType'], refreshRate: 1000, ...rt, ...patch };
          if (!merged.tagId) {
            const { runtime: _, ...rest } = widget.extraBindings ?? {};
            upd({ extraBindings: Object.keys(rest).length ? rest : undefined });
          } else {
            upd({ extraBindings: { ...widget.extraBindings, runtime: merged } });
          }
        };
        return (
          <div style={{ ...sectionStyle }}>
            <div style={sectionTitle}>가동시간 바인딩</div>
            <Field label="미리보기 값 (디자인 모드)">
              <input
                title="가동시간 미리보기 값"
                style={inputStyle}
                value={String(widget.properties.runtimePreviewValue ?? '')}
                placeholder="예: 1234"
                onChange={(e) => upd({ properties: { ...widget.properties, runtimePreviewValue: e.target.value } })}
              />
            </Field>
            <Field label="태그 ID">
              <input
                style={inputStyle}
                list={`tag-list-runtime-${widget.id}`}
                value={rt?.tagId ?? ''}
                placeholder="없으면 숨김"
                onChange={(e) => setRt({ tagId: e.target.value })}
              />
              <datalist id={`tag-list-runtime-${widget.id}`}>
                {serverTags.map((t) => (
                  <option key={t.tagId} value={t.tagId} label={t.description} />
                ))}
              </datalist>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <Field label="데이터 타입">
                <select title="가동시간 데이터 타입" style={inputStyle} value={rt?.dataType ?? 'INT'}
                  onChange={(e) => setRt({ dataType: e.target.value as Widget['binding']['dataType'] })}>
                  {['INT', 'FLOAT', 'BOOL', 'STRING'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="갱신주기 (ms)">
                <input type="number" title="가동시간 갱신주기" style={inputStyle} value={rt?.refreshRate ?? 1000}
                  onChange={(e) => setRt({ refreshRate: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="단위">
              <input style={inputStyle} value={String(widget.properties.runtimeUnit ?? 'h')}
                onChange={(e) => upd({ properties: { ...widget.properties, runtimeUnit: e.target.value } })} />
            </Field>
          </div>
        );
      })()}

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

      {widget.type === 'PIPE' && (
        <div style={{ ...sectionStyle }}>
          <div style={sectionTitle}>파이프 설정</div>
          <Field label="방향">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['horizontal', 'vertical'] as const).map((val) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`pipe-orient-${widget.id}`}
                    checked={(widget.properties.orientation ?? 'horizontal') === val}
                    onChange={() => upd({ properties: { ...widget.properties, orientation: val } })}
                  />
                  <span style={{ fontSize: 12, color: '#ccc' }}>{val === 'horizontal' ? '수평' : '수직'}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={widget.properties.flanges !== false}
                onChange={(e) => upd({ properties: { ...widget.properties, flanges: e.target.checked } })}
              />
              <span style={{ fontSize: 12, color: '#ccc' }}>플랜지 표시</span>
            </label>
          </Field>
          {widget.properties.flanges !== false && (
            <Field label="플랜지 크기 (px)">
              <input
                type="number" min={2} max={30} style={inputStyle}
                title="플랜지 크기"
                value={Number(widget.properties.flangeSize ?? 8)}
                onChange={(e) => upd({ properties: { ...widget.properties, flangeSize: Number(e.target.value) } })}
              />
            </Field>
          )}
          <Field label="흐름 속도 (px/tick)">
            <input
              type="number" min={0.5} max={30} step={0.5} style={inputStyle}
              title="흐름 속도"
              value={Number(widget.properties.flowSpeed ?? 3)}
              onChange={(e) => upd({ properties: { ...widget.properties, flowSpeed: Number(e.target.value) } })}
            />
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
          <Field label="화살표 크기 (px)">
            <input type="number" min={4} max={60} style={inputStyle}
              title="화살표 크기"
              value={Number(widget.properties.arrowSize ?? 10)}
              onChange={(e) => upd({ properties: { ...widget.properties, arrowSize: Number(e.target.value) } })} />
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
          <Field label="관절">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#aaa' }}>
                {((widget.properties.waypoints as unknown[]) ?? []).length}개
              </span>
              <span style={{ fontSize: 11, color: '#666' }}>· 캔버스에서 더블클릭으로 추가/제거</span>
              {((widget.properties.waypoints as unknown[]) ?? []).length > 0 && (
                <button
                  type="button"
                  onClick={() => upd({ properties: { ...widget.properties, waypoints: [] } })}
                  style={{ marginLeft: 'auto', fontSize: 10, background: '#3a1a1a', color: '#f66', border: '1px solid #5a2a2a', borderRadius: 3, padding: '2px 6px', cursor: 'pointer' }}
                >
                  모두 제거
                </button>
              )}
            </div>
          </Field>
        </div>
      )}
    </div>
  );
};
