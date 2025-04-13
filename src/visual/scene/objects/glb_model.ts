import { Euler, Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'

import { GLBModelConfiguration } from '@/configuration/objects'

import { evaluate } from '@/utility/evaluate'
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
    constructor(name: string, configuration: GLBModelConfiguration, resourceManager: ResourceManager, logger: Logger) {
        this.three = new Group()
        this.name = name

        this.resourceManager = resourceManager
        this.logger = logger

        const [url, error] = evaluate<string>(configuration.url.value)
        if (error) {
            logger.error(`cannot evaluate new glb model '${this.name}' url due to error: ${error}`)
            return
        }

        this.url = url
        this.loadModel(url)

        this.logger.debug(`new glb model '${this.name}'`)
    }

    public updateConfig(configuration: GLBModelConfiguration) {
        this.updateUrl(configuration.url)
        this.updatePosition(configuration.position)
        this.updateRotation(configuration.rotation)
        this.updateScale(configuration.scale)
    }

    public dispose() {
        this.disposed = true
        if (this.three) dispose(this.three)
    }

    private updateUrl(configuration: GLBModelConfiguration['url']) {
        const [url, error] = evaluate<string>(configuration.value)
        if (error) return this.logger.error(`cannot evaluate glb model '${this.name}' url due to error: ${error}`)

        if (this.url !== url) {
            this.url = url
            this.loadModel(url)
            return
        }
    }

    private updatePosition(configuration: GLBModelConfiguration['position']) {
        const [x, xError] = evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' x position due to error: ${xError}`)
        }

        const [y, yError] = evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' y position due to error: ${yError}`)
        }

        const [z, zError] = evaluate<number>(configuration.z.value)
        if (zError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' z position due to error: ${zError}`)
        }

        this.three.position.set(x, y, z)
    }

    private updateRotation(configuration: GLBModelConfiguration['rotation']) {
        const [x, xError] = evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' x rotation due to error: ${xError}`)
        }

        const [y, yError] = evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' y rotation due to error: ${yError}`)
        }

        const [z, zError] = evaluate<number>(configuration.z.value)
        if (zError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' z rotation due to error: ${zError}`)
        }

        this.three.setRotationFromEuler(new Euler(x, y, z))
    }

    private updateScale(configuration: GLBModelConfiguration['scale']) {
        const [x, xError] = evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' x scale due to error: ${xError}`)
        }

        const [y, yError] = evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate glb model '${this.name}' y scale due to error: ${yError}`)
        }

        const [z, zError] = evaluate<number>(configuration.z.value)
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
