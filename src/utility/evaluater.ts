import { Color, Euler, Vector2, Vector3 } from 'three'

import { Expression } from '@/configuration/expression'

import { Error } from './error'

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
        const parameters = ['Math', 'Color', 'Vector3', 'Vector2', 'HTMLSize', 'Euler', ...Object.keys(this.context)]
        const argumentValues = [Math, Color, Vector3, Vector2, HTMLSize, Euler, ...Object.values(this.context)]

        try {
            return new Function(...parameters, `return ${expression.value}`)(...argumentValues)
        } catch (error) {
            throw new Error((error as any).toString())
        }
    }
}

export class HTMLSize {
    public height: string
    public width: string
    constructor(height: string, width: string) {
        this.height = height
        this.width = width
    }
}
