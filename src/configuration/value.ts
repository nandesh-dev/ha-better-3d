export type Expression = string

export function decodeExpression(raw: unknown, defaultValue: Expression): Expression {
    if (typeof raw === 'number') return raw.toString()
    if (typeof raw === 'string' && raw.trim()) return raw
    return defaultValue
}

export function encodeExpression(expression: Expression): string {
    return expression
}

export function decodeString(raw: unknown, defaultValue: string): string {
    if (typeof raw === 'string') return raw
    if (typeof raw === 'number') return raw.toString()
    return defaultValue
}

export function encodeString(expression: string): string {
    return expression
}
