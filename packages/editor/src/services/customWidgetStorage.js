export class CustomWidgetStorage {
    constructor() {
        this.dbName = 'wzHmiWidgets';
        this.dbVersion = 1;
        this.storeName = 'customWidgets';
    }
    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }
    async saveCustomWidget(metadata) {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(metadata);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async loadAllCustomWidgets() {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const widgets = request.result;
                // 생성일 기준 내림차순 정렬
                widgets.sort((a, b) => b.createdAt - a.createdAt);
                resolve(widgets);
            };
            request.onerror = () => reject(request.error);
        });
    }
    async loadCustomWidget(id) {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }
    async deleteCustomWidget(id) {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async updateCustomWidget(id, updates) {
        const existing = await this.loadCustomWidget(id);
        if (!existing) {
            throw new Error(`Custom widget with id ${id} not found`);
        }
        const updated = { ...existing, ...updates };
        await this.saveCustomWidget(updated);
    }
    async getCustomWidgetsByType(type) {
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
    async clearAllCustomWidgets() {
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
    async getWidgetCount() {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async exportWidgets() {
        const widgets = await this.loadAllCustomWidgets();
        return JSON.stringify(widgets, null, 2);
    }
    async importWidgets(jsonData) {
        try {
            const widgets = JSON.parse(jsonData);
            for (const widget of widgets) {
                await this.saveCustomWidget(widget);
            }
        }
        catch (error) {
            throw new Error('Invalid widget data format');
        }
    }
}
// 싱글톤 인스턴스
export const customWidgetStorage = new CustomWidgetStorage();
