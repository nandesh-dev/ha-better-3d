import { Color, Group, AmbientLight as ThreeAmbientLight } from 'three'

import { AmbientLightConfiguration } from '@/configuration/objects'
import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'

export class AmbientLight {
    public three: ThreeAmbientLight
    public helper: Group
    public name: string

    private evaluator: Evaluator

    constructor(name: string, evaluator: Evaluator) {
        this.name = name
        this.three = new ThreeAmbientLight()
        this.helper = new Group()

        this.evaluator = evaluator
    }

    public updateProperties(configuration: AmbientLightConfiguration) {
        const evaluator = this.evaluator.withContextValue('Self', {
            visible: this.three.visible,
            color: this.three.color.clone(),
            intensity: this.three.intensity,
        })

        try {
            const visible = evaluator.evaluate<boolean>(configuration.visible)
            this.three.visible = visible
        } catch (error) {
            throw new Error(`${encodeExpression(configuration.visible)}: Error evaluating visible`, error)
        }

        if (this.three.visible) {
            try {
                const color = evaluator.evaluate<Color>(configuration.color)
                this.three.color.copy(color)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.color)}: Error evaluating color`, error)
            }

            try {
                const intensity = evaluator.evaluate<number>(configuration.intensity)
                this.three.intensity = intensity
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.intensity)}: Error evaluating intensity`, error)
            }
        }
    }

    public dispose() {}
}
