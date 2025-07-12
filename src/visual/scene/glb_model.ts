import { Euler, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'

import { GLBModelConfiguration } from '@/configuration/objects'
import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'
import { ResourceManager } from '@/utility/resource_manager'

export class GLBModel {
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
            position: this.three.position.clone(),
            rotation: this.three.rotation.clone(),
            scale: this.three.scale.clone(),
        })

        try {
            const visible = evaluator.evaluate<boolean>(configuration.visible)
            this.three.visible = visible
        } catch (error) {
            throw new Error(`Error evaluating visible`, error)
        }

        if (this.three.visible) {
            try {
                const url = evaluator.evaluate<string>(configuration.url)
                if (this.url !== url) {
                    this.url = url
                    this.loadModel(url)
                }
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.url)}: Error evaluating url`, error)
            }

            try {
                const position = evaluator.evaluate<Vector3>(configuration.position)
                this.three.position.copy(position)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.position)}: Error evaluating position`, error)
            }

            try {
                const rotation = evaluator.evaluate<Euler>(configuration.rotation)
                this.three.rotation.copy(rotation)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.rotation)}: Error evaluating rotation`, error)
            }

            try {
                const scale = evaluator.evaluate<Vector3>(configuration.scale)
                this.three.scale.copy(scale)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.scale)}: Error evaluating scale`, error)
            }
        }
    }

    public dispose() {
        this.disposed = true
        if (this.three) dispose(this.three)
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
