import { Color as ThreeColor } from 'three'

export type Expression = string

const Color = {
    fromHEX: (raw: string, colorSpace: string) =>
        new ThreeColor().setHex(parseInt(raw.replace('#', '0x'), 16), colorSpace),
}

export function evaluate<T>(expression: Expression): [T, null] | [null, Error] {
    try {
        return [new Function('Math', 'Color', `return ${expression}`)(Math, Color), null]
    } catch (error) {
        return [null, error as Error]
    }
}
