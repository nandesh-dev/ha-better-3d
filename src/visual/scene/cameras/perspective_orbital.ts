import { PerspectiveCamera as ThreePerspectiveCamera } from 'three'
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
            const fov = this.evaluator.evaluate<number>(configuration.fov.value)
            if (this.three.fov !== fov) {
                projectionPropertiesChanged = true
                this.three.fov = fov
            }
        } catch (error) {
            throw new Error(`${configuration.fov.encode()}: Update field of view`, error)
        }

        try {
            const near = this.evaluator.evaluate<number>(configuration.near.value)
            if (this.three.near !== near) {
                projectionPropertiesChanged = true
                this.three.near = near
            }
        } catch (error) {
            throw new Error(`${configuration.near.encode()}: Update near point`, error)
        }

        try {
            const far = this.evaluator.evaluate<number>(configuration.far.value)
            if (this.three.far !== far) {
                projectionPropertiesChanged = true
                this.three.far = far
            }
        } catch (error) {
            throw new Error(`${configuration.far.encode()}: Update far point`, error)
        }

        if (projectionPropertiesChanged) this.three.updateProjectionMatrix()

        if (this.hadFirstUpdate) return null
        this.hadFirstUpdate = true

        try {
            this.updatePosition(configuration.position)
        } catch (error) {
            throw new Error('Update look at', error)
        }

        try {
            this.updateLookAt(configuration.lookAt)
        } catch (error) {
            throw new Error('Update position', error)
        }

        this.control.update()
    }

    private updateLookAt(configuration: PerspectiveOrbitalCameraConfiguration['lookAt']) {
        let x, y, z

        try {
            x = this.evaluator.evaluate<number>(configuration.x.value)
        } catch (error) {
            throw new Error(`${configuration.x.encode()}: Error evaluating x expression`, error)
        }

        try {
            y = this.evaluator.evaluate<number>(configuration.y.value)
        } catch (error) {
            throw new Error(`${configuration.y.encode()}: Error evaluating y expression`, error)
        }

        try {
            z = this.evaluator.evaluate<number>(configuration.z.value)
        } catch (error) {
            throw new Error(`${configuration.z.encode()}: Error evaluating z expression`, error)
        }

        this.three.lookAt(x, y, z)
    }

    private updatePosition(configuration: PerspectiveOrbitalCameraConfiguration['position']) {
        try {
            const x = this.evaluator.evaluate<number>(configuration.x.value)
            this.three.position.x = x
        } catch (error) {
            throw new Error(`${configuration.x.encode()}: Error evaluating x expression`, error)
        }

        try {
            const y = this.evaluator.evaluate<number>(configuration.y.value)
            this.three.position.y = y
        } catch (error) {
            throw new Error(`${configuration.y.encode()}: Error evaluating y expression`, error)
        }

        try {
            const z = this.evaluator.evaluate<number>(configuration.z.value)
            this.three.position.z = z
        } catch (error) {
            throw new Error(`${configuration.z.encode()}: Error evaluating z expression`, error)
        }
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
