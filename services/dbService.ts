

import type { Product, Branch, Supplier, User, AuditLog } from '../types';

const DB_NAME = 'PremierluxDentalDB';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // FIX: Corrected 'IDBOpenRequest' to 'IDBOpenDBRequest'
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('branches')) {
        db.createObjectStore('branches', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('suppliers')) {
        db.createObjectStore('suppliers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('auditLogs')) {
        db.createObjectStore('auditLogs', { keyPath: 'id' });
      }
      console.log('IndexedDB upgrade complete.');
    };

    // FIX: Corrected 'IDBOpenRequest' to 'IDBOpenDBRequest'
    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB opened successfully.');
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const getAllData = async <T>(storeName: string): Promise<T[]> => {
  if (!db) await openDatabase();
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not open.'));
      return;
    }
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error(`Error getting data from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const putData = async <T extends { id: string }>(storeName: string, item: T): Promise<void> => {
  if (!db) await openDatabase();
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not open.'));
      return;
    }
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Error putting data into ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const putAllData = async <T extends { id: string }>(storeName: string, items: T[]): Promise<void> => {
  if (!db) await openDatabase();
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not open.'));
      return;
    }
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Clear existing data before adding new if we're replacing the whole collection
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
      items.forEach(item => {
        store.put(item);
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = (event) => {
        console.error(`Error putting all data into ${storeName}:`, (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    };
    clearRequest.onerror = (event) => {
      console.error(`Error clearing ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const deleteData = async (storeName: string, id: string): Promise<void> => {
  if (!db) await openDatabase();
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not open.'));
      return;
    }
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Error deleting data from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};