import { Color, PointLight as ThreePointLight } from 'three'

import { dispose } from '@/visual/dispose'

import { ExpressionConfiguration } from '@/configuration/common'
import { PointLightConfiguration } from '@/configuration/objects'

import { Evaluator } from '@/utility/evaluater'
import { Logger } from '@/utility/logger'

export class PointLight {
    public type: string = 'light.point'
    public three: ThreePointLight
    public name: string

    private logger: Logger
    private evaluator: Evaluator
    constructor(name: string, logger: Logger, evaluator: Evaluator) {
        this.name = name
        this.three = new ThreePointLight()

        this.logger = logger
        this.evaluator = evaluator

        this.logger.debug(`new point light '${this.name}'`)
    }

    public updateConfig(configuration: PointLightConfiguration) {
        const evaluator = this.evaluator.withContextValue('Self', {
            position: {
                x: this.three.position.x,
                y: this.three.position.y,
                z: this.three.position.z,
            },
            rotation: {
                x: this.three.rotation.x,
                y: this.three.rotation.y,
                z: this.three.rotation.z,
            },
        })

        this.updatePosition(configuration.position, evaluator)
        this.updateColor(configuration.color, evaluator)
        this.updateIntensity(configuration.intensity, evaluator)
    }

    public dispose() {
        dispose(this.three)
    }

    private updateIntensity(configuration: ExpressionConfiguration, evaluator: Evaluator) {
        const [intensity, error] = evaluator.evaluate<number>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate point light intensity due to error: ${error}`)
        this.three.intensity = intensity
    }

    private updateColor(configuration: ExpressionConfiguration, evaluator: Evaluator) {
        const [color, error] = evaluator.evaluate<Color>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate point light color due to error: ${error}`)
        this.three.color = color
    }

    private updatePosition(configuration: PointLightConfiguration['position'], evaluator: Evaluator) {
        const [x, xError] = evaluator.evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate point light x position due to error: ${xError}`)
        }

        const [y, yError] = evaluator.evaluate<number>(configuration.x.value)
        if (yError) {
            return this.logger.error(`cannot evaluate point light y position due to error: ${yError}`)
        }

        const [z, zError] = evaluator.evaluate<number>(configuration.x.value)
        if (zError) {
            return this.logger.error(`cannot evaluate point light z position due to error: ${zError}`)
        }

        this.three.position.set(x, y, z)
    }
}
