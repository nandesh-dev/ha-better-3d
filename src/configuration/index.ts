import { CARD_CUSTOM_ELEMENT_TAGNAME } from '@/elements/card'

import {
    DEFAULT_AMBIENT_LIGHT_CONFIGURATION,
    DEFAULT_CARD_3D_CONFIGURATION,
    DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION,
    DEFAULT_POINT_LIGHT_CONFIGURATION,
    ObjectConfiguration,
    decodeAmbientLightConfiguration,
    decodeCard2DConfiguration,
    decodeCard3DConfiguration,
    decodeGLBModelConfiguration,
    decodePerspectiveCameraConfiguration,
    decodePointLightConfiguration,
    encodeAmbientLightConfiguration,
    encodeCard2DConfiguration,
    encodeCard3DConfiguration,
    encodeGLBModelConfiguration,
    encodePerspectiveCameraConfiguration,
    encodePointLightConfiguration,
} from './objects'
import { Expression, decodeExpression, decodeString, encodeExpression, encodeString } from './value'

export type Configuration = {
    type: string
    activeScene: Expression
    scenes: { [name: string]: SceneConfiguration }
    styles: string
}

export function decodeConfiguration(raw: any): Configuration {
    const scenes: { [name: string]: SceneConfiguration } = {}
    for (const name in raw.scenes || []) {
        scenes[name] = decodeSceneConfiguration(raw.scenes[name])
    }

    return {
        type: decodeString(raw, `custom:${CARD_CUSTOM_ELEMENT_TAGNAME}`),
        activeScene: decodeExpression(raw.active_scene, "''"),
        styles: decodeString(raw.styles, ''),
        scenes,
    }
}

export function encodeConfiguration(config: Configuration): unknown {
    const scenes: { [name: string]: unknown } = {}
    for (const name in config.scenes || []) {
        scenes[name] = encodeSceneConfiguration(config.scenes[name])
    }
    return {
        type: encodeString(config.type),
        active_scene: encodeExpression(config.activeScene),
        styles: encodeString(config.styles),
        scenes,
    }
}

export type SceneConfiguration = {
    activeCamera: Expression
    backgroundColor: Expression
    objects: { [name: string]: ObjectConfiguration }
}

export const DEFAULT_SCENE_CONFIGURATION: SceneConfiguration = {
    activeCamera: '"primary_camera"',
    backgroundColor: 'new color("#eeeeee")',
    objects: {
        primary_camera: DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION,
        point_light: DEFAULT_POINT_LIGHT_CONFIGURATION,
        ambient_light: DEFAULT_AMBIENT_LIGHT_CONFIGURATION,
        logo: DEFAULT_CARD_3D_CONFIGURATION,
    },
} as const

export function decodeSceneConfiguration(raw: any): SceneConfiguration {
    const objects: { [name: string]: ObjectConfiguration } = {}
    for (const name in raw.objects ?? []) {
        const properties = raw.objects[name]
        switch (properties.type) {
            case 'card.2d':
                objects[name] = decodeCard2DConfiguration(properties)
                break
            case 'card.3d':
                objects[name] = decodeCard3DConfiguration(properties)
                break
            case 'model.glb':
                objects[name] = decodeGLBModelConfiguration(properties)
                break
            case 'light.point':
                objects[name] = decodePointLightConfiguration(properties)
                break
            case 'light.ambient':
                objects[name] = decodeAmbientLightConfiguration(properties)
                break
            case 'camera.perspective':
                objects[name] = decodePerspectiveCameraConfiguration(properties)
                break
        }
    }

    return {
        activeCamera: decodeExpression(raw.active_camera, '""'),
        backgroundColor: decodeExpression(raw.background_color, 'new Color("#eeeeee")'),
        objects,
    }
}

export function encodeSceneConfiguration(config: SceneConfiguration): unknown {
    const objects: { [name: string]: unknown } = {}
    for (const name in config.objects) {
        const properties = config.objects[name]
        switch (properties.type) {
            case 'card.2d':
                objects[name] = encodeCard2DConfiguration(properties)
                break
            case 'card.3d':
                objects[name] = encodeCard3DConfiguration(properties)
                break
            case 'model.glb':
                objects[name] = encodeGLBModelConfiguration(properties)
                break
            case 'light.point':
                objects[name] = encodePointLightConfiguration(properties)
                break
            case 'light.ambient':
                objects[name] = encodeAmbientLightConfiguration(properties)
                break
            case 'camera.perspective':
                objects[name] = encodePerspectiveCameraConfiguration(properties)
                break
        }
    }
    return {
        active_camera: encodeExpression(config.activeCamera),
        background_color: encodeExpression(config.backgroundColor),
        objects,
    }
}
