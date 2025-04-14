import { Color as ThreeColor } from 'three'

export type Expression = string

const Color = {
    fromHEX: (raw: string, colorSpace: string) =>
        new ThreeColor().setHex(parseInt(raw.replace('#', '0x'), 16), colorSpace),
}

export type EvaluatorContext = { [key: string]: unknown }

export class Evaluator {
    private context: EvaluatorContext
    constructor(context?: EvaluatorContext) {
        this.context = context || {}
    }

    public setContextValue(key: string, value: unknown) {
        this.context[key] = value
    }

    public withContextValue(key: string, value: unknown) {
        return new Evaluator({ ...this.context, [key]: value })
    }

    public evaluate<T>(expression: Expression): [T, null] | [null, Error] {
        try {
            return [
                new Function('Math', 'Color', ...Object.keys(this.context), `return ${expression}`)(
                    Math,
                    Color,
                    ...Object.values(this.context)
                ),
                null,
            ]
        } catch (error) {
            return [null, error as Error]
        }
    }
}
