export class PollingDataSource {
    constructor(serverUrl, intervalMs = 2000) {
        this.subscribers = new Map();
        this.timer = null;
        this.httpUrl = serverUrl
            .replace(/^ws:\/\//, 'http://')
            .replace(/^wss:\/\//, 'https://');
        this.intervalMs = intervalMs;
    }
    connect() {
        this.poll();
        this.timer = setInterval(() => this.poll(), this.intervalMs);
    }
    disconnect() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    subscribe(tagId, cb) {
        if (!this.subscribers.has(tagId))
            this.subscribers.set(tagId, new Set());
        this.subscribers.get(tagId).add(cb);
        this.pollBatch([tagId]);
    }
    unsubscribe(tagId, cb) {
        const set = this.subscribers.get(tagId);
        set?.delete(cb);
        if (set?.size === 0)
            this.subscribers.delete(tagId);
    }
    async poll() {
        const tagIds = Array.from(this.subscribers.keys());
        if (tagIds.length === 0)
            return;
        await this.pollBatch(tagIds);
    }
    async pollBatch(tagIds) {
        try {
            const res = await fetch(`${this.httpUrl}/api/tags/values`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds }),
            });
            if (!res.ok)
                return;
            const values = await res.json();
            for (const tv of values) {
                this.subscribers.get(tv.tagId)?.forEach((cb) => cb(tv.value));
            }
        }
        catch { }
    }
}
