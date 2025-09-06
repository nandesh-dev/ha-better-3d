import { BoxHelper, Euler, Group as ThreeGroup, Vector3 } from 'three'

import { GroupConfiguration, ObjectConfiguration } from '@/configuration/objects'
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
import { PerspectiveCamera } from './perspective_camera'
import { PointLight } from './point_light'

export const OBJECT_TYPES = [
    'card.2d',
    'card.3d',
    'model.glb',
    'camera.perspective',
    'light.point',
    'light.ambient',
    'group',
] as const

export type ObjectInstance =
    | Card2D
    | Card3D
    | GLBModel
    | PointLight
    | AmbientLight
    | CustomLight
    | PerspectiveCamera
    | Group
export type ObjectMap = { [name: string]: ObjectInstance }

export class Group {
    public name: string

    public three: ThreeGroup
    public group: ThreeGroup
    public helper: BoxHelper

    public children: ObjectMap = {}

    private evaluator: Evaluator
    private renderer: Renderer
    private resourceManager: ResourceManager
    constructor(name: string, renderer: Renderer, resourceManager: ResourceManager, evaluator: Evaluator) {
        this.name = name

        this.three = new ThreeGroup()
        this.group = new ThreeGroup()
        this.three.add(this.group)
        this.helper = new BoxHelper(this.group)
        this.three.add(this.helper)

        this.evaluator = evaluator
        this.resourceManager = resourceManager
        this.renderer = renderer
    }

    public updateProperties(configuration: GroupConfiguration, homeAssistant: HomeAssistant) {
        const evaluator = this.evaluator.withContextValue('Self', {
            visible: this.group.visible,
            position: this.group.position.clone(),
            rotation: this.group.rotation.clone(),
            scale: this.group.scale.clone(),
        })

        try {
            const visible = evaluator.evaluate<boolean>(configuration.visible)
            this.group.visible = visible
        } catch (error) {
            throw new Error(`${encodeExpression(configuration.visible)}: Error evaluating visible`, error)
        }

        if (this.group.visible) {
            try {
                const position = evaluator.evaluate<Vector3>(configuration.position)
                this.group.position.copy(position)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.position)}: Error evaluating position`, error)
            }

            try {
                const rotation = evaluator.evaluate<Euler>(configuration.rotation)
                this.group.rotation.copy(rotation)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.rotation)}: Error evaluating rotation`, error)
            }

            try {
                const scale = evaluator.evaluate<Vector3>(configuration.scale)
                this.group.scale.copy(scale)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.scale)}: Error evaluating scale`, error)
            }

            try {
                const helper = evaluator.evaluate<boolean>(configuration.helper)
                this.helper.visible = helper
                if (helper) this.helper.update()
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.helper)}: Error evaluating helper`, error)
            }

            try {
                this.updateObjects(configuration, homeAssistant)
            } catch (error) {
                throw new Error(`Update objects`, error)
            }
        }
    }

    public dispose() {
        for (const objectName in this.children) {
            const object = this.children[objectName]
            this.group.remove(object.three)
            object.dispose()
            delete this.children[objectName]
        }
    }

    private updateObjects(configuration: GroupConfiguration, homeAssistant: HomeAssistant) {
        // Remove objects which are no longer in use
        for (const objectName in this.children) {
            const object = this.children[objectName]
            const objectConfiguration = configuration.children[objectName]
            const inUse = objectConfiguration && matchObjectInstanceAndConfigurationType(objectConfiguration, object)
            if (!inUse) {
                this.group.remove(object.three)
                object.dispose()
                delete this.children[objectName]
            }
        }

        // Update existing objects or create a new object if it doesn't exist
        for (const objectName in configuration.children) {
            const objectProperties = configuration.children[objectName]
            let object = this.children[objectName]

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

                this.children[objectName] = object
                this.group.add(object.three)
            }

            try {
                object.updateProperties(objectProperties as any, homeAssistant)
            } catch (error) {
                throw new Error(`${objectName}: Update object properties`, error)
            }
        }
    }
}

export function matchObjectInstanceAndConfigurationType(
    configuration: ObjectConfiguration,
    object: ObjectInstance
): boolean {
    switch (configuration.type) {
        case 'card.2d':
            return object instanceof Card2D
        case 'card.3d':
            return object instanceof Card3D
        case 'model.glb':
            return object instanceof GLBModel
        case 'light.point':
            return object instanceof PointLight
        case 'light.ambient':
            return object instanceof AmbientLight
        case 'light.custom':
            return object instanceof CustomLight
        case 'camera.perspective':
            return object instanceof PerspectiveCamera
        case 'group':
            return object instanceof Group
    }
}
