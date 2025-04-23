import { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'

import { ExpressionConfiguration } from '@/configuration/common'
import { GLBModelConfiguration } from '@/configuration/objects'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'
import { ResourceManager } from '@/utility/resource_manager'

export class GLBModel {
    public type: string = 'model.glb'
    public three: Group

    public name: string
    private url: string | null = null

    private disposed: boolean = false
    private resourceManager: ResourceManager
    private evaluator: Evaluator
    constructor(name: string, resourceManager: ResourceManager, evaluator: Evaluator) {
        this.three = new Group()
        this.name = name

        this.resourceManager = resourceManager
        this.evaluator = evaluator
    }

    public updateProperties(configuration: GLBModelConfiguration) {
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

        try {
            this.updateUrl(configuration.url, evaluator)
        } catch (error) {
            throw new Error(`Update url`, error)
        }

        try {
            this.updateVisible(configuration.visible, evaluator)
        } catch (error) {
            throw new Error(`Update visible`, error)
        }

        if (this.three.visible) {
            try {
                this.updatePosition(configuration.position, evaluator)
            } catch (error) {
                throw new Error('Update position', error)
            }

            try {
                this.updateRotation(configuration.rotation, evaluator)
            } catch (error) {
                throw new Error('Update rotation', error)
            }

            try {
                this.updateScale(configuration.scale, evaluator)
            } catch (error) {
                throw new Error('Update scale', error)
            }
        }
    }

    public dispose() {
        this.disposed = true
        if (this.three) dispose(this.three)
    }

    private updateUrl(configuration: GLBModelConfiguration['url'], evaluator: Evaluator) {
        let url
        try {
            url = evaluator.evaluate<string>(configuration.value)
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
        if (this.url !== url) {
            this.url = url
            this.loadModel(url)
            return
        }
    }

    private updateVisible(configuration: ExpressionConfiguration, evaluator: Evaluator) {
        let visible
        try {
            visible = evaluator.evaluate<boolean>(configuration.value)
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
        this.three.visible = visible
    }

    private updatePosition(configuration: GLBModelConfiguration['position'], evaluator: Evaluator) {
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

    private updateRotation(configuration: GLBModelConfiguration['rotation'], evaluator: Evaluator) {
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

        this.three.rotation.set(x, y, z)
    }

    private updateScale(configuration: GLBModelConfiguration['scale'], evaluator: Evaluator) {
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
    }
}
