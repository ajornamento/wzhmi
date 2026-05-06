import { create } from 'zustand';
import type { HmiSchema } from '@wzhmi/core';
import { emptySchema } from '@wzhmi/core';

interface ViewerState {
  schema: HmiSchema;
  serverUrl: string;
  scale: number;
  currentUser: { id: string; role: string };
  setSchema: (schema: HmiSchema) => void;
  setServerUrl: (url: string) => void;
  setScale: (scale: number) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  schema: emptySchema(),
  serverUrl: 'ws://localhost:3001',
  scale: 1,
  currentUser: { id: 'user1', role: 'OPERATOR' },
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
}));
