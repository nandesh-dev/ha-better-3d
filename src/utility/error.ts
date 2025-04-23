export class Error {
    public message: string
    public cause?: Error

    constructor(message: string, cause?: unknown) {
        this.message = message

        if (cause instanceof Error) {
            this.cause = cause
        } else if (typeof cause == 'string') {
            this.cause = new Error(cause)
        }
    }

    public toString() {
        if (!this.cause) return this.message

        const lines = this.message.split('\n')

        let firstLine = true
        for (const line of this.cause.toString().split('\n')) {
            if (firstLine) {
                lines.push('↳ ' + line)
                firstLine = false
            } else {
                lines.push('  ' + line)
            }
        }

        return lines.join('\n')
    }
}
