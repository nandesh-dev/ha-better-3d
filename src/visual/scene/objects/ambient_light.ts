import { Color, AmbientLight as ThreeAmbientLight } from 'three'

import { dispose } from '@/visual/dispose'

import { AmbientLightConfiguration } from '@/configuration/objects'

import { Evaluator } from '@/utility/evaluater'
import { Logger } from '@/utility/logger'

export class AmbientLight {
    public type: string = 'light.ambient'
    public three: ThreeAmbientLight
    public name: string

    private logger: Logger
    private evaluator: Evaluator
    constructor(name: string, logger: Logger, evaluator: Evaluator) {
        this.name = name
        this.three = new ThreeAmbientLight()

        this.logger = logger
        this.evaluator = evaluator

        this.logger.debug(`new ambient light '${this.name}'`)
    }

    public updateConfig(configuration: AmbientLightConfiguration) {
        const evaluator = this.evaluator.withContextValue('Self', {})

        this.updateVisibility(configuration.visible, evaluator)
        this.updateColor(configuration.color, evaluator)
        this.updateIntensity(configuration.intensity, evaluator)
    }

    public dispose() {
        dispose(this.three)
    }

    private updateVisibility(configuration: AmbientLightConfiguration['visible'], evaluator: Evaluator) {
        const [visible, error] = evaluator.evaluate<boolean>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate ambient light visibility due to error: ${error}`)
        this.three.visible = visible
    }

    private updateIntensity(configuration: AmbientLightConfiguration['intensity'], evaluator: Evaluator) {
        const [intensity, error] = evaluator.evaluate<number>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate ambient light intensity due to error: ${error}`)
        this.three.intensity = intensity
    }

    private updateColor(configuration: AmbientLightConfiguration['color'], evaluator: Evaluator) {
        const [color, error] = evaluator.evaluate<Color>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate ambient light color due to error: ${error}`)
        this.three.color = color
    }
}
