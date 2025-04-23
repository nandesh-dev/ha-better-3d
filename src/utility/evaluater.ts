import { Color } from 'three'

import { Error } from './error'

export type Expression = string

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

    public evaluate<T>(expression: Expression): T {
        const parameters = ['Math', 'Color', ...Object.keys(this.context)]
        const argumentValues = [Math, Color, ...Object.values(this.context)]

        try {
            return new Function(...parameters, `return ${expression}`)(...argumentValues)
        } catch (error) {
            throw new Error((error as any).toString())
        }
    }
}
