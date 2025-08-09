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
    scale: 'new Vector3(1, 1, 1)',
    visible: 'true',
} as const

export function decodeCard2DConfiguration(raw: any): Card2DConfiguration {
    return {
        type: 'card.2d',
        config: { type: raw.config?.type ?? '', ...(raw.config ?? {}) },
        size: decodeExpression(raw.size, 'new HTMLSize("auto", "auto")'),
        position: decodeExpression(raw.position, 'new Vector3(0, 0, 0)'),
        rotation: decodeExpression(raw.rotation, 'new Euler(0, 0, 0)'),
        scale: decodeExpression(raw.scale, 'new Vector2(1, 1)'),
        visible: decodeExpression(raw.visible, 'true'),
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
    scale: 'new Vector3(1, 1, 1)',
    visible: 'true',
} as const

export function decodeCard3DConfiguration(raw: any): Card3DConfiguration {
    return {
        type: 'card.3d',
        config: { type: raw.config?.type ?? '', ...(raw.config ?? {}) },
        size: decodeExpression(raw.size, 'new HTMLSize("auto", "auto")'),
        position: decodeExpression(raw.position, 'new Vector3(0, 0, 0)'),
        rotation: decodeExpression(raw.rotation, 'new Euler(0, 0, 0)'),
        scale: decodeExpression(raw.scale, 'new Vector2(1, 1)'),
        visible: decodeExpression(raw.visible, 'true'),
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
}

export const DEFAULT_GLB_MODEL_CONFIGURATION: GLBModelConfiguration = {
    type: 'model.glb',
    url: '',
    position: 'new Vector3(0, 0, 0)',
    rotation: 'new Euler(0, 0, 0)',
    scale: 'new Vector3(1, 1, 1)',
    visible: 'true',
} as const

export function decodeGLBModelConfiguration(raw: any): GLBModelConfiguration {
    return {
        type: 'model.glb',
        url: decodeExpression(raw.url, ''),
        position: decodeExpression(raw.position, 'new Vector3(0, 0, 0)'),
        rotation: decodeExpression(raw.rotation, 'new Euler(0, 0, 0)'),
        scale: decodeExpression(raw.scale, 'new Vector3(1, 1, 1)'),
        visible: decodeExpression(raw.visible, 'true'),
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
    position: 'new Vector3(0, 0, 0)',
    intensity: '2000',
    color: 'new Color("#ffffff")',
    helper: 'false',
    visible: 'true',
} as const

export function decodePointLightConfiguration(raw: any): PointLightConfiguration {
    return {
        type: 'light.point',
        position: decodeExpression(raw.position, 'new Vector3(0, 0, 0)'),
        intensity: decodeExpression(raw.intensity, '"1000"'),
        color: decodeExpression(raw.color, 'new Color("#ffffff")'),
        helper: decodeExpression(raw.helper, 'false'),
        visible: decodeExpression(raw.visible, 'true'),
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
    intensity: '2000',
    color: 'new Color("#ffffff")',
    visible: 'true',
} as const

export function decodeAmbientLightConfiguration(raw: any): AmbientLightConfiguration {
    return {
        type: 'light.ambient',
        intensity: decodeExpression(raw.intensity, '"10"'),
        color: decodeExpression(raw.color, 'new Color("#ffffff")'),
        visible: decodeExpression(raw.visible, 'true'),
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
    helper: Expression
    visible: Expression
}

export const DEFAULT_CUSTOM_LIGHT_CONFIGURATION: CustomLightConfiguration = {
    type: 'light.custom',
    url: '',
    position: 'new Vector3(0, 0, 0)',
    rotation: 'new Euler(0, 0, 0)',
    scale: 'new Vector3(1, 1, 1)',
    intensity: '2000',
    color: 'new Color("#ffffff")',
    density: '0.5',
    helper: 'false',
    visible: 'true',
} as const

export function decodeCustomLightConfiguration(raw: any): CustomLightConfiguration {
    return {
        type: 'light.custom',
        url: decodeExpression(raw.url, ''),
        position: decodeExpression(raw.position, 'new Vector3(0, 0, 0)'),
        rotation: decodeExpression(raw.rotation, 'new Euler(0, 0, 0)'),
        scale: decodeExpression(raw.scale, 'new Vector3(1, 1, 1)'),
        intensity: decodeExpression(raw.intensity, '"10"'),
        color: decodeExpression(raw.color, 'new Color("#ffffff")'),
        density: decodeExpression(raw.density, '0.5'),
        helper: decodeExpression(raw.helper, 'false'),
        visible: decodeExpression(raw.visible, 'true'),
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
    position: 'new Vector3(100, 20, 300)',
    lookAt: 'new Vector3(0, 0, 0)',
} as const

export function decodePerspectiveCameraConfiguration(raw: any): PerspectiveCameraConfiguration {
    return {
        type: 'camera.perspective',
        fov: decodeExpression(raw.fov, '50'),
        near: decodeExpression(raw.near, '0.1'),
        far: decodeExpression(raw.far, '1000'),
        position: decodeExpression(raw.position, 'new Vector3(100, 20, 300)'),
        lookAt: decodeExpression(raw.look_at, 'new Vector3(0, 0, 0)'),
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

export type ObjectConfiguration =
    | Card2DConfiguration
    | Card3DConfiguration
    | GLBModelConfiguration
    | PointLightConfiguration
    | AmbientLightConfiguration
    | CustomLightConfiguration
    | PerspectiveCameraConfiguration
