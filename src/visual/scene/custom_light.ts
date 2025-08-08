import { Color, Euler, Group, LineSegments, Mesh, PointLight, PointLightHelper, Vector3 } from 'three'
import { OBJLoader } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'

import { CustomLightConfiguration } from '@/configuration/objects'
import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'
import { ResourceManager } from '@/utility/resource_manager'

export class CustomLight {
    public three: Group
    public lightGroup: Group
    public helperGroup: Group

    public name: string
    private url: string | null = null
    private density: number | null = null
    private color: Color | null = null
    private intensity: number | null = null

    private disposed: boolean = false
    private resourceManager: ResourceManager
    private evaluator: Evaluator

    constructor(name: string, resourceManager: ResourceManager, evaluator: Evaluator) {
        this.three = new Group()
        this.lightGroup = new Group()
        this.helperGroup = new Group()

        this.name = name

        this.three.add(this.lightGroup)
        this.three.add(this.helperGroup)

        this.resourceManager = resourceManager
        this.evaluator = evaluator
    }

    public updateProperties(configuration: CustomLightConfiguration) {
        const evaluator = this.evaluator.withContextValue('Self', {
            url: this.url,
            position: this.lightGroup.position.clone(),
            rotation: this.lightGroup.rotation.clone(),
            scale: this.lightGroup.scale.clone(),
        })

        try {
            const visible = evaluator.evaluate<boolean>(configuration.visible)
            this.lightGroup.visible = visible
        } catch (error) {
            throw new Error(`Error evaluating visible`, error)
        }

        try {
            const density = evaluator.evaluate<number>(configuration.density)
            this.density = density
        } catch (error) {
            throw new Error(`Error evaluating density`, error)
        }

        if (this.lightGroup.visible) {
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
                this.lightGroup.position.copy(position)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.position)}: Error evaluating position`, error)
            }

            try {
                const rotation = evaluator.evaluate<Euler>(configuration.rotation)
                this.lightGroup.rotation.copy(rotation)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.rotation)}: Error evaluating rotation`, error)
            }

            try {
                const scale = evaluator.evaluate<Vector3>(configuration.scale)
                this.lightGroup.scale.copy(scale)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.scale)}: Error evaluating scale`, error)
            }

            try {
                this.color = evaluator.evaluate<Color>(configuration.color)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.color)}: Error evaluating color`, error)
            }

            try {
                this.intensity = evaluator.evaluate<number>(configuration.intensity)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.intensity)}: Error evaluating intensity`, error)
            }

            try {
                const helper = evaluator.evaluate<boolean>(configuration.helper)
                this.helperGroup.visible = helper
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.helper)}: Error evaluating helper`, error)
            }

            for (const child of this.lightGroup.children) {
                if (child instanceof PointLight) {
                    child.color.copy(this.color)
                    child.intensity = this.intensity
                }
            }
        }
    }

    public dispose() {
        this.disposed = true
        if (this.lightGroup) dispose(this.lightGroup)
    }

    private async loadModel(url: string) {
        const rawData = await this.resourceManager.load(url)
        if (this.disposed || this.density == null || this.color == null || this.intensity == null) return

        for (const child of this.lightGroup.children) dispose(child)
        this.lightGroup.children = []

        const model = new OBJLoader().parse(new TextDecoder().decode(rawData))
        let a = 0
        model.traverse((object) => {
            if (object instanceof Mesh || object instanceof LineSegments) {
                const position = object.geometry.getAttribute('position')
                for (let i = 0; i < position.count; i++) {
                    if (a == 0) {
                        const light = new PointLight(this.color || undefined, this.intensity || undefined)
                        light.position.fromBufferAttribute(position, i)
                        this.lightGroup.add(light)

                        const helper = new PointLightHelper(light)
                        this.helperGroup.add(helper)
                    }

                    a += this.density || 0
                    if (a >= 1) a = 0
                }
            }
        })
    }
}
