import { Color, PointLight as ThreePointLight, Vector3 } from 'three'

import { PointLightConfiguration } from '@/configuration/objects'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'

export class PointLight {
    public three: ThreePointLight
    public name: string

    private evaluator: Evaluator
    constructor(name: string, evaluator: Evaluator) {
        this.name = name
        this.three = new ThreePointLight()

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
            throw new Error(`${configuration.visible.encode()}: Error evaluating visible`, error)
        }

        if (this.three.visible) {
            try {
                const color = evaluator.evaluate<Color>(configuration.color)
                this.three.color.copy(color)
            } catch (error) {
                throw new Error(`${configuration.color.encode()}: Error evaluating color`, error)
            }

            try {
                const intensity = evaluator.evaluate<number>(configuration.intensity)
                this.three.intensity = intensity
            } catch (error) {
                throw new Error(`${configuration.intensity.encode()}: Error evaluating intensity`, error)
            }

            try {
                const position = evaluator.evaluate<Vector3>(configuration.position)
                this.three.position.copy(position)
            } catch (error) {
                throw new Error(`${configuration.intensity.encode()}: Error evaluating intensity`, error)
            }
        }
    }

    public dispose() {}
}
