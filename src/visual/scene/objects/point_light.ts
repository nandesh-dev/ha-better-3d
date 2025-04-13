import { Color, PointLight as ThreePointLight } from 'three'

import { dispose } from '@/visual/dispose'

import { ExpressionConfiguration } from '@/configuration/common'
import { PointLightConfiguration } from '@/configuration/objects'

import { evaluate } from '@/utility/evaluate'
import { Logger } from '@/utility/logger'

export class PointLight {
    public type: string = 'light.point'
    public three: ThreePointLight
    public name: string

    private logger: Logger

    constructor(name: string, logger: Logger) {
        this.name = name
        this.three = new ThreePointLight()

        this.logger = logger
        this.logger.debug(`new point light '${this.name}'`)
    }

    public updateConfig(configuration: PointLightConfiguration) {
        this.updatePosition(configuration.position)
        this.updateColor(configuration.color)
        this.updateIntensity(configuration.intensity)
    }

    public dispose() {
        dispose(this.three)
    }

    private updateIntensity(configuration: ExpressionConfiguration) {
        const [intensity, error] = evaluate<number>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate point light intensity due to error: ${error}`)
        this.three.intensity = intensity
    }

    private updateColor(configuration: ExpressionConfiguration) {
        const [color, error] = evaluate<Color>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate point light color due to error: ${error}`)
        this.three.color = color
    }

    private updatePosition(configuration: PointLightConfiguration['position']) {
        const [x, xError] = evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate point light x position due to error: ${xError}`)
        }

        const [y, yError] = evaluate<number>(configuration.x.value)
        if (yError) {
            return this.logger.error(`cannot evaluate point light y position due to error: ${yError}`)
        }

        const [z, zError] = evaluate<number>(configuration.x.value)
        if (zError) {
            return this.logger.error(`cannot evaluate point light z position due to error: ${zError}`)
        }

        this.three.position.set(x, y, z)
    }
}
