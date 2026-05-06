export type WidgetType =
  | 'MOTOR'
  | 'VALVE'
  | 'GAUGE'
  | 'CONVEYOR'
  | 'TEXT_LABEL'
  | 'ALARM'
  | 'TANK'
  | 'LINE';

export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type LineType = 'straight' | 'orthogonal' | 'curved';

export type DataType = 'INT' | 'FLOAT' | 'BOOL' | 'STRING';
export type AnimationEffect = 'blink' | 'static' | 'pulse' | 'flow';

export interface HmiCanvas {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
}

export interface Geometry {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface Binding {
  tagId: string;
  dataType: DataType;
  refreshRate: number;
  formatter?: string;
}

export interface Animation {
  condition: string;
  property: string;
  value: string;
  effect: AnimationEffect;
}

export interface WidgetStyles {
  opacity: number;
  visible: boolean;
  baseColor: string;
  animations: Animation[];
}

export interface WidgetActions {
  onClick?: string;
  confirmRequired?: boolean;
  role?: string;
}

export interface WidgetProperties {
  label?: string;
  showTooltip?: boolean;
  showValue?: boolean;
  unit?: string;
  min?: number;
  max?: number;
  fontFamily?: string;
  fontSize?: number;
  previewValue?: string;
  // LINE 전용
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  lineWidth?: number;
  lineStyle?: LineStyle;
  lineType?: LineType;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  flowSpeed?: number;
  [key: string]: unknown;
}

export interface Widget {
  id: string;
  type: WidgetType;
  name: string;
  geometry: Geometry;
  binding: Binding;
  styles: WidgetStyles;
  actions: WidgetActions;
  properties: WidgetProperties;
}

export interface HmiSchema {
  v: string;
  canvas: HmiCanvas;
  widgets: Widget[];
}

export interface TagValue {
  tagId: string;
  value: number | string | boolean;
  timestamp: number;
}

export interface TagUpdate {
  type: 'tag_update';
  data: TagValue;
}

export type FormatterFn = (value: number | string | boolean) => string;
