import { create } from 'zustand';
import { emptySchema } from '@wzhmi/core';
export const useViewerStore = create((set) => ({
    schema: emptySchema(),
    serverUrl: 'ws://localhost:3001',
    scale: 1,
    currentUser: { id: 'user1', role: 'VIEWER' },
    dataSourceMode: 'websocket',
    pollInterval: 2000,
    setSchema: (schema) => set({
        schema: {
            ...schema,
            widgets: schema.widgets.map((w) => ({
                ...w,
                styles: { ...w.styles, animations: w.styles.animations ?? [] },
            })),
        },
    }),
    setServerUrl: (serverUrl) => set({ serverUrl }),
    setScale: (scale) => set({ scale }),
    setCurrentUser: (currentUser) => set({ currentUser }),
    setDataSourceMode: (dataSourceMode) => set({ dataSourceMode }),
    setPollInterval: (pollInterval) => set({ pollInterval }),
}));
