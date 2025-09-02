import { SceneConfiguration } from '@/configuration'
import { Color, Euler, Scene as ThreeScene, Vector3 } from 'three'

import { dispose } from '@/visual/dispose'

import { ObjectConfigurationMap, PerspectiveCameraConfiguration } from '@/configuration/objects'
import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'
import { HomeAssistant } from '@/utility/home_assistant/types'
import { ResourceManager } from '@/utility/resource_manager'

import { Renderer } from '../renderer'
import { Card2D } from './2d_card'
import { Card3D } from './3d_card'
import { AmbientLight } from './ambient_light'
import { CustomLight } from './custom_light'
import { GLBModel } from './glb_model'
import { Group, ObjectInstance, ObjectMap, matchObjectInstanceAndConfigurationType } from './group'
import { PerspectiveCamera } from './perspective_camera'
import { PointLight } from './point_light'

type CameraConfiguration = PerspectiveCameraConfiguration
type Camera = PerspectiveCamera

type Size = {
    width: number
    height: number
}

export class Scene {
    public three: ThreeScene
    public name: string

    public activeCamera: Camera | null = null
    private objects: { [name: string]: ObjectInstance } = {}

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

    public updateProperties(configuration: SceneConfiguration, homeAssistant: HomeAssistant) {
        let activeCameraName
        try {
            activeCameraName = this.evaluator.evaluate<string>(configuration.activeCamera)
        } catch (error) {
            throw new Error(
                `${encodeExpression(configuration.activeCamera)}: Error evaluating active camera expression`,
                error
            )
        }

        if (this.activeCamera) {
            const activeCameraConfiguration = this.searchCameraConfiguration(activeCameraName, configuration.objects)
            if (activeCameraConfiguration) {
                this.activeCamera.updateProperties(activeCameraConfiguration)
            } else {
                this.activeCamera = null
            }
        }

        if (this.activeCamera) {
            this.evaluator.setContextValue('Camera', {
                position: {
                    x: this.activeCamera.three.position.x,
                    y: this.activeCamera.three.position.y,
                    z: this.activeCamera.three.position.z,
                },
                rotation: {
                    x: this.activeCamera.three.rotation.x,
                    y: this.activeCamera.three.rotation.y,
                    z: this.activeCamera.three.rotation.z,
                },
            })
        } else {
            this.evaluator.setContextValue('Camera', {
                position: new Vector3(),
                rotation: new Euler(),
            })
        }

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

        this.activeCamera = this.searchCamera(activeCameraName, this.objects)
        console.log(this.activeCamera)
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

    private searchCameraConfiguration(name: string, objectMap: ObjectConfigurationMap): CameraConfiguration | null {
        for (const objectName in objectMap) {
            if (objectMap[objectName].type === 'group') {
                const cameraConfiguration = this.searchCameraConfiguration(name, objectMap[objectName].children)
                if (cameraConfiguration) return cameraConfiguration
            }
            if (objectName == name && objectMap[objectName].type === 'camera.perspective') {
                return objectMap[objectName]
            }
        }
        return null
    }

    private searchCamera(name: string, objectMap: ObjectMap): Camera | null {
        for (const objectName in objectMap) {
            if (objectMap[objectName] instanceof Group) {
                const camera = this.searchCamera(name, objectMap[objectName].children)
                if (camera) return camera
            }
            if (objectName == name && objectMap[objectName] instanceof PerspectiveCamera) {
                return objectMap[objectName]
            }
        }
        return null
    }

    private updateObjects(configuration: SceneConfiguration, homeAssistant: HomeAssistant) {
        // Remove objects which are no longer in use
        for (const objectName in this.objects) {
            const object = this.objects[objectName]
            const objectConfiguration = configuration.objects[objectName]
            const inUse = objectConfiguration && matchObjectInstanceAndConfigurationType(objectConfiguration, object)
            if (!inUse) {
                if (object.three) this.three.remove(object.three)
                object.dispose()
                delete this.objects[objectName]
            }
        }

        // Update existing objects or create a new object if it doesn't exist
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
                    case 'light.custom':
                        object = new CustomLight(objectName, this.resourceManager, this.evaluator)
                        break
                    case 'camera.perspective':
                        object = new PerspectiveCamera(objectName, this.renderer.domElement, this.evaluator)
                        break
                    case 'group':
                        object = new Group(objectName, this.renderer, this.resourceManager, this.evaluator)
                        break
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
