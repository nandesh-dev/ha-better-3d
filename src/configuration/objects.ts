import { Expression, decodeExpression, encodeExpression } from './value'

export type Card2DConfiguration = {
    type: 'card.2d'
    config: { type: string; [key: string]: unknown }
    size: Expression
    position: Expression
    rotation: Expression
    scale: Expression
    visible: Expression
}

export const DEFAULT_CARD_2D_CONFIGURATION: Card2DConfiguration = {
    type: 'card.2d',
    config: {
        type: 'picture',
        image: 'https://raw.githubusercontent.com/nandesh-dev/ha-better-3d/main/assets/favicon.png',
    },
    size: 'new HTMLSize("auto", "auto")',
    position: 'new Vector3(0, 0, 0)',
    rotation: 'new Euler(0, 0, 0)',
    scale: 'new Vector2(0.1, 0.1)',
    visible: 'true',
} as const

export function decodeCard2DConfiguration(raw: any): Card2DConfiguration {
    return {
        type: 'card.2d',
        config: {
            type: raw.config?.type ?? DEFAULT_CARD_2D_CONFIGURATION.config.type,
            ...(raw.config ?? DEFAULT_CARD_2D_CONFIGURATION.config),
        },
        size: decodeExpression(raw.size, DEFAULT_CARD_2D_CONFIGURATION.size),
        position: decodeExpression(raw.position, DEFAULT_CARD_2D_CONFIGURATION.position),
        rotation: decodeExpression(raw.rotation, DEFAULT_CARD_2D_CONFIGURATION.rotation),
        scale: decodeExpression(raw.scale, DEFAULT_CARD_2D_CONFIGURATION.scale),
        visible: decodeExpression(raw.visible, DEFAULT_CARD_2D_CONFIGURATION.visible),
    }
}

export function encodeCard2DConfiguration(config: Card2DConfiguration): unknown {
    return {
        type: 'card.2d',
        config: config.config,
        size: encodeExpression(config.size),
        position: encodeExpression(config.position),
        rotation: encodeExpression(config.rotation),
        scale: encodeExpression(config.scale),
        visible: encodeExpression(config.visible),
    }
}

export type Card3DConfiguration = {
    type: 'card.3d'
    config: { type: string; [key: string]: unknown }
    size: Expression
    position: Expression
    rotation: Expression
    scale: Expression
    visible: Expression
}

export const DEFAULT_CARD_3D_CONFIGURATION: Card3DConfiguration = {
    type: 'card.3d',
    config: {
        type: 'picture',
        image: 'https://raw.githubusercontent.com/nandesh-dev/ha-better-3d/main/assets/favicon.png',
    },
    size: 'new HTMLSize("auto", "auto")',
    position: 'new Vector3(0, 0, 0)',
    rotation: 'new Euler(0, 0, 0)',
    scale: 'new Vector2(0.1, 0.1)',
    visible: 'true',
} as const

export function decodeCard3DConfiguration(raw: any): Card3DConfiguration {
    return {
        type: 'card.3d',
        config: {
            type: raw.config?.type ?? DEFAULT_CARD_3D_CONFIGURATION.config.type,
            ...(raw.config ?? DEFAULT_CARD_3D_CONFIGURATION.config),
        },
        size: decodeExpression(raw.size, DEFAULT_CARD_3D_CONFIGURATION.size),
        position: decodeExpression(raw.position, DEFAULT_CARD_3D_CONFIGURATION.position),
        rotation: decodeExpression(raw.rotation, DEFAULT_CARD_3D_CONFIGURATION.rotation),
        scale: decodeExpression(raw.scale, DEFAULT_CARD_3D_CONFIGURATION.scale),
        visible: decodeExpression(raw.visible, DEFAULT_CARD_3D_CONFIGURATION.visible),
    }
}

export function encodeCard3DConfiguration(config: Card3DConfiguration): unknown {
    return {
        type: 'card.3d',
        config: config.config,
        size: encodeExpression(config.size),
        position: encodeExpression(config.position),
        rotation: encodeExpression(config.rotation),
        scale: encodeExpression(config.scale),
        visible: encodeExpression(config.visible),
    }
}

