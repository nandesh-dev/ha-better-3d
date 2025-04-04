export enum LogLevel {
    None = 0,
    Error = 1,
    Info = 2,
    Debug = 3,
}

export class Logger {
    private level: LogLevel
    constructor(level: LogLevel) {
        this.level = level
    }

    public error(error: string | Error) {
        if (this.level >= LogLevel.Error) console.error(`[ Better 3D ] ${error.toString()}`)
    }

    public info(info: string) {
        if (this.level >= LogLevel.Info) console.log(`[ Better 3D ] ${info}`)
    }

    public debug(message: string) {
        if (this.level >= LogLevel.Debug) console.debug(`[ Better 3D ] ${message}`)
    }

    public setLevel(level: LogLevel) {
        this.level = level
    }
}
