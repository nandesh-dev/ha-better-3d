import { type Cache } from '@/utility/cache'

export class ResourceManager {
    private cache?: Cache
    private activeRequests: Request[] = []

    constructor(cache?: Cache) {
        this.cache = cache
    }

    public load(url: string): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            let request = this.activeRequests.find((request) => request.url == url)

            if (request) {
                request.addEventListener('success', (event) => {
                    resolve(event.data)
                })
                request.addEventListener('failed', (event) => {
                    reject(event.error)
                })
            }

            request = new Request(url)

            this.activeRequests.push(request)

            Promise.race<ArrayBuffer>([
                new Promise((resolve, _) => {
                    this.cache
                        ?.get(url)
                        .then(resolve)
                        .catch(() => {}) // TODO Report some kind of warning when cache get fails
                }),
                new Promise((resolve, reject) => {
                    fetch(url)
                        .then((raw) => raw.arrayBuffer())
                        .then((data) => {
                            this.activeRequests = this.activeRequests.filter((request) => request.url !== url)
                            request.success(data)
                            resolve(data)
                        })
                        .catch(reject)
                }),
            ])
                .then(resolve)
                .catch(reject)
        })
    }
}

class RequestSuccessEvent extends Event {
    public data: ArrayBuffer
    constructor(data: ArrayBuffer) {
        super('success')
        this.data = data
    }
}

class RequestFailedEvent extends Event {
    public error: Error
    constructor(error: Error) {
        super('failed')
        this.error = error
    }
}

type RequestEventListener<E> = (event: E) => void

type RequestEventMap = {
    success: RequestSuccessEvent
    failed: RequestFailedEvent
}

export class Request {
    public url: string
    private onSuccessEventListeners: RequestEventListener<RequestSuccessEvent>[] = []
    private onErrorEventListeners: RequestEventListener<RequestFailedEvent>[] = []
    constructor(url: string) {
        this.url = url
    }

    public success(data: ArrayBuffer) {
        this.onSuccessEventListeners.forEach((listener) => listener(new RequestSuccessEvent(data)))
    }

    public fail(error: Error) {
        this.onErrorEventListeners.forEach((listener) => listener(new RequestFailedEvent(error)))
    }

    public addEventListener<T extends keyof RequestEventMap>(
        type: T,
        listener: RequestEventListener<RequestEventMap[T]>
    ) {
        switch (type) {
            case 'success':
                this.onSuccessEventListeners.push(listener as RequestEventListener<RequestSuccessEvent>)
                return
            case 'failed':
                this.onErrorEventListeners.push(listener as RequestEventListener<RequestFailedEvent>)
                return
        }
    }
}