export type GLBModelConfiguration = {
    type: 'model.glb'
    url: Expression
    position: Expression
    rotation: Expression
    scale: Expression
    visible: Expression
    helper: Expression
}

export const DEFAULT_GLB_MODEL_CONFIGURATION: GLBModelConfiguration = {
    type: 'model.glb',
    url: '"https://raw.githubusercontent.com/nandesh-dev/ha-better-3d/main/doc/assets/logo.glb"',
    position: 'new Vector3(0, 0, 0)',
    rotation: 'new Euler(0, 0, 0)',
    scale: 'new Vector3(1, 1, 1)',
    visible: 'true',
    helper: 'false',
} as const

export function decodeGLBModelConfiguration(raw: any): GLBModelConfiguration {
    return {
        type: 'model.glb',
        url: decodeExpression(raw.url, ''),
        position: decodeExpression(raw.position, DEFAULT_GLB_MODEL_CONFIGURATION.position),
        rotation: decodeExpression(raw.rotation, DEFAULT_GLB_MODEL_CONFIGURATION.rotation),
        scale: decodeExpression(raw.scale, DEFAULT_GLB_MODEL_CONFIGURATION.scale),
        visible: decodeExpression(raw.visible, DEFAULT_GLB_MODEL_CONFIGURATION.visible),
        helper: decodeExpression(raw.helper, DEFAULT_GLB_MODEL_CONFIGURATION.helper),
    }
}

export function encodeGLBModelConfiguration(config: GLBModelConfiguration): unknown {
    return {
        type: 'model.glb',
        url: encodeExpression(config.url),
        position: encodeExpression(config.position),
        rotation: encodeExpression(config.rotation),
        scale: encodeExpression(config.scale),
        visible: encodeExpression(config.visible),
        helper: encodeExpression(config.helper),
    }
}

export type PointLightConfiguration = {
    type: 'light.point'
    position: Expression
    intensity: Expression
    color: Expression
    helper: Expression
    visible: Expression
}

export const DEFAULT_POINT_LIGHT_CONFIGURATION: PointLightConfiguration = {
    type: 'light.point',
    position: 'new Vector3(100, 80, 60)',
    intensity: '160000',
    color: 'new Color("#ffffff")',
    helper: 'false',
    visible: 'true',
} as const

export function decodePointLightConfiguration(raw: any): PointLightConfiguration {
    return {
        type: 'light.point',
        position: decodeExpression(raw.position, DEFAULT_POINT_LIGHT_CONFIGURATION.position),
        intensity: decodeExpression(raw.intensity, DEFAULT_POINT_LIGHT_CONFIGURATION.intensity),
        color: decodeExpression(raw.color, DEFAULT_POINT_LIGHT_CONFIGURATION.color),
        helper: decodeExpression(raw.helper, DEFAULT_POINT_LIGHT_CONFIGURATION.helper),
        visible: decodeExpression(raw.visible, DEFAULT_POINT_LIGHT_CONFIGURATION.visible),
    }
}

export function encodePointLightConfiguration(config: PointLightConfiguration): unknown {
    return {
        type: 'light.point',
        position: encodeExpression(config.position),
        intensity: encodeExpression(config.intensity),
        color: encodeExpression(config.color),
        helper: encodeExpression(config.helper),
        visible: encodeExpression(config.visible),
    }
}

export type AmbientLightConfiguration = {
    type: 'light.ambient'
    intensity: Expression
    color: Expression
    visible: Expression
}

export const DEFAULT_AMBIENT_LIGHT_CONFIGURATION: AmbientLightConfiguration = {
    type: 'light.ambient',
    intensity: '2',
    color: 'new Color("#ffffff")',
    visible: 'true',
} as const

export function decodeAmbientLightConfiguration(raw: any): AmbientLightConfiguration {
    return {
        type: 'light.ambient',
        intensity: decodeExpression(raw.intensity, DEFAULT_AMBIENT_LIGHT_CONFIGURATION.intensity),
        color: decodeExpression(raw.color, DEFAULT_AMBIENT_LIGHT_CONFIGURATION.color),
        visible: decodeExpression(raw.visible, DEFAULT_AMBIENT_LIGHT_CONFIGURATION.visible),
    }
}

