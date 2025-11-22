import { Color, PointLightHelper, PointLight as ThreePointLight, Vector3 } from 'three'

import { PointLightConfiguration } from '@/configuration/objects'
import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'

export class PointLight {
    public name: string

    public three: ThreePointLight
    public helper: PointLightHelper

    private evaluator: Evaluator
    constructor(name: string, evaluator: Evaluator) {
        this.name = name

        this.three = new ThreePointLight()
        this.helper = new PointLightHelper(this.three)

        this.evaluator = evaluator
    }

    public updateProperties(configuration: PointLightConfiguration) {
        const evaluator = this.evaluator.withContextValue('Self', {
            visible: this.three.visible,
            color: this.three.color.clone(),
            intensity: this.three.intensity,
            position: this.three.position.clone(),
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

            try {
                const position = evaluator.evaluate<Vector3>(configuration.position)
                this.three.position.copy(position)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.intensity)}: Error evaluating intensity`, error)
            }

            try {
                const helper = evaluator.evaluate<boolean>(configuration.helper)
                this.helper.visible = helper
                this.helper.update()
                if (helper) this.helper.update()
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.intensity)}: Error evaluating helper`, error)
            }
        }
    }

    public dispose() {}
}
