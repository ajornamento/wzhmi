import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
const PROPERTY_OPTIONS = [
    '표시값', '색상', '회전', '크기', '투명도', '툴팁', '단위', '최소값', '최대값',
    '폰트패밀리', '폰트크기', '미리보기값', '선너비', '선스타일', '선타입',
    '화살표시작', '화살표끝', '흐름속도'
];
export const WidgetRegistryForm = ({ initialData, onSave, onCancel, }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        label: '',
        description: '',
        image: null,
        defaultWidth: 100,
        defaultHeight: 100,
        animationSupport: true,
        bindingSupport: true,
        supportedProperties: ['표시값', '색상'],
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.type.replace('CUSTOM_', ''),
                label: initialData.label,
                description: initialData.description,
                image: initialData.imageData || initialData.imageUrl || null,
                defaultWidth: initialData.defaultGeometry.width,
                defaultHeight: initialData.defaultGeometry.height,
                animationSupport: initialData.animationSupport,
                bindingSupport: initialData.bindingSupport,
                supportedProperties: initialData.supportedProperties,
            });
            setImagePreview(initialData.imageData || initialData.imageUrl || null);
        }
    }, [initialData]);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = '위젯명을 입력해주세요';
        }
        else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.name)) {
            newErrors.name = '위젯명은 영문자로 시작하고 영문자, 숫자, 밑줄만 사용할 수 있습니다';
        }
        if (!formData.label.trim()) {
            newErrors.label = '표시명을 입력해주세요';
        }
        if (!formData.description.trim()) {
            newErrors.description = '설명을 입력해주세요';
        }
        if (!formData.image) {
            newErrors.image = '이미지를 선택해주세요';
        }
        if (formData.defaultWidth <= 0) {
            newErrors.defaultWidth = '너비는 1 이상이어야 합니다';
        }
        if (formData.defaultHeight <= 0) {
            newErrors.defaultHeight = '높이는 1 이상이어야 합니다';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleImageSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            setErrors({ ...errors, image: '이미지 파일만 선택할 수 있습니다' });
            return;
        }
        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            setErrors({ ...errors, image: '이미지 크기는 5MB 이하여야 합니다' });
            return;
        }
        setFormData({ ...formData, image: file });
        setErrors({ ...errors, image: '' });
        // 미리보기 생성
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result);
        };
        reader.readAsDataURL(file);
    };
    const handlePropertyToggle = (property) => {
        const current = formData.supportedProperties;
        const updated = current.includes(property)
            ? current.filter(p => p !== property)
            : [...current, property];
        setFormData({ ...formData, supportedProperties: updated });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        try {
            let imageData;
            if (formData.image instanceof File) {
                // 새 파일인 경우 Base64로 변환
                imageData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result);
                    reader.readAsDataURL(formData.image);
                });
            }
            else if (typeof formData.image === 'string') {
                // 기존 이미지 데이터
                imageData = formData.image;
            }
            const metadata = {
                id: initialData?.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: `CUSTOM_${formData.name.toUpperCase()}`,
                label: formData.label,
                image: `/custom-widgets/${formData.name}.png`, // 런타임용 경로
                description: formData.description,
                imageData,
                isBuiltin: false,
                createdAt: initialData?.createdAt || Date.now(),
                version: initialData?.version || '1.0.0',
                author: initialData?.author,
                defaultGeometry: {
                    width: formData.defaultWidth,
                    height: formData.defaultHeight,
                },
                supportedProperties: formData.supportedProperties,
                animationSupport: formData.animationSupport,
                bindingSupport: formData.bindingSupport,
            };
            onSave(metadata);
        }
        catch (error) {
            console.error('Failed to process form:', error);
            alert('폼 처리 중 오류가 발생했습니다.');
        }
    };
    return (_jsxs("div", { children: [_jsx("h3", { style: { margin: '0 0 20px 0', color: '#fff', fontSize: 16 }, children: initialData ? '위젯 편집' : '새 위젯 등록' }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { display: 'grid', gap: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }, children: "\uC704\uC82F\uBA85 *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "\uC608: my_motor", style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            backgroundColor: '#333',
                                            border: '1px solid #555',
                                            borderRadius: 4,
                                            color: '#fff',
                                            fontSize: 14,
                                        } }), errors.name && _jsx("div", { style: { color: '#f44336', fontSize: 12, marginTop: 4 }, children: errors.name })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }, children: "\uD45C\uC2DC\uBA85 *" }), _jsx("input", { type: "text", value: formData.label, onChange: (e) => setFormData({ ...formData, label: e.target.value }), placeholder: "\uC608: \uB0B4 \uBAA8\uD130", style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            backgroundColor: '#333',
                                            border: '1px solid #555',
                                            borderRadius: 4,
                                            color: '#fff',
                                            fontSize: 14,
                                        } }), errors.label && _jsx("div", { style: { color: '#f44336', fontSize: 12, marginTop: 4 }, children: errors.label })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }, children: "\uC124\uBA85 *" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "\uC704\uC82F\uC5D0 \uB300\uD55C \uAC04\uB2E8\uD55C \uC124\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694", rows: 3, style: {
                                            width: '100%',
                                            padding: '8px 12px',
                                            backgroundColor: '#333',
                                            border: '1px solid #555',
                                            borderRadius: 4,
                                            color: '#fff',
                                            fontSize: 14,
                                            resize: 'vertical',
                                        } }), errors.description && _jsx("div", { style: { color: '#f44336', fontSize: 12, marginTop: 4 }, children: errors.description })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }, children: "\uC774\uBBF8\uC9C0 *" }), _jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'flex-start' }, children: [_jsx("div", { style: {
                                                    width: 100,
                                                    height: 100,
                                                    border: '2px dashed #555',
                                                    borderRadius: 8,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    backgroundColor: imagePreview ? 'transparent' : '#2a2a3a',
                                                }, onClick: () => fileInputRef.current?.click(), children: imagePreview ? (_jsx("img", { src: imagePreview, alt: "\uBBF8\uB9AC\uBCF4\uAE30", style: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6 } })) : (_jsxs("div", { style: { textAlign: 'center', color: '#888' }, children: [_jsx("div", { style: { fontSize: 24, marginBottom: 4 }, children: "\uD83D\uDCC1" }), _jsx("div", { style: { fontSize: 12 }, children: "\uD074\uB9AD\uD558\uC5EC \uC120\uD0DD" })] })) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageSelect, style: { display: 'none' } }), _jsx("button", { type: "button", onClick: () => fileInputRef.current?.click(), style: {
                                                            backgroundColor: '#555',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: 4,
                                                            cursor: 'pointer',
                                                            fontSize: 14,
                                                            marginBottom: 8,
                                                        }, children: "\uD30C\uC77C \uC120\uD0DD" }), _jsx("div", { style: { fontSize: 12, color: '#888' }, children: "PNG, JPG, SVG \uD30C\uC77C \uC9C0\uC6D0 (\uCD5C\uB300 5MB)" })] })] }), errors.image && _jsx("div", { style: { color: '#f44336', fontSize: 12, marginTop: 4 }, children: errors.image })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#ddd', fontSize: 14, marginBottom: 4 }, children: "\uAE30\uBCF8 \uD06C\uAE30" }), _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, color: '#888', marginRight: 4 }, children: "\uB108\uBE44:" }), _jsx("input", { type: "number", value: formData.defaultWidth, onChange: (e) => setFormData({ ...formData, defaultWidth: Number(e.target.value) }), min: 1, max: 1000, style: {
                                                            width: 80,
                                                            padding: '4px 8px',
                                                            backgroundColor: '#333',
                                                            border: '1px solid #555',
                                                            borderRadius: 4,
                                                            color: '#fff',
                                                            fontSize: 14,
                                                        } }), _jsx("span", { style: { fontSize: 12, color: '#888', marginLeft: 4 }, children: "px" })] }), _jsxs("div", { children: [_jsx("label", { style: { fontSize: 12, color: '#888', marginRight: 4 }, children: "\uB192\uC774:" }), _jsx("input", { type: "number", value: formData.defaultHeight, onChange: (e) => setFormData({ ...formData, defaultHeight: Number(e.target.value) }), min: 1, max: 1000, style: {
                                                            width: 80,
                                                            padding: '4px 8px',
                                                            backgroundColor: '#333',
                                                            border: '1px solid #555',
                                                            borderRadius: 4,
                                                            color: '#fff',
                                                            fontSize: 14,
                                                        } }), _jsx("span", { style: { fontSize: 12, color: '#888', marginLeft: 4 }, children: "px" })] })] }), (errors.defaultWidth || errors.defaultHeight) && (_jsx("div", { style: { color: '#f44336', fontSize: 12, marginTop: 4 }, children: errors.defaultWidth || errors.defaultHeight }))] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#ddd', fontSize: 14, marginBottom: 8 }, children: "\uAE30\uB2A5 \uC9C0\uC6D0" }), _jsxs("div", { style: { display: 'flex', gap: 16 }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: formData.animationSupport, onChange: (e) => setFormData({ ...formData, animationSupport: e.target.checked }) }), _jsx("span", { style: { color: '#ddd', fontSize: 14 }, children: "\uC560\uB2C8\uBA54\uC774\uC158 \uC9C0\uC6D0" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: formData.bindingSupport, onChange: (e) => setFormData({ ...formData, bindingSupport: e.target.checked }) }), _jsx("span", { style: { color: '#ddd', fontSize: 14 }, children: "\uB370\uC774\uD130 \uBC14\uC778\uB529 \uC9C0\uC6D0" })] })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', color: '#ddd', fontSize: 14, marginBottom: 8 }, children: "\uC9C0\uC6D0 \uC18D\uC131" }), _jsx("div", { style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                            gap: 8,
                                        }, children: PROPERTY_OPTIONS.map((property) => (_jsxs("label", { style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                                backgroundColor: formData.supportedProperties.includes(property) ? '#2e7d32' : '#333',
                                                borderRadius: 4,
                                                fontSize: 12,
                                                color: '#ddd',
                                            }, children: [_jsx("input", { type: "checkbox", checked: formData.supportedProperties.includes(property), onChange: () => handlePropertyToggle(property), style: { display: 'none' } }), formData.supportedProperties.includes(property) ? '✓' : '○', " ", property] }, property))) })] })] }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }, children: [_jsx("button", { type: "button", onClick: onCancel, style: {
                                    backgroundColor: '#555',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                }, children: "\uCDE8\uC18C" }), _jsx("button", { type: "submit", style: {
                                    backgroundColor: '#4a5fd5',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                }, children: initialData ? '수정' : '등록' })] })] })] }));
};
