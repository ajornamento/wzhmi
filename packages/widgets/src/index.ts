export { BaseWidget } from './base/BaseWidget';
export { MotorWidget } from './MotorWidget';
export { ValveWidget } from './ValveWidget';
export { GaugeWidget } from './GaugeWidget';
export { ConveyorWidget } from './ConveyorWidget';
export { TankWidget } from './TankWidget';
export { AlarmWidget } from './AlarmWidget';
export { TextLabelWidget } from './TextLabelWidget';
export { LineWidget } from './LineWidget';

import type { WidgetType } from '@wzhmi/core';

export const WIDGET_TAG_MAP: Record<WidgetType, string> = {
  MOTOR: 'hmi-motor',
  VALVE: 'hmi-valve',
  GAUGE: 'hmi-gauge',
  CONVEYOR: 'hmi-conveyor',
  TANK: 'hmi-tank',
  ALARM: 'hmi-alarm',
  TEXT_LABEL: 'hmi-text-label',
  LINE: 'hmi-line',
};

export function registerAllWidgets() {
  import('./MotorWidget');
  import('./ValveWidget');
  import('./GaugeWidget');
  import('./ConveyorWidget');
  import('./TankWidget');
  import('./AlarmWidget');
  import('./TextLabelWidget');
  import('./LineWidget');
}
