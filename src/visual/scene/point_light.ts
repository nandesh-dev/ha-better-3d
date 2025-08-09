import { Color, Group, PointLightHelper, PointLight as ThreePointLight, Vector3 } from 'three'

import { PointLightConfiguration } from '@/configuration/objects'
import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'

export class PointLight {
    public name: string

    public three: Group
    public light: ThreePointLight
    public helper: PointLightHelper

    private evaluator: Evaluator
    constructor(name: string, evaluator: Evaluator) {
        this.name = name

        this.three = new Group()
        this.light = new ThreePointLight()
        this.three.add(this.light)
        this.helper = new PointLightHelper(this.light)
        this.three.add(this.helper)

        this.evaluator = evaluator
    }

    public updateProperties(configuration: PointLightConfiguration) {
        const evaluator = this.evaluator.withContextValue('Self', {
            visible: this.light.visible,
            color: this.light.color.clone(),
            intensity: this.light.intensity,
            position: this.light.position.clone(),
        })

        try {
            const visible = evaluator.evaluate<boolean>(configuration.visible)
            this.light.visible = visible
        } catch (error) {
            throw new Error(`${encodeExpression(configuration.visible)}: Error evaluating visible`, error)
        }

        if (this.light.visible) {
            try {
                const color = evaluator.evaluate<Color>(configuration.color)
                this.light.color.copy(color)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.color)}: Error evaluating color`, error)
            }

            try {
                const intensity = evaluator.evaluate<number>(configuration.intensity)
                this.light.intensity = intensity
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.intensity)}: Error evaluating intensity`, error)
            }

            try {
                const position = evaluator.evaluate<Vector3>(configuration.position)
                this.light.position.copy(position)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.intensity)}: Error evaluating intensity`, error)
            }

            try {
                const helper = evaluator.evaluate<boolean>(configuration.helper)
                this.helper.visible = helper
                if (helper) this.helper.update()
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.intensity)}: Error evaluating helper`, error)
            }
        }
    }

    public dispose() {}
}
