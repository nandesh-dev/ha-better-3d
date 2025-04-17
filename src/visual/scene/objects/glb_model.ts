import { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'

import { ExpressionConfiguration } from '@/configuration/common'
import { GLBModelConfiguration } from '@/configuration/objects'

import { Evaluator } from '@/utility/evaluater'
import { Logger } from '@/utility/logger'
import { ResourceManager } from '@/utility/resource_manager'

export class GLBModel {
    public type: string = 'model.glb'
    public three: Group

    public name: string
    private url: string | null = null

    private disposed: boolean = false
    private resourceManager: ResourceManager
    private logger: Logger
    private evaluator: Evaluator
    constructor(name: string, resourceManager: ResourceManager, logger: Logger, evaluator: Evaluator) {
        this.three = new Group()
        this.name = name

        this.resourceManager = resourceManager
        this.logger = logger
        this.evaluator = evaluator

        this.logger.debug(`new glb model '${this.name}'`)
    }

    public updateConfig(configuration: GLBModelConfiguration) {
        const evaluator = this.evaluator.withContextValue('Self', {
            url: this.url,
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
            scale: {
                x: this.three.scale.x,
                y: this.three.scale.y,
                z: this.three.scale.z,
            },
        })

        this.updateVisibility(configuration.visible, evaluator)
        this.updateUrl(configuration.url, evaluator)
        this.updatePosition(configuration.position, evaluator)
        this.updateRotation(configuration.rotation, evaluator)
        this.updateScale(configuration.scale, evaluator)
    }

    public dispose() {
        this.disposed = true
        if (this.three) dispose(this.three)
    }

    private updateVisibility(configuration: ExpressionConfiguration, evaluator: Evaluator) {
        const [visible, error] = evaluator.evaluate<boolean>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate glb model visibility due to error: ${error}`)
        this.three.visible = visible
    }

    private updateUrl(configuration: GLBModelConfiguration['url'], evaluator: Evaluator) {
        const [url, error] = evaluator.evaluate<string>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate glb model '${this.name}' url due to error: ${error}`)

        if (this.url !== url) {
            this.url = url
            this.loadModel(url)
            return
        }
    }

    private updatePosition(configuration: GLBModelConfiguration['position'], evaluator: Evaluator) {
        const [x, xError] = evaluator.evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' x position due to error: ${xError}`)
        }

        const [y, yError] = evaluator.evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' y position due to error: ${yError}`)
        }

        const [z, zError] = evaluator.evaluate<number>(configuration.z.value)
        if (zError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' z position due to error: ${zError}`)
        }

        this.three.position.set(x, y, z)
    }

    private updateRotation(configuration: GLBModelConfiguration['rotation'], evaluator: Evaluator) {
        const [x, xError] = evaluator.evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' x rotation due to error: ${xError}`)
        }

        const [y, yError] = evaluator.evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' y rotation due to error: ${yError}`)
        }

        const [z, zError] = evaluator.evaluate<number>(configuration.z.value)
        if (zError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' z rotation due to error: ${zError}`)
        }

        this.three.rotation.set(x % (2 * Math.PI), y % (Math.PI * 2), z % (Math.PI * 2))
    }

    private updateScale(configuration: GLBModelConfiguration['scale'], evaluator: Evaluator) {
        const [x, xError] = evaluator.evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' x scale due to error: ${xError}`)
        }

        const [y, yError] = evaluator.evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' y scale due to error: ${yError}`)
        }

        const [z, zError] = evaluator.evaluate<number>(configuration.z.value)
        if (zError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' z scale due to error: ${zError}`)
        }

        this.three.scale.set(x, y, z)
    }

    private async loadModel(url: string) {
        const rawData = await this.resourceManager.load(url)
        if (this.disposed) return

        const gltf = await new GLTFLoader().parseAsync(rawData, url)
        if (this.disposed) return

        for (const child of this.three.children) dispose(child)
        this.three.children = []
        this.three.add(gltf.scene)

        this.logger.debug(`glb model '${this.name}' loaded`)
    }
}
