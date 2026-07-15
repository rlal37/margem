/**
 * Wrapper leve de IndexedDB (seção 13.3, 14.1). Sem dependências: apenas
 * envolve as APIs nativas em Promises. Um único banco `margem` com dois
 * object stores — `project` (JSON do projeto) e `image` (Blob da imagem-base).
 */

const DB_NAME = 'margem'
const DB_VERSION = 1

export type StoreName = 'project' | 'image'
const STORES: readonly StoreName[] = ['project', 'image']

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  run: (objectStore: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase()
  try {
    const tx = db.transaction(store, mode)
    const result = await promisifyRequest(run(tx.objectStore(store)))
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    return result
  } finally {
    db.close()
  }
}

export function idbPut(
  store: StoreName,
  key: IDBValidKey,
  value: unknown,
): Promise<IDBValidKey> {
  return withStore(store, 'readwrite', (os) => os.put(value, key))
}

export function idbGet<T>(
  store: StoreName,
  key: IDBValidKey,
): Promise<T | undefined> {
  return withStore(store, 'readonly', (os) => os.get(key) as IDBRequest<T>)
}

export function idbDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  return withStore(store, 'readwrite', (os) => os.delete(key))
}
