import { Color, PointLight as ThreePointLight } from 'three'

import { dispose } from '@/visual/dispose'

import { PointLightConfiguration } from '@/configuration/objects'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'

export class PointLight {
    public type: string = 'light.point'
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
            position: {
                x: this.three.position.x,
                y: this.three.position.y,
                z: this.three.position.z,
            },
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
                this.updatePosition(configuration.position, evaluator)
            } catch (error) {
                throw new Error(`Update position`, error)
            }

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

    private updateVisible(configuration: PointLightConfiguration['visible'], evaluator: Evaluator) {
        try {
            const visible = evaluator.evaluate<boolean>(configuration.value)
            this.three.visible = visible
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
    }

    private updateColor(configuration: PointLightConfiguration['color'], evaluator: Evaluator) {
        try {
            const color = evaluator.evaluate<Color>(configuration.value)
            this.three.color = color
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
    }

    private updateIntensity(configuration: PointLightConfiguration['intensity'], evaluator: Evaluator) {
        try {
            const intensity = evaluator.evaluate<number>(configuration.value)
            this.three.intensity = intensity
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
    }

    private updatePosition(configuration: PointLightConfiguration['position'], evaluator: Evaluator) {
        let x, y, z

        try {
            x = evaluator.evaluate<number>(configuration.x.value)
        } catch (error) {
            throw new Error(`${configuration.x.encode()}: Error evaluating x expression`, error)
        }

        try {
            y = evaluator.evaluate<number>(configuration.y.value)
        } catch (error) {
            throw new Error(`${configuration.y.encode()}: Error evaluating y expression`, error)
        }

        try {
            z = evaluator.evaluate<number>(configuration.z.value)
        } catch (error) {
            throw new Error(`${configuration.z.encode()}: Error evaluating z expression`, error)
        }

        this.three.position.set(x, y, z)
    }
}
