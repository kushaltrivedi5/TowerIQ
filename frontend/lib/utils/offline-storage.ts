interface OfflineData {
  timestamp: number;
  data: any;
  type: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastAttempt?: number;
  attempts?: number;
}

const STORAGE_KEYS = {
  OFFLINE_DATA: 'offline_data',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync',
};

const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SYNC_ATTEMPTS = 3;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const offlineStorage = {
  // Save data for offline use
  async saveOfflineData(key: string, data: any, type: string): Promise<void> {
    try {
      const offlineData: OfflineData = {
        timestamp: Date.now(),
        data,
        type,
        syncStatus: 'pending',
        attempts: 0,
      };

      // Check storage size before saving
      const currentSize = await this.getStorageSize();
      const newDataSize = JSON.stringify(offlineData).length;
      
      if (currentSize + newDataSize > MAX_STORAGE_SIZE) {
        await this.cleanupStorage();
      }

      localStorage.setItem(key, JSON.stringify(offlineData));
      await this.addToSyncQueue(key);
    } catch (error) {
      console.error('Error saving offline data:', error);
      throw error;
    }
  },

  // Get offline data
  getOfflineData(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  },

  // Clear offline data
  clearOfflineData(key: string): void {
    try {
      localStorage.removeItem(key);
      this.removeFromSyncQueue(key);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  },

  // Add item to sync queue
  async addToSyncQueue(key: string): Promise<void> {
    try {
      const queue = this.getSyncQueue();
      if (!queue.includes(key)) {
        queue.push(key);
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  },

  // Remove item from sync queue
  removeFromSyncQueue(key: string): void {
    try {
      const queue = this.getSyncQueue();
      const updatedQueue = queue.filter(item => item !== key);
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  },

  // Get sync queue
  getSyncQueue(): string[] {
    try {
      const queue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  },

  // Get storage size
  async getStorageSize(): Promise<number> {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
    return totalSize;
  },

  // Cleanup storage
  async cleanupStorage(): Promise<void> {
    try {
      const queue = this.getSyncQueue();
      const items = queue.map(key => ({
        key,
        data: this.getOfflineData(key),
      }));

      // Sort by timestamp (oldest first)
      items.sort((a, b) => (a.data?.timestamp || 0) - (b.data?.timestamp || 0));

      // Remove oldest items until we're under the limit
      while (await this.getStorageSize() > MAX_STORAGE_SIZE && items.length > 0) {
        const item = items.shift();
        if (item) {
          this.clearOfflineData(item.key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up storage:', error);
    }
  },

  // Sync offline data
  async syncOfflineData(): Promise<void> {
    try {
      const queue = this.getSyncQueue();
      const now = Date.now();
      const lastSync = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '0');

      // Check if it's time to sync
      if (now - lastSync < SYNC_INTERVAL) {
        return;
      }

      for (const key of queue) {
        const data = this.getOfflineData(key);
        if (!data) continue;

        // Skip if max attempts reached
        if (data.attempts >= MAX_SYNC_ATTEMPTS) {
          data.syncStatus = 'failed';
          localStorage.setItem(key, JSON.stringify(data));
          continue;
        }

        try {
          // Attempt to sync data
          // This is a placeholder - implement your actual sync logic here
          await this.syncData(data);

          // Update sync status
          data.syncStatus = 'synced';
          data.lastAttempt = now;
          localStorage.setItem(key, JSON.stringify(data));
          this.removeFromSyncQueue(key);
        } catch (error) {
          // Update sync attempt
          data.syncStatus = 'failed';
          data.lastAttempt = now;
          data.attempts = (data.attempts || 0) + 1;
          localStorage.setItem(key, JSON.stringify(data));
        }
      }

      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toString());
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  },

  // Placeholder for actual sync implementation
  async syncData(data: OfflineData): Promise<void> {
    // Implement your actual sync logic here
    // This could be an API call, database update, etc.
    return new Promise((resolve) => setTimeout(resolve, 100));
  },
}; 