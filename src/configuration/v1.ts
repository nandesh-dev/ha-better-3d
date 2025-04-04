export type Config = {
    log_level: 'none' | 'error' | 'info' | 'debug'
    active_scene: Expression
    scenes: { [name: string]: SceneProperties }
}

export type SceneProperties = {
    active_camera: Expression
    cameras: { [name: string]: PerspectiveOrbitalCameraProperties }
    objects: { [name: string]: GLBModelProperties | PointLightProperties }
}

export type PerspectiveOrbitalCameraProperties = {
    type: 'orbital.perspective'
    fov: Expression
    near: Expression
    far: Expression
    position: {
        x: Expression
        y: Expression
        z: Expression
    }
    look_at: {
        x: Expression
        y: Expression
        z: Expression
    }
}

export type GLBModelProperties = {
    type: 'model.glb'
    url: Expression
    position: {
        x: Expression
        y: Expression
        z: Expression
    }
    rotation: {
        x: Expression
        y: Expression
        z: Expression
    }
    scale: {
        x: Expression
        y: Expression
        z: Expression
    }
}

export type PointLightProperties = {
    type: 'light.point'
    position: {
        x: Expression
        y: Expression
        z: Expression
    }
    intensity: Expression
    color: Expression
}

export type Expression = string
