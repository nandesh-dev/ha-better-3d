export enum LogLevel {
    None = 0,
    Error = 1,
    Info = 2,
    Debug = 3,
}

export class Logger {
    private level: LogLevel
    private onLogListener: (log: string, level: LogLevel) => void
    constructor() {
        this.level = LogLevel.None
        this.onLogListener = () => {}
    }

    public error(error: string | Error) {
        if (this.level >= LogLevel.Error) {
            console.error(`[ Better 3D ] ${error.toString()}`)
            this.onLogListener(error.toString(), LogLevel.Error)
        }
    }

    public info(info: string) {
        if (this.level >= LogLevel.Info) {
            console.log(`[ Better 3D ] ${info}`)
            this.onLogListener(info, LogLevel.Info)
        }
    }

    public debug(message: string) {
        if (this.level >= LogLevel.Debug) {
            console.debug(`[ Better 3D ] ${message}`)
            this.onLogListener(message, LogLevel.Debug)
        }
    }

    public setLevel(level: LogLevel) {
        this.level = level
    }

    public onLog(listener: (log: string, level: LogLevel) => void) {
        this.onLogListener = listener
    }
}
