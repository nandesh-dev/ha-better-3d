import { CARD_CUSTOM_ELEMENT_TAGNAME } from '@/elements/card'

import {
    DEFAULT_AMBIENT_LIGHT_CONFIGURATION,
    DEFAULT_CARD_3D_CONFIGURATION,
    DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION,
    DEFAULT_POINT_LIGHT_CONFIGURATION,
    ObjectConfiguration,
    ObjectMap,
    decodeAmbientLightConfiguration,
    decodeCard2DConfiguration,
    decodeCard3DConfiguration,
    decodeCustomLightConfiguration,
    decodeGLBModelConfiguration,
    decodeObjectMap,
    decodePerspectiveCameraConfiguration,
    decodePointLightConfiguration,
    encodeAmbientLightConfiguration,
    encodeCard2DConfiguration,
    encodeCard3DConfiguration,
    encodeCustomLightConfiguration,
    encodeGLBModelConfiguration,
    encodeObjectMap,
    encodePerspectiveCameraConfiguration,
    encodePointLightConfiguration,
} from './objects'
import { Expression, decodeExpression, decodeString, encodeExpression, encodeString } from './value'

const CONFIGURATION_RESERVED_KEYS: string[] = ['type', 'activeScene', 'scenes', 'styles'] as const

export type Configuration = {
    type: string
    activeScene: Expression
    scenes: { [name: string]: SceneConfiguration }
    styles: string
    extra: { [key: string]: unknown }
}

export function decodeConfiguration(raw: any): Configuration {
    const scenes: { [name: string]: SceneConfiguration } = {}
    for (const name in raw.scenes || []) {
        scenes[name] = decodeSceneConfiguration(raw.scenes[name])
    }

    const configuration: Configuration = {
        type: decodeString(raw, `custom:${CARD_CUSTOM_ELEMENT_TAGNAME}`),
        activeScene: decodeExpression(raw.active_scene, "''"),
        styles: decodeString(raw.styles, ''),
        scenes,
        extra: {},
    }

    Object.keys(raw).map((key) => {
        if (CONFIGURATION_RESERVED_KEYS.includes(key)) return
        configuration.extra[key] = raw[key]
    })

    return configuration
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
        ...config.extra,
    }
}

export type SceneConfiguration = {
    activeCamera: Expression
    backgroundColor: Expression
    objects: ObjectMap
}

export const DEFAULT_SCENE_CONFIGURATION: SceneConfiguration = {
    activeCamera: '"primary_camera"',
    backgroundColor: 'new Color("#eeeeee")',
    objects: {
        primary_camera: DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION,
        point_light: DEFAULT_POINT_LIGHT_CONFIGURATION,
        ambient_light: DEFAULT_AMBIENT_LIGHT_CONFIGURATION,
        logo: DEFAULT_CARD_3D_CONFIGURATION,
    },
} as const

export function decodeSceneConfiguration(raw: any): SceneConfiguration {
    return {
        activeCamera: decodeExpression(raw.active_camera, '""'),
        backgroundColor: decodeExpression(raw.background_color, 'new Color("#eeeeee")'),
        objects: decodeObjectMap(raw.objects),
    }
}

export function encodeSceneConfiguration(config: SceneConfiguration): unknown {
    return {
        active_camera: encodeExpression(config.activeCamera),
        background_color: encodeExpression(config.backgroundColor),
        objects: encodeObjectMap(config.objects),
    }
}
