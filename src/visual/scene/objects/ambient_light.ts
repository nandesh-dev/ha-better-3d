import { Color, AmbientLight as ThreeAmbientLight } from 'three'

import { dispose } from '@/visual/dispose'

import { AmbientLightConfiguration } from '@/configuration/objects'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'

export class AmbientLight {
    public three: ThreeAmbientLight
    public name: string

    private evaluator: Evaluator

    constructor(name: string, evaluator: Evaluator) {
        this.name = name
        this.three = new ThreeAmbientLight()

        this.evaluator = evaluator
    }

    public updateProperties(configuration: AmbientLightConfiguration) {
        const evaluator = this.evaluator.withContextValue('Self', {
            visible: this.three.visible,
            color: this.three.color.clone(),
            intensity: this.three.intensity,
        })

        try {
            this.updateVisible(configuration.visible, evaluator)
        } catch (error) {
            throw new Error(`Update visible`, error)
        }

        if (this.three.visible) {
            try {
                this.updateColor(configuration.color, evaluator)
            } catch (error) {
                throw new Error(`Update color`, error)
            }

            try {
                this.updateIntensity(configuration.intensity, evaluator)
            } catch (error) {
                throw new Error(`Update intensity`, error)
            }
        }
    }

    public dispose() {
        dispose(this.three)
    }

    private updateVisible(configuration: AmbientLightConfiguration['visible'], evaluator: Evaluator) {
        try {
            const visible = evaluator.evaluate<boolean>(configuration.value)
            this.three.visible = visible
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
    }

    private updateColor(configuration: AmbientLightConfiguration['color'], evaluator: Evaluator) {
        try {
            const color = evaluator.evaluate<Color>(configuration.value)
            this.three.color = color
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
    }

    private updateIntensity(configuration: AmbientLightConfiguration['intensity'], evaluator: Evaluator) {
        try {
            const intensity = evaluator.evaluate<number>(configuration.value)
            this.three.intensity = intensity
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
    }
}
