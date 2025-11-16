import { Configuration } from '@/configuration'
import { DBSchema, openDB } from 'idb'

const CONFIGURATION_HISTORY_OBJECT_STORE_NAME = 'configuration-history' as const
const BETTER_3D_DATABASE_NAME = 'better-3d' as const

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const YEAR = 365 * DAY

interface Schema extends DBSchema {
    [CONFIGURATION_HISTORY_OBJECT_STORE_NAME]: {
        key: number
        value: {
            timestamp: number
            configuration: Configuration
        }
    }
}

const DatabasePromise = openDB<Schema>(BETTER_3D_DATABASE_NAME, 1, {
    upgrade: (db) => {
        db.createObjectStore(CONFIGURATION_HISTORY_OBJECT_STORE_NAME, { keyPath: 'timestamp' })
    },
})

export async function addConfigurationHistory(configuration: Configuration) {
    const db = await DatabasePromise
    const timestamp = Date.now()
    db.put(CONFIGURATION_HISTORY_OBJECT_STORE_NAME, { timestamp, configuration })

    const store = db
        .transaction(CONFIGURATION_HISTORY_OBJECT_STORE_NAME, 'readwrite')
        .objectStore(CONFIGURATION_HISTORY_OBJECT_STORE_NAME)
    const allEntries = await store.getAll(IDBKeyRange.upperBound(timestamp))

    // Tiered retention system
    let last5s = 0
    let last1m = 0
    let last1h = 0
    let last1d = 0
    let last1mo = 0
    let last1y = 0

    for (const entry of allEntries) {
        const age = timestamp - entry.timestamp

        let shouldKeep = false

        if (age <= 25 * SECOND) {
            if (entry.timestamp - last5s >= 5 * SECOND) {
                shouldKeep = true
                last5s = entry.timestamp
            }
        } else if (age <= 5 * MINUTE) {
            if (entry.timestamp - last1m >= MINUTE) {
                shouldKeep = true
                last1m = entry.timestamp
            }
        } else if (age <= 5 * HOUR) {
            if (entry.timestamp - last1h >= HOUR) {
                shouldKeep = true
                last1h = entry.timestamp
            }
        } else if (age <= 5 * DAY) {
            if (entry.timestamp - last1d >= DAY) {
                shouldKeep = true
                last1d = entry.timestamp
            }
        } else if (age <= 5 * MONTH) {
            if (entry.timestamp - last1mo >= MONTH) {
                shouldKeep = true
                last1mo = entry.timestamp
            }
        } else {
            if (entry.timestamp - last1y >= YEAR) {
                shouldKeep = true
                last1y = entry.timestamp
            }
        }

        if (!shouldKeep) {
            await store.delete(entry.timestamp)
        }
    }
}

export async function getConfigurationHistory() {
    const db = await DatabasePromise
    return (await db.getAll(CONFIGURATION_HISTORY_OBJECT_STORE_NAME)).reverse()
}