export function encodeAmbientLightConfiguration(config: AmbientLightConfiguration): unknown {
    return {
        type: 'light.ambient',
        intensity: encodeExpression(config.intensity),
        color: encodeExpression(config.color),
        visible: encodeExpression(config.visible),
    }
}

export type CustomLightConfiguration = {
    type: 'light.custom'
    url: Expression
    position: Expression
    rotation: Expression
    scale: Expression
    intensity: Expression
    color: Expression
    density: Expression
    meshVisible: Expression
    meshIntensity: Expression
    helper: Expression
    visible: Expression
}

export const DEFAULT_CUSTOM_LIGHT_CONFIGURATION: CustomLightConfiguration = {
    type: 'light.custom',
    url: '',
    position: 'new Vector3(0, 0, 0)',
    rotation: 'new Euler(0, 0, 0)',
    scale: 'new Vector3(1, 1, 1)',
    intensity: '0.1',
    color: 'new Color("#ffffff")',
    density: '0.01',
    meshVisible: 'true',
    meshIntensity: '0.1',
    helper: 'false',
    visible: 'true',
} as const

export function decodeCustomLightConfiguration(raw: any): CustomLightConfiguration {
    return {
        type: 'light.custom',
        url: decodeExpression(raw.url, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.url),
        position: decodeExpression(raw.position, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.position),
        rotation: decodeExpression(raw.rotation, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.rotation),
        scale: decodeExpression(raw.scale, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.scale),
        intensity: decodeExpression(raw.intensity, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.intensity),
        color: decodeExpression(raw.color, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.color),
        density: decodeExpression(raw.density, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.density),
        meshVisible: decodeExpression(raw.meshVisible, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.meshVisible),
        meshIntensity: decodeExpression(raw.meshIntensity, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.meshIntensity),
        helper: decodeExpression(raw.helper, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.helper),
        visible: decodeExpression(raw.visible, DEFAULT_CUSTOM_LIGHT_CONFIGURATION.visible),
    }
}

export function encodeCustomLightConfiguration(config: CustomLightConfiguration): unknown {
    return {
        type: 'light.custom',
        url: encodeExpression(config.url),
        position: encodeExpression(config.position),
        rotation: encodeExpression(config.rotation),
        scale: encodeExpression(config.scale),
        intensity: encodeExpression(config.intensity),
        color: encodeExpression(config.color),
        density: encodeExpression(config.density),
        meshVisible: encodeExpression(config.meshVisible),
        meshIntensity: encodeExpression(config.meshIntensity),
        helper: encodeExpression(config.helper),
        visible: encodeExpression(config.visible),
    }
}

export type PerspectiveCameraConfiguration = {
    type: 'camera.perspective'
    fov: Expression
    near: Expression
    far: Expression
    position: Expression
    lookAt: Expression
}

export const DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION: PerspectiveCameraConfiguration = {
    type: 'camera.perspective',
    fov: '50',
    near: '0.1',
    far: '10000',
    position: 'new Vector3(100, 80, 180)',
    lookAt: 'new Vector3(0, 0, 0)',
} as const

export function decodePerspectiveCameraConfiguration(raw: any): PerspectiveCameraConfiguration {
    return {
        type: 'camera.perspective',
        fov: decodeExpression(raw.fov, DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION.fov),
        near: decodeExpression(raw.near, DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION.near),
        far: decodeExpression(raw.far, DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION.far),
        position: decodeExpression(raw.position, DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION.position),
        lookAt: decodeExpression(raw.look_at, DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION.lookAt),
    }
}

export function encodePerspectiveCameraConfiguration(config: PerspectiveCameraConfiguration): unknown {
    return {
        type: 'camera.perspective',
        fov: encodeExpression(config.fov),
        near: encodeExpression(config.near),
        far: encodeExpression(config.far),
        position: encodeExpression(config.position),
        lookAt: encodeExpression(config.lookAt),
    }
}

