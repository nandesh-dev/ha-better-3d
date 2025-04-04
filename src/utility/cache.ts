const DATABASE_NAME = 'ha-better-3d'
const STORE_NAME = 'cache'
const KEY_PATH = 'url'

export class CannotOpenCacheDatabaseError extends Error {}
export class NoIndexDBSupportError extends Error {}
export class DatabaseNotOpenError extends Error {}
export class DataNotFound extends Error {}
export class CannotGetDataError extends Error {}
export class CannotStoreDataError extends Error {}

export class Cache {
    private db?: IDBDatabase
    constructor() {}

    public get(url: string) {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            this.open()
                .then(() => {
                    if (!this.db) return reject(new DatabaseNotOpenError())

                    const transaction = this.db.transaction(STORE_NAME, 'readonly')
                    const store = transaction.objectStore(STORE_NAME)
                    const request = store.get(url)

                    request.onsuccess = () => {
                        if (!request.result.data) return reject(new DataNotFound())
                        resolve(request.result.data)
                    }

                    request.onerror = () => {
                        reject(new CannotGetDataError(request.error?.message))
                    }
                })
                .catch(reject)
        })
    }

    public store(url: string, data: ArrayBuffer) {
        return new Promise<void>(async (resolve, reject) => {
            this.open()
                .then(() => {
                    if (!this.db) return reject(new DatabaseNotOpenError())

                    const transaction = this.db.transaction(STORE_NAME, 'readwrite')
                    const store = transaction.objectStore(STORE_NAME)
                    const request = store.put({ url, data })

                    request.onsuccess = () => {
                        resolve()
                    }

                    request.onerror = () => {
                        reject(new CannotStoreDataError(request.error?.message))
                    }
                })
                .catch(reject)
        })
    }

    private open() {
        return new Promise<void>((resolve, reject) => {
            if (this.db) return resolve()

            if (!window.indexedDB) return reject(new NoIndexDBSupportError())

            const request = window.indexedDB.open(DATABASE_NAME, 1)

            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: KEY_PATH })
                }
            }

            request.onsuccess = () => {
                if (this.db) this.db.close()
                this.db = request.result
                resolve()
            }

            request.onerror = () => {
                reject(new CannotOpenCacheDatabaseError(request.error?.message))
            }
        })
    }
}
