import { SceneConfiguration } from '@/configuration'
import { Color, Scene as ThreeScene } from 'three'

import { dispose } from '@/visual/dispose'

import { PerspectiveOrbitalCameraConfiguration } from '@/configuration/cameras'
import {
    AmbientLightConfiguration,
    CardConfiguration,
    GLBModelConfiguration,
    PointLightConfiguration,
} from '@/configuration/objects'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'
import { HomeAssistant } from '@/utility/home_assistant/types'
import { ResourceManager } from '@/utility/resource_manager'

import { Renderer } from '../renderer'
import { PerspectiveOrbitalCamera } from './cameras/perspective_orbital'
import { AmbientLight } from './objects/ambient_light'
import { Card } from './objects/card'
import { GLBModel } from './objects/glb_model'
import { PointLight } from './objects/point_light'

type Object = Card | GLBModel | PointLight | AmbientLight
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
    private evaluator: Evaluator

    constructor(name: string, renderer: Renderer, resourceManager: ResourceManager, evaluator: Evaluator) {
        this.three = new ThreeScene()
        this.name = name

        this.renderer = renderer
        this.resourceManager = resourceManager
        this.evaluator = evaluator
    }

    public updateActiveCamera(configuration: SceneConfiguration) {
        let activeCameraName

        try {
            activeCameraName = this.evaluator.evaluate<string>(configuration.activeCamera.value)
        } catch (error) {
            throw new Error(`${configuration.activeCamera.encode()}: Error evaluating active camera expression`, error)
        }

        const activeCameraConfiguration = configuration.cameras[activeCameraName]
        if (activeCameraConfiguration) {
            if (
                !this.activeCamera ||
                this.activeCamera.name !== activeCameraName ||
                (activeCameraConfiguration instanceof PerspectiveOrbitalCameraConfiguration &&
                    !(this.activeCamera instanceof PerspectiveOrbitalCamera))
            ) {
                if (activeCameraConfiguration instanceof PerspectiveOrbitalCameraConfiguration) {
                    this.activeCamera?.dispose()
                    this.activeCamera = new PerspectiveOrbitalCamera(
                        activeCameraName,
                        this.renderer.domElement,
                        this.evaluator
                    )
                } else {
                    throw new Error(`${activeCameraName}: Invalid type`)
                }
            }

            try {
                this.activeCamera?.updateProperties(activeCameraConfiguration)
            } catch (error) {
                throw new Error(`${activeCameraName}: Update properties`, error)
            }
        } else {
            this.activeCamera?.dispose()
            this.activeCamera = null
        }
    }

    public updateProperties(configuration: SceneConfiguration, homeAssistant: HomeAssistant) {
        this.removeUnnecessaryObjects(configuration)

        try {
            this.updateObjects(configuration, homeAssistant)
        } catch (error) {
            throw new Error(`Update objects`, error)
        }

        try {
            this.updateBackgroundColor(configuration.backgroundColor, this.evaluator)
        } catch (error) {
            throw new Error(`Update background color`, error)
        }
    }

    public updateBackgroundColor(configuration: SceneConfiguration['backgroundColor'], evaluator: Evaluator) {
        let color
        try {
            color = evaluator.evaluate<Color>(configuration.value)
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
        this.three.background = color
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
                    (objectProperties instanceof PointLightConfiguration && object instanceof PointLight) ||
                    (objectProperties instanceof AmbientLightConfiguration && object instanceof AmbientLight))

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
                    object = new Card(objectName, objectProperties, this.evaluator)
                } else if (objectProperties instanceof GLBModelConfiguration) {
                    object = new GLBModel(objectName, this.resourceManager, this.evaluator)
                } else if (objectProperties instanceof PointLightConfiguration) {
                    object = new PointLight(objectName, this.evaluator)
                } else if (objectProperties instanceof AmbientLightConfiguration) {
                    object = new AmbientLight(objectName, this.evaluator)
                } else {
                    throw new Error(`${objectProperties}: Invalid object type`)
                }

                this.objects[objectName] = object
                this.three.add(object.three)
            }

            try {
                object.updateProperties(objectProperties as any, homeAssistant)
            } catch (error) {
                throw new Error(`${objectName}: Update object properties`, error)
            }
        }
    }
}
