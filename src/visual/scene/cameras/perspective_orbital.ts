import { PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

import { PerspectiveOrbitalCameraConfiguration } from '@/configuration/cameras'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'

type Size = {
    width: number
    height: number
}

export class PerspectiveOrbitalCamera {
    public type: string = 'orbital.perspective'
    public name: string
    public three: ThreePerspectiveCamera

    private hadFirstUpdate: boolean = false
    private control: OrbitControls
    private evaluator: Evaluator
    constructor(name: string, domElement: HTMLElement, evaluator: Evaluator) {
        this.name = name
        this.three = new ThreePerspectiveCamera()

        this.control = new OrbitControls(this.three, domElement)
        this.evaluator = evaluator
    }

    public updateProperties(configuration: PerspectiveOrbitalCameraConfiguration) {
        let projectionPropertiesChanged = false

        try {
            const fov = this.evaluator.evaluate<number>(configuration.fov)
            if (this.three.fov !== fov) {
                projectionPropertiesChanged = true
                this.three.fov = fov
            }
        } catch (error) {
            throw new Error(`${configuration.fov.encode()}: Cannot evaluate field of view`, error)
        }

        try {
            const near = this.evaluator.evaluate<number>(configuration.near)
            if (this.three.near !== near) {
                projectionPropertiesChanged = true
                this.three.near = near
            }
        } catch (error) {
            throw new Error(`${configuration.near.encode()}: Cannot evaluate near point`, error)
        }

        try {
            const far = this.evaluator.evaluate<number>(configuration.far)
            if (this.three.far !== far) {
                projectionPropertiesChanged = true
                this.three.far = far
            }
        } catch (error) {
            throw new Error(`${configuration.far.encode()}: Cannot evaluate far point`, error)
        }

        if (projectionPropertiesChanged) this.three.updateProjectionMatrix()

        if (this.hadFirstUpdate) return null
        this.hadFirstUpdate = true

        try {
            const position = this.evaluator.evaluate<Vector3>(configuration.position)
            this.three.position.copy(position)
        } catch (error) {
            throw new Error('Cannot evaluate position', error)
        }

        try {
            const lookAt = this.evaluator.evaluate<Vector3>(configuration.lookAt)
            this.control.target = lookAt
        } catch (error) {
            throw new Error('Cannot evaluate lookAt', error)
        }

        this.control.update()
    }

    public updateSize(size: Size) {
        const aspect = size.height == 0 ? 2 : size.width / size.height
        if (this.three.aspect !== aspect) {
            this.three.aspect = aspect
            this.three.updateProjectionMatrix()
        }
    }

    public dispose() {
        this.control.dispose()
    }
}
