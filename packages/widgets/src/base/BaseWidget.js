import { findMatchingAnimation, format } from '@wzhmi/core';
export class BaseWidget extends HTMLElement {
    constructor() {
        super(...arguments);
        this._widget = null;
        this._value = 0;
        this._blinkInterval = null;
        this._blinkState = false;
        this._pulseInterval = null;
        this._pulseScale = 1;
        this._labelElement = null;
    }
    static get observedAttributes() {
        return ['data-value'];
    }
    connectedCallback() {
        this.style.display = 'block';
        this.style.position = 'absolute';
        this.style.overflow = 'visible';
        this.render();
    }
    attributeChangedCallback(name, _old, newVal) {
        if (name === 'data-value') {
            this._value = isNaN(Number(newVal)) ? newVal : Number(newVal);
            this.updateVisuals();
        }
    }
    configure(widget) {
        this._widget = widget;
        this.applyGeometry();
        this.render();
    }
    setValue(value) {
        this._value = value;
        this.updateVisuals();
    }
    applyGeometry() {
        if (!this._widget)
            return;
        const { x, y, width, height, rotation, zIndex, opacity = 1 } = {
            ...this._widget.geometry,
            opacity: this._widget.styles.opacity,
        };
        Object.assign(this.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            transform: rotation !== 0 ? `rotate(${rotation}deg)` : '',
            transformOrigin: 'center center',
            zIndex: String(zIndex),
            opacity: String(this._widget.styles.opacity),
            display: this._widget.styles.visible ? 'block' : 'none',
        });
    }
    shouldDisplayLabel(side) {
        const visibility = this._widget?.properties.labelVisibility;
        if (!visibility)
            return true;
        return visibility[side] !== false;
    }
    getCounterLabelRotation(cx, cy) {
        const rotation = this._widget?.geometry.rotation ?? 0;
        return rotation ? `rotate(${-rotation}, ${cx}, ${cy})` : '';
    }
    createLabelElement(text, side = 'bottom') {
        const label = document.createElement('div');
        label.className = `widget-label widget-label-${side}`;
        label.textContent = text;
        label.style.position = 'absolute';
        label.style.pointerEvents = 'none';
        label.style.userSelect = 'none';
        label.style.fontSize = `${this.getLabelFontSize(11)}px`;
        label.style.fontFamily = this.getLabelFontFamily('sans-serif');
        label.style.color = String(this._widget?.properties.labelColor ?? '#cccccc');
        label.style.zIndex = '10';
        label.style.whiteSpace = 'nowrap';
        const rotation = this._widget?.geometry.rotation ?? 0;
        label.style.transform = rotation ? `rotate(${-rotation}deg)` : '';
        label.style.transformOrigin = 'center center';
        if (!this._widget)
            return label;
        const { x, y, width, height } = this._widget.geometry;
        const labelGap = 4;
        // 라벨 위치를 위젯 상대 좌표로 계산 (위젯 경계 외부)
        switch (side) {
            case 'top':
                label.style.left = '50%';
                label.style.top = '-1.5em';
                label.style.transform = rotation ? `translateX(-50%) rotate(${-rotation}deg)` : 'translateX(-50%)';
                break;
            case 'bottom':
                label.style.left = '50%';
                label.style.bottom = '-1.5em';
                label.style.transform = rotation ? `translateX(-50%) rotate(${-rotation}deg)` : 'translateX(-50%)';
                break;
            case 'left':
                label.style.left = '-8px';
                label.style.top = '50%';
                label.style.transform = rotation ? `translateX(-100%) translateY(-50%) rotate(${-rotation}deg)` : 'translateX(-100%) translateY(-50%)';
                break;
            case 'right':
                label.style.right = '-8px';
                label.style.top = '50%';
                label.style.transform = rotation ? `translateY(-50%) rotate(${-rotation}deg)` : 'translateY(-50%)';
                break;
        }
        return label;
    }
    getActiveAnimation() {
        if (!this._widget)
            return null;
        return findMatchingAnimation(this._widget.styles.animations, this._value);
    }
    getDisplayValue() {
        if (!this._widget)
            return String(this._value);
        return format(this._widget.binding.formatter, this._value);
    }
    getLabelFontSize(defaultSize) {
        const size = this._widget?.properties.fontSize;
        return size != null ? String(size) : String(defaultSize);
    }
    getLabelFontFamily(defaultFamily = 'sans-serif') {
        return String(this._widget?.properties.fontFamily ?? defaultFamily);
    }
    applyLabelFont(el, defaultSize, defaultFamily = 'sans-serif') {
        el.setAttribute('font-size', this.getLabelFontSize(defaultSize));
        el.setAttribute('font-family', this.getLabelFontFamily(defaultFamily));
    }
    startBlink(color) {
        this.stopBlink();
        this._blinkState = true;
        this._blinkInterval = setInterval(() => {
            this._blinkState = !this._blinkState;
            this.applyColor(this._blinkState ? color : this._widget?.styles.baseColor ?? '#808080');
        }, 500);
    }
    stopBlink() {
        if (this._blinkInterval !== null) {
            clearInterval(this._blinkInterval);
            this._blinkInterval = null;
        }
    }
    startPulse(color) {
        this.stopPulse();
        this._pulseScale = 1;
        this._pulseInterval = setInterval(() => {
            this._pulseScale = this._pulseScale === 1 ? 1.2 : 1;
            this.style.transform = `scale(${this._pulseScale})`;
            this.applyColor(this._pulseScale === 1.2 ? color : this._widget?.styles.baseColor ?? '#808080');
        }, 600);
    }
    stopPulse() {
        if (this._pulseInterval !== null) {
            clearInterval(this._pulseInterval);
            this._pulseInterval = null;
        }
        this._pulseScale = 1;
        this.style.transform = '';
    }
    disconnectedCallback() {
        this.stopBlink();
        this.stopPulse();
    }
    applyColor(_color) { }
}
