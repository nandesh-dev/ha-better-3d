import { SceneConfiguration } from '@/configuration'
import { Scene as ThreeScene } from 'three'

import { dispose } from '@/visual/dispose'

import { PerspectiveOrbitalCameraConfiguration } from '@/configuration/cameras'
import { CardConfiguration, GLBModelConfiguration, PointLightConfiguration } from '@/configuration/objects'

import { evaluate } from '@/utility/evaluate'
import { HomeAssistant } from '@/utility/home_assistant/types'
import { Logger } from '@/utility/logger'
import { ResourceManager } from '@/utility/resource_manager'

import { Renderer } from '../renderer'
import { PerspectiveOrbitalCamera } from './cameras/perspective_orbital'
import { Card } from './objects/card'
import { GLBModel } from './objects/glb_model'
import { PointLight } from './objects/point_light'

type Object = Card | GLBModel | PointLight
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

    public updateProperties(properties: SceneConfiguration, homeAssistant: HomeAssistant) {
        this.removeUnnecessaryObjects(properties)
        this.updateObjects(properties, homeAssistant)
        this.updateActiveCamera(properties)
    }

    public updateSize(size: Size) {
        if (this.activeCamera) this.activeCamera.updateSize(size)
    }

    public dispose() {
        Object.values(this.objects).forEach((object) => object.dispose())
        dispose(this.three)
    }

    private removeUnnecessaryObjects(configuration: SceneConfiguration) {
        for (const objectName in this.objects) {
            const object = this.objects[objectName]
            const objectProperties = configuration.objects[objectName]
            const inUse =
                objectProperties &&
                ((objectProperties instanceof CardConfiguration && object instanceof Card) ||
                    (objectProperties instanceof GLBModelConfiguration && object instanceof GLBModel) ||
                    (objectProperties instanceof PointLightConfiguration && object instanceof PointLight))

            if (!inUse) {
                if (object.three) this.three.remove(object.three)
                object.dispose()
                delete this.objects[objectName]
            }
        }
    }

    private updateObjects(configuration: SceneConfiguration, homeAssistant: HomeAssistant) {
        for (const objectName in configuration.objects) {
            const objectProperties = configuration.objects[objectName]
            let object = this.objects[objectName]

            if (!object) {
                if (objectProperties instanceof CardConfiguration) {
                    object = new Card(objectName, objectProperties, this.logger)
                } else if (objectProperties instanceof GLBModelConfiguration) {
                    object = new GLBModel(objectName, objectProperties, this.resourceManager, this.logger)
                } else if (objectProperties instanceof PointLightConfiguration) {
                    object = new PointLight(objectName, this.logger)
                } else {
                    this.logger.error(`invalid object type: '${(objectProperties as any).type}' in scene ${this.name}`)
                    return
                }

                this.objects[objectName] = object
                this.three.add(object.three)
            }

            object.updateConfig(objectProperties as any, homeAssistant)
        }
    }

    private updateActiveCamera(configuration: SceneConfiguration) {
        const [activeCameraName, error] = evaluate<string>(configuration.activeCamera.value)
        if (error) {
            this.logger.error(`cannot evaluate active camera name for scene '${this.name}' due to error: ${error}`)
            return
        }

        const activeCameraConfiguration = configuration.cameras[activeCameraName]
        if (activeCameraConfiguration) {
            if (
                !this.activeCamera ||
                this.activeCamera.name !== activeCameraName ||
                (activeCameraConfiguration instanceof PerspectiveOrbitalCameraConfiguration &&
                    !!(this.activeCamera instanceof PerspectiveOrbitalCamera))
            ) {
                if (activeCameraConfiguration instanceof PerspectiveOrbitalCameraConfiguration) {
                    this.activeCamera?.dispose()
                    this.activeCamera = new PerspectiveOrbitalCamera(
                        activeCameraName,
                        this.renderer.domElement,
                        this.logger
                    )
                } else {
                    this.logger.error(
                        `invalid camera type '${activeCameraConfiguration}' in scene '${this.name}', using the old active camera if present`
                    )
                }
            }

            this.activeCamera?.updateProperties(activeCameraConfiguration)
        } else {
            this.activeCamera?.dispose()
            this.activeCamera = null
        }
    }
}
