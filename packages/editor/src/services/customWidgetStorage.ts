import type { CustomWidgetMetadata } from '@wzhmi/core';

export class CustomWidgetStorage {
  private dbName = 'wzHmiWidgets';
  private dbVersion = 1;
  private storeName = 'customWidgets';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveCustomWidget(metadata: CustomWidgetMetadata): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(metadata);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async loadAllCustomWidgets(): Promise<CustomWidgetMetadata[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const widgets = request.result as CustomWidgetMetadata[];
        // 생성일 기준 내림차순 정렬
        widgets.sort((a, b) => b.createdAt - a.createdAt);
        resolve(widgets);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async loadCustomWidget(id: string): Promise<CustomWidgetMetadata | null> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCustomWidget(id: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateCustomWidget(id: string, updates: Partial<CustomWidgetMetadata>): Promise<void> {
    const existing = await this.loadCustomWidget(id);
    if (!existing) {
      throw new Error(`Custom widget with id ${id} not found`);
    }

    const updated = { ...existing, ...updates };
    await this.saveCustomWidget(updated);
  }

  async getCustomWidgetsByType(type: string): Promise<CustomWidgetMetadata[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('type');

    return new Promise((resolve, reject) => {
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllCustomWidgets(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 유틸리티 메서드들
  async getWidgetCount(): Promise<number> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async exportWidgets(): Promise<string> {
    const widgets = await this.loadAllCustomWidgets();
    return JSON.stringify(widgets, null, 2);
  }

  async importWidgets(jsonData: string): Promise<void> {
    try {
      const widgets = JSON.parse(jsonData) as CustomWidgetMetadata[];
      for (const widget of widgets) {
        await this.saveCustomWidget(widget);
      }
    } catch (error) {
      throw new Error('Invalid widget data format');
    }
  }
}

// 싱글톤 인스턴스
export const customWidgetStorage = new CustomWidgetStorage();