export class Expression {
    public value: string

    constructor(raw: any, defaultValue: string) {
        this.value = defaultValue
        if (typeof raw == 'string') this.value = raw
        if (typeof raw == 'number') this.value = raw.toString()
    }

    public encode() {
        return this.value
    }
}
