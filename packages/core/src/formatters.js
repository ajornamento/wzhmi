const registry = {
    motorStatus: (v) => {
        const n = Number(v);
        if (n === 0)
            return '정지';
        if (n === 1)
            return '가동';
        if (n === 2)
            return '오류';
        return String(v);
    },
    valveState: (v) => {
        const n = Number(v);
        if (n === 0)
            return '닫힘';
        if (n === 1)
            return '열림';
        return `${n}%`;
    },
    onOff: (v) => (v ? 'ON' : 'OFF'),
    yesNo: (v) => (v ? 'Yes' : 'No'),
    percent: (v) => `${Number(v).toFixed(1)}%`,
    temperature: (v) => `${Number(v).toFixed(1)}°C`,
    pressure: (v) => `${Number(v).toFixed(2)} bar`,
    rpm: (v) => `${Number(v)} RPM`,
};
export function format(formatterName, value) {
    if (!formatterName)
        return String(value);
    const fn = registry[formatterName];
    return fn ? fn(value) : String(value);
}
export function registerFormatter(name, fn) {
    registry[name] = fn;
}
