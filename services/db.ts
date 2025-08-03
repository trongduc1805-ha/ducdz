import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ducdz-learn-db';
const STORE_NAME = 'directory-handles';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDb = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

export const storeDirectoryHandle = async (key: string, handle: FileSystemDirectoryHandle): Promise<void> => {
  const db = await getDb();
  await db.put(STORE_NAME, handle, key);
};

export const getDirectoryHandle = async (key: string): Promise<FileSystemDirectoryHandle | undefined> => {
  const db = await getDb();
  return db.get(STORE_NAME, key);
};

export const removeDirectoryHandle = async (key: string): Promise<void> => {
    const db = await getDb();
    await db.delete(STORE_NAME, key);
};
