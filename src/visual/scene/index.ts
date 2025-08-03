import { SceneConfiguration } from '@/configuration'
import { Color, Scene as ThreeScene } from 'three'

import { dispose } from '@/visual/dispose'

import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'
import { HomeAssistant } from '@/utility/home_assistant/types'
import { ResourceManager } from '@/utility/resource_manager'

import { Renderer } from '../renderer'
import { Card2D } from './2d_card'
import { Card3D } from './3d_card'
import { AmbientLight } from './ambient_light'
import { GLBModel } from './glb_model'
import { PerspectiveCamera } from './perspective_camera'
import { PointLight } from './point_light'

type Object = Card2D | Card3D | GLBModel | PointLight | AmbientLight
type Camera = PerspectiveCamera

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
            activeCameraName = this.evaluator.evaluate<string>(configuration.activeCamera)
        } catch (error) {
            throw new Error(
                `${encodeExpression(configuration.activeCamera)}: Error evaluating active camera expression`,
                error
            )
        }

        const activeCameraConfiguration = configuration.objects[activeCameraName]
        if (activeCameraConfiguration && activeCameraConfiguration.type === 'camera.perspective') {
            if (
                !this.activeCamera ||
                this.activeCamera.name !== activeCameraName ||
                (activeCameraConfiguration.type === 'camera.perspective' &&
                    !(this.activeCamera instanceof PerspectiveCamera))
            ) {
                if (activeCameraConfiguration.type === 'camera.perspective') {
                    this.activeCamera?.dispose()
                    this.activeCamera = new PerspectiveCamera(
                        activeCameraName,
                        this.renderer.domElement,
                        this.evaluator
                    )
                } else {
                    throw new Error(`${activeCameraName}: Invalid type`)
                }
            }

            try {
                this.activeCamera?.updateProperties(activeCameraConfiguration as any)
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
            color = evaluator.evaluate<Color>(configuration)
        } catch (error) {
            throw new Error(`${encodeExpression(configuration)}: Error evaluating expression`, error)
        }
        this.three.background = color
    }

    public updateSize(size: Size) {
        if (this.activeCamera) this.activeCamera.updateSize(size)
    }

    public dispose() {
        Object.values(this.objects).forEach((object) => {
            object.dispose()
        })
        dispose(this.three)
    }

    private removeUnnecessaryObjects(configuration: SceneConfiguration) {
        for (const objectName in this.objects) {
            const object = this.objects[objectName]
            const objectProperties = configuration.objects[objectName]
            if (objectProperties.type === 'camera.perspective') continue

            const inUse =
                objectProperties &&
                ((objectProperties.type === 'card.2d' && object instanceof Card2D) ||
                    (objectProperties.type === 'card.3d' && object instanceof Card3D) ||
                    (objectProperties.type === 'model.glb' && object instanceof GLBModel) ||
                    (objectProperties.type === 'light.point' && object instanceof PointLight) ||
                    (objectProperties.type === 'light.ambient' && object instanceof AmbientLight))

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
                switch (objectProperties.type) {
                    case 'card.2d':
                        object = new Card2D(objectName, objectProperties, this.evaluator)
                        break
                    case 'card.3d':
                        object = new Card3D(objectName, objectProperties, this.evaluator)
                        break
                    case 'model.glb':
                        object = new GLBModel(objectName, this.resourceManager, this.evaluator)
                        break
                    case 'light.point':
                        object = new PointLight(objectName, this.evaluator)
                        break
                    case 'light.ambient':
                        object = new AmbientLight(objectName, this.evaluator)
                        break
                }

                if (object) {
                    this.objects[objectName] = object
                    this.three.add(object.three)
                }
            }

            if (
                object instanceof Card2D ||
                object instanceof Card3D ||
                object instanceof GLBModel ||
                object instanceof PointLight ||
                object instanceof AmbientLight
            ) {
                try {
                    object.updateProperties(objectProperties as any, homeAssistant)
                } catch (error) {
                    throw new Error(`${objectName}: Update object properties`, error)
                }
            }
        }
    }
}