export type GroupConfiguration = {
    type: 'group'
    visible: Expression
    position: Expression
    rotation: Expression
    scale: Expression
    helper: Expression
    children: ObjectConfigurationMap
}

export const DEFAULT_GROUP_CONFIGURATION: GroupConfiguration = {
    type: 'group',
    visible: 'true',
    position: 'new Vector3(0, 0, 0)',
    rotation: 'new Euler(0, 0, 0)',
    scale: 'new Vector3(1, 1, 1)',
    helper: 'false',
    children: {},
}

export function decodeGroupConfiguration(raw: any): GroupConfiguration {
    return {
        type: 'group',
        visible: decodeExpression(raw?.visible, DEFAULT_GROUP_CONFIGURATION.visible),
        position: decodeExpression(raw?.position, DEFAULT_GROUP_CONFIGURATION.position),
        rotation: decodeExpression(raw?.rotation, DEFAULT_GROUP_CONFIGURATION.rotation),
        scale: decodeExpression(raw?.scale, DEFAULT_GROUP_CONFIGURATION.scale),
        helper: decodeExpression(raw?.helper, DEFAULT_GROUP_CONFIGURATION.helper),
        children: decodeObjectMap(raw?.children),
    }
}

export function encodeGroupConfiguration(config: GroupConfiguration): unknown {
    return {
        type: 'group',
        visible: encodeExpression(config.visible),
        position: encodeExpression(config.position),
        rotation: encodeExpression(config.rotation),
        scale: encodeExpression(config.scale),
        helper: encodeExpression(config.helper),
        children: encodeObjectMap(config.children),
    }
}

export type ObjectConfigurationMap = { [name: string]: ObjectConfiguration }

export function decodeObjectMap(raw: any): ObjectConfigurationMap {
    const objects: ObjectConfigurationMap = {}
    for (const name in raw ?? {}) {
        let properties
        switch (raw[name].type) {
            case 'card.2d':
                properties = decodeCard2DConfiguration(raw[name])
                break
            case 'card.3d':
                properties = decodeCard3DConfiguration(raw[name])
                break
            case 'model.glb':
                properties = decodeGLBModelConfiguration(raw[name])
                break
            case 'light.point':
                properties = decodePointLightConfiguration(raw[name])
                break
            case 'light.ambient':
                properties = decodeAmbientLightConfiguration(raw[name])
                break
            case 'light.custom':
                properties = decodeCustomLightConfiguration(raw[name])
                break
            case 'camera.perspective':
                properties = decodePerspectiveCameraConfiguration(raw[name])
                break
            case 'group':
                properties = decodeGroupConfiguration(raw[name])
                break
        }

        if (properties) objects[name] = properties
    }
    return objects
}

export function encodeObjectMap(objectMap: ObjectConfigurationMap): unknown {
    const objects: { [name: string]: unknown } = {}
    for (const name in objectMap ?? {}) {
        let properties
        switch (objectMap[name].type) {
            case 'card.2d':
                properties = encodeCard2DConfiguration(objectMap[name])
                break
            case 'card.3d':
                properties = encodeCard3DConfiguration(objectMap[name])
                break
            case 'model.glb':
                properties = encodeGLBModelConfiguration(objectMap[name])
                break
            case 'light.point':
                properties = encodePointLightConfiguration(objectMap[name])
                break
            case 'light.ambient':
                properties = encodeAmbientLightConfiguration(objectMap[name])
                break
            case 'light.custom':
                properties = encodeCustomLightConfiguration(objectMap[name])
                break
            case 'camera.perspective':
                properties = encodePerspectiveCameraConfiguration(objectMap[name])
                break
            case 'group':
                properties = encodeGroupConfiguration(objectMap[name])
                break
        }
        objects[name] = properties
    }

    return objects
}

export type ObjectConfiguration =
    | Card2DConfiguration
    | Card3DConfiguration
    | GLBModelConfiguration
    | PointLightConfiguration
    | AmbientLightConfiguration
    | CustomLightConfiguration
    | PerspectiveCameraConfiguration
    | GroupConfiguration
