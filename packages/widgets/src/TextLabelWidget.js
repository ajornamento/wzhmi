import { BaseWidget } from './base/BaseWidget';
export class TextLabelWidget extends BaseWidget {
    constructor() {
        super(...arguments);
        this._textEl = null;
        this._hasSetValue = false;
    }
    configure(widget) {
        this._hasSetValue = false;
        super.configure(widget);
    }
    setValue(value) {
        this._hasSetValue = true;
        super.setValue(value);
    }
    get showValue() {
        // showValue가 명시적으로 false일 때만 숨김. 기본값은 true
        return this._widget?.properties.showValue !== false;
    }
    render() {
        this.innerHTML = '';
        const baseColor = this._widget?.styles.baseColor ?? '#ffffff';
        const labelColor = String(this._widget?.properties.labelColor ?? '#888888');
        const fontSize = Number(this._widget?.properties.fontSize ?? 12);
        const fontFamily = this.getLabelFontFamily('sans-serif');
        const rotation = this._widget?.geometry.rotation ?? 0;
        const div = document.createElement('div');
        Object.assign(div.style, {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily,
            textAlign: 'center',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px',
            padding: '4px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            userSelect: 'none',
            transform: rotation ? `rotate(${-rotation}deg)` : '',
            transformOrigin: 'center center',
        });
        if (this.showValue) {
            // 값 표시 모드: 상단 작은 라벨 + 중앙 큰 값 + 하단 단위
            const labelEl = document.createElement('div');
            Object.assign(labelEl.style, {
                fontSize: `${fontSize}px`,
                color: labelColor,
                marginBottom: '2px',
                lineHeight: '1.2',
            });
            labelEl.textContent = this._widget?.properties.label ?? '';
            const valueEl = document.createElement('div');
            Object.assign(valueEl.style, {
                fontSize: `${Math.round(fontSize * 1.5)}px`,
                fontWeight: 'bold',
                color: baseColor,
                lineHeight: '1.2',
            });
            valueEl.textContent = '';
            this._textEl = valueEl;
            const unit = String(this._widget?.properties.unit ?? '');
            if (unit) {
                const unitEl = document.createElement('div');
                Object.assign(unitEl.style, {
                    fontSize: `${Math.max(8, fontSize - 2)}px`,
                    color: labelColor,
                    marginTop: '2px',
                    lineHeight: '1.2',
                });
                unitEl.textContent = unit;
                div.appendChild(labelEl);
                div.appendChild(valueEl);
                div.appendChild(unitEl);
            }
            else {
                div.appendChild(labelEl);
                div.appendChild(valueEl);
            }
        }
        else {
            // 순수 라벨 모드: 라벨 텍스트만 크게 표시
            const labelEl = document.createElement('div');
            Object.assign(labelEl.style, {
                fontSize: `${fontSize}px`,
                color: this._widget?.properties.labelColor ? labelColor : baseColor,
                fontWeight: 'bold',
                lineHeight: '1.4',
                wordBreak: 'break-word',
            });
            labelEl.textContent = this._widget?.properties.label ?? '';
            this._textEl = labelEl;
            div.appendChild(labelEl);
        }
        this.appendChild(div);
        this.updateVisuals();
    }
    updateVisuals() {
        if (!this._textEl || !this._widget)
            return;
        this.stopBlink();
        this.stopPulse();
        const anim = this._hasSetValue ? this.getActiveAnimation() : null;
        const color = anim ? anim.value : this._widget.styles.baseColor;
        this._textEl.style.color = color;
        if (this.showValue) {
            this._textEl.textContent = this._hasSetValue ? this.getDisplayValue() : '';
        }
        // 순수 라벨 모드에서는 값 갱신 불필요 (라벨 텍스트는 render()에서 설정)
        if (anim?.effect === 'blink')
            this.startBlink(color);
        else if (anim?.effect === 'pulse')
            this.startPulse(color);
    }
    applyColor(color) {
        if (this._textEl)
            this._textEl.style.color = color;
    }
}
customElements.define('hmi-text-label', TextLabelWidget);
