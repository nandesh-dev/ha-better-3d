import { Expression, PointLightProperties } from '@/configuration/v1'
import { Color, PointLight as ThreePointLight } from 'three'

import { dispose } from '@/visual/dispose'
import { evaluate } from '@/visual/evaluate'

import { Logger } from '@/utility/logger'

export class PointLight {
    public type: string = 'light.point'
    public three: ThreePointLight
    public name: string

    private logger: Logger

    constructor(uuid: string, logger: Logger) {
        this.name = uuid
        this.three = new ThreePointLight()

        this.logger = logger
        this.logger.debug(`new point light '${this.name}'`)
    }

    public updateProperties(properties: PointLightProperties) {
        this.updatePosition(properties.position)
        this.updateColor(properties.color)
        this.updateIntensity(properties.intensity)
    }

    public dispose() {
        dispose(this.three)
    }

    private updateIntensity(expression: Expression) {
        const [intensity, error] = evaluate<number>(expression)
        if (error) return this.logger.error(`cannot evaluate point light intensity due to error: ${error}`)
        this.three.intensity = intensity
    }

    private updateColor(expression: Expression) {
        const [color, error] = evaluate<Color>(expression)
        if (error) return this.logger.error(`cannot evaluate point light color due to error: ${error}`)
        this.three.color = color
    }

    private updatePosition(property: PointLightProperties['position']) {
        const [x, xError] = evaluate<number>(property.x)
        if (xError) {
            return this.logger.error(`cannot evaluate point light x position due to error: ${xError}`)
        }

        const [y, yError] = evaluate<number>(property.x)
        if (yError) {
            return this.logger.error(`cannot evaluate point light y position due to error: ${yError}`)
        }

        const [z, zError] = evaluate<number>(property.x)
        if (zError) {
            return this.logger.error(`cannot evaluate point light z position due to error: ${zError}`)
        }

        this.three.position.set(x, y, z)
    }
}
