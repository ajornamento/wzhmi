import { findMatchingAnimation, format } from '@wzhmi/core';
import type { Widget, Animation } from '@wzhmi/core';

export abstract class BaseWidget extends HTMLElement {
  protected _widget: Widget | null = null;
  protected _value: number | string | boolean = 0;
  protected _blinkInterval: ReturnType<typeof setInterval> | null = null;
  protected _blinkState = false;

  static get observedAttributes() {
    return ['data-value'];
  }

  connectedCallback() {
    this.style.display = 'block';
    this.style.position = 'absolute';
    this.style.overflow = 'hidden';
    this.render();
  }

  attributeChangedCallback(name: string, _old: string, newVal: string) {
    if (name === 'data-value') {
      this._value = isNaN(Number(newVal)) ? newVal : Number(newVal);
      this.updateVisuals();
    }
  }

  configure(widget: Widget) {
    this._widget = widget;
    this.applyGeometry();
    this.render();
  }

  setValue(value: number | string | boolean) {
    this._value = value;
    this.updateVisuals();
  }

  protected applyGeometry() {
    if (!this._widget) return;
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
      zIndex: String(zIndex),
      opacity: String(this._widget.styles.opacity),
      display: this._widget.styles.visible ? 'block' : 'none',
    });
  }

  protected getActiveAnimation(): Animation | null {
    if (!this._widget) return null;
    return findMatchingAnimation(this._widget.styles.animations, this._value);
  }

  protected getDisplayValue(): string {
    if (!this._widget) return String(this._value);
    return format(this._widget.binding.formatter, this._value);
  }

  protected getLabelFontSize(defaultSize: number): string {
    const size = this._widget?.properties.fontSize;
    return size != null ? String(size) : String(defaultSize);
  }

  protected getLabelFontFamily(defaultFamily = 'sans-serif'): string {
    return String(this._widget?.properties.fontFamily ?? defaultFamily);
  }

  protected applyLabelFont(el: SVGTextElement, defaultSize: number, defaultFamily = 'sans-serif') {
    el.setAttribute('font-size', this.getLabelFontSize(defaultSize));
    el.setAttribute('font-family', this.getLabelFontFamily(defaultFamily));
  }

  protected startBlink(color: string) {
    this.stopBlink();
    this._blinkState = true;
    this._blinkInterval = setInterval(() => {
      this._blinkState = !this._blinkState;
      this.applyColor(this._blinkState ? color : this._widget?.styles.baseColor ?? '#808080');
    }, 500);
  }

  protected stopBlink() {
    if (this._blinkInterval !== null) {
      clearInterval(this._blinkInterval);
      this._blinkInterval = null;
    }
  }

  disconnectedCallback() {
    this.stopBlink();
  }

  protected applyColor(_color: string) {}

  protected abstract render(): void;
  protected abstract updateVisuals(): void;
}
