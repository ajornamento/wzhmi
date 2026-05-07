import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const WidgetPreview = ({ widget, size = 'medium', }) => {
    const sizeMap = {
        small: { width: 64, height: 64, fontSize: 10 },
        medium: { width: 100, height: 100, fontSize: 12 },
        large: { width: 150, height: 150, fontSize: 14 },
    };
    const dimensions = sizeMap[size];
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: 12,
            backgroundColor: '#242436',
            border: '1px solid #333',
            borderRadius: 8,
        }, children: [_jsx("div", { style: {
                    width: dimensions.width,
                    height: dimensions.height,
                    borderRadius: 6,
                    backgroundColor: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid #555',
                }, children: widget.imageData ? (_jsx("img", { src: widget.imageData, alt: widget.label, style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    } })) : widget.imageUrl ? (_jsx("img", { src: widget.imageUrl, alt: widget.label, style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    } })) : (_jsx("span", { style: { fontSize: dimensions.width * 0.4 }, children: "\uD83D\uDCE6" })) }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                            fontSize: dimensions.fontSize,
                            color: '#fff',
                            fontWeight: 'bold',
                            marginBottom: 2,
                        }, children: widget.label }), _jsxs("div", { style: {
                            fontSize: dimensions.fontSize - 2,
                            color: '#888',
                        }, children: [widget.defaultGeometry.width, " \u00D7 ", widget.defaultGeometry.height] }), _jsxs("div", { style: {
                            fontSize: dimensions.fontSize - 2,
                            color: '#666',
                            marginTop: 2,
                        }, children: ["v", widget.version] })] }), _jsxs("div", { style: { display: 'flex', gap: 4, marginTop: 4 }, children: [widget.animationSupport && (_jsx("span", { title: "\uC560\uB2C8\uBA54\uC774\uC158 \uC9C0\uC6D0", style: { fontSize: 12 }, children: "\uD83C\uDFAC" })), widget.bindingSupport && (_jsx("span", { title: "\uB370\uC774\uD130 \uBC14\uC778\uB529 \uC9C0\uC6D0", style: { fontSize: 12 }, children: "\uD83D\uDD17" })), widget.supportedProperties.length > 0 && (_jsx("span", { title: `${widget.supportedProperties.length}개 속성 지원`, style: { fontSize: 12 }, children: "\u2699\uFE0F" }))] })] }));
};
