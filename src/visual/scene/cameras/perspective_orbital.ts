import { PerspectiveCamera as ThreePerspectiveCamera } from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

import { PerspectiveOrbitalCameraConfiguration } from '@/configuration/cameras'

import { evaluate } from '@/utility/evaluate'
import { Logger } from '@/utility/logger'

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
    private logger: Logger
    constructor(name: string, domElement: HTMLElement, logger: Logger) {
        this.name = name
        this.three = new ThreePerspectiveCamera()

        this.control = new OrbitControls(this.three, domElement)
        this.logger = logger

        this.logger.debug(`new orbital perspective camera '${this.name}'`)
    }

    public updateProperties(properties: PerspectiveOrbitalCameraConfiguration) {
        let projectionPropertiesChanged = false
        const [fov, fovError] = evaluate<number>(properties.fov.value)
        if (fovError)
            this.logger.error(`cannot evaluate orbital perspective camera '${this.name}' fov due to error: ${fovError}`)
        else if (this.three.fov !== fov) {
            projectionPropertiesChanged = true
            this.three.fov = fov
        }

        const [near, nearError] = evaluate<number>(properties.near.value)
        if (nearError)
            this.logger.error(
                `cannot evaluate orbital perspective camera '${this.name}' near point due to error: ${nearError}`
            )
        else if (this.three.near !== near) {
            projectionPropertiesChanged = true
            this.three.near = near
        }

        const [far, farError] = evaluate<number>(properties.far.value)
        if (farError)
            this.logger.error(
                `cannot evaluate orbital perspective camera '${this.name}' far point due to error: ${farError}`
            )
        else if (this.three.far !== far) {
            projectionPropertiesChanged = true
            this.three.far = far
        }

        if (projectionPropertiesChanged) this.three.updateProjectionMatrix()

        if (this.hadFirstUpdate) return
        this.hadFirstUpdate = true

        this.updatePosition(properties.position)
        this.updateLookAt(properties.lookAt)

        this.control.update()
    }

    private updateLookAt(property: PerspectiveOrbitalCameraConfiguration['lookAt']) {
        const [x, xError] = evaluate<number>(property.x.value)
        if (xError) {
            return this.logger.error(
                `cannot evaluate orbital perspective camera '${this.name}' x lookAt due to error: ${xError}`
            )
        }

        const [y, yError] = evaluate<number>(property.y.value)
        if (yError) {
            return this.logger.error(
                `cannot evaluate orbital perspective camera '${this.name}' y lookAt due to error: ${yError}`
            )
        }

        const [z, zError] = evaluate<number>(property.z.value)
        if (zError) {
            return this.logger.error(
                `cannot evaluate orbital perspective camera '${this.name}' z lookAt due to error: ${zError}`
            )
        }

        this.three.lookAt(x, y, z)
    }

    private updatePosition(property: PerspectiveOrbitalCameraConfiguration['position']) {
        const [x, xError] = evaluate<number>(property.x.value)
        if (xError) {
            return this.logger.error(
                `cannot evaluate orbital perspective camera '${this.name}' x position due to error: ${xError}`
            )
        }

        const [y, yError] = evaluate<number>(property.y.value)
        if (yError) {
            return this.logger.error(
                `cannot evaluate orbital perspective camera '${this.name}' y position due to error: ${yError}`
            )
        }

        const [z, zError] = evaluate<number>(property.z.value)
        if (zError) {
            return this.logger.error(
                `cannot evaluate orbital perspective camera '${this.name}' z position due to error: ${zError}`
            )
        }

        this.three.position.set(x, y, z)
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
