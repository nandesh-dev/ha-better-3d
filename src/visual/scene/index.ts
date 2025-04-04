import { SceneProperties } from '@/configuration/v1'
import { Scene as ThreeScene } from 'three'

import { dispose } from '@/visual/dispose'

import { Logger } from '@/utility/logger'
import { ResourceManager } from '@/utility/resource_manager'

import { evaluate } from '../evaluate'
import { Renderer } from '../renderer'
import { PerspectiveOrbitalCamera } from './cameras/perspective_orbital'
import { GLBModel } from './objects/glb_model'
import { PointLight } from './objects/point_light'

type Object = GLBModel | PointLight
type Camera = PerspectiveOrbitalCamera

type Size = {
    width: number
    height: number
}

export class Scene {
    public three: ThreeScene
    public name: string

    public activeCamera: Camera | null = null
    private objects: { [name: string]: Object } = {}

    private renderer: Renderer
    private resourceManager: ResourceManager
    private logger: Logger
    constructor(name: string, renderer: Renderer, resourceManager: ResourceManager, logger: Logger) {
        this.three = new ThreeScene()
        this.name = name

        this.renderer = renderer
        this.resourceManager = resourceManager
        this.logger = logger

        logger.debug(`new scene ${this.name}`)
    }

    public updateProperties(properties: SceneProperties) {
        this.removeUnnecessaryObjects(properties)
        this.updateObjects(properties)
        this.updateActiveCamera(properties)
    }

    public updateSize(size: Size) {
        if (this.activeCamera) this.activeCamera.updateSize(size)
    }

    public dispose() {
        Object.values(this.objects).forEach((object) => object.dispose())
        dispose(this.three)
    }

    private removeUnnecessaryObjects(properties: SceneProperties) {
        for (const objectName in this.objects) {
            const object = this.objects[objectName]
            const objectProperties = properties.objects[objectName]
            const inUse = objectProperties && objectProperties.type == object.type

            if (!inUse) {
                if (object.three) this.three.remove(object.three)
                object.dispose()
                delete this.objects[objectName]
            }
        }
    }

    private updateObjects(properties: SceneProperties) {
        for (const objectName in properties.objects) {
            const objectProperties = properties.objects[objectName]
            let object = this.objects[objectName]

            if (!object) {
                switch (objectProperties.type) {
                    case 'model.glb':
                        object = new GLBModel(objectName, objectProperties, this.resourceManager, this.logger)
                        break
                    case 'light.point':
                        object = new PointLight(objectName, this.logger)
                        break
                    default:
                        this.logger.error(
                            `invalid object type: '${(objectProperties as any).type}' in scene ${this.name}`
                        )
                }

                this.objects[objectName] = object
                this.three.add(object.three)
            }

            object.updateProperties(objectProperties as any)
        }
    }

    private updateActiveCamera(properties: SceneProperties) {
        const [activeCameraName, error] = evaluate<string>(properties.active_camera)
        if (error) {
            this.logger.error(`cannot evaluate active camera name for scene '${this.name}' due to error: ${error}`)
            return
        }

        const activeCameraProperties = properties.cameras[activeCameraName]
        if (activeCameraProperties) {
            if (
                !this.activeCamera ||
                this.activeCamera.name !== activeCameraName ||
                this.activeCamera.type !== activeCameraProperties.type
            ) {
                switch (activeCameraProperties.type) {
                    case 'orbital.perspective':
                        this.activeCamera?.dispose()
                        this.activeCamera = new PerspectiveOrbitalCamera(
                            activeCameraName,
                            this.renderer.domElement,
                            this.logger
                        )
                        break
                    default:
                        this.logger.error(
                            `invalid camera type '${activeCameraProperties.type}' in scene '${this.name}', using the old active camera if present`
                        )
                }
            }

            this.activeCamera?.updateProperties(activeCameraProperties)
        } else {
            this.activeCamera?.dispose()
            this.activeCamera = null
        }
    }
}
