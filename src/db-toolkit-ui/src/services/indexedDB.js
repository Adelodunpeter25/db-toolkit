/**
 * IndexedDB service for caching AI analysis results
 */
import { INDEXEDDB_CONFIG } from '../utils/constants';

class IndexedDBService {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXEDDB_CONFIG.DB_NAME, INDEXEDDB_CONFIG.VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create schema analysis store
        if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.SCHEMA_ANALYSIS)) {
          db.createObjectStore(INDEXEDDB_CONFIG.STORES.SCHEMA_ANALYSIS, { keyPath: 'key' });
        }

        // Create table analysis store
        if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.TABLE_ANALYSIS)) {
          db.createObjectStore(INDEXEDDB_CONFIG.STORES.TABLE_ANALYSIS, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  async get(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache expired
        if (Date.now() > result.expiresAt) {
          this.delete(storeName, key);
          resolve(null);
          return;
        }

        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(storeName, key, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const record = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + INDEXEDDB_CONFIG.CACHE_DURATION
      };
      const request = store.put(record);

      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanupExpired() {
    await this.init();
    const stores = [
      INDEXEDDB_CONFIG.STORES.SCHEMA_ANALYSIS,
      INDEXEDDB_CONFIG.STORES.TABLE_ANALYSIS
    ];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (Date.now() > cursor.value.expiresAt) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  }
}

export const indexedDBService = new IndexedDBService();

// Cleanup expired cache on app start
if (typeof window !== 'undefined') {
  indexedDBService.cleanupExpired().catch(console.error);
}
