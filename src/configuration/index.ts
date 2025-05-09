import { CameraConfiguration, PerspectiveOrbitalCameraConfiguration } from './cameras'
import { Expression } from './expression'
import {
    AmbientLightConfiguration,
    Card2DConfiguration,
    Card3DConfiguration,
    GLBModelConfiguration,
    ObjectConfiguration,
    PointLightConfiguration,
} from './objects'

export class Configuration {
    public type: string
    public activeScene: Expression
    public scenes: { [name: string]: SceneConfiguration }
    public styles: string

    constructor(raw: any) {
        this.type = raw.type

        this.activeScene = new Expression(raw?.active_scene, '""')

        this.scenes = {}
        if (raw?.scenes !== undefined) {
            for (const name in raw.scenes) {
                const properties = raw.scenes[name]
                this.scenes[name] = new SceneConfiguration(properties)
            }
        }

        this.styles = raw?.styles || ''
    }

    public encode() {
        const encodedScenes: { [name: string]: any } = {}

        for (const name in this.scenes) {
            encodedScenes[name] = this.scenes[name].encode()
        }

        return {
            type: this.type,
            active_scene: this.activeScene.encode(),
            scenes: encodedScenes,
            styles: this.styles,
        }
    }
}

export class SceneConfiguration {
    public activeCamera: Expression
    public backgroundColor: Expression
    public cameras: { [name: string]: CameraConfiguration }
    public objects: { [name: string]: ObjectConfiguration }

    constructor(raw: any) {
        this.activeCamera = new Expression(raw?.active_camera, '""')

        this.backgroundColor = new Expression(raw?.background_color, 'new Color("#eeeeee")')

        this.cameras = {}
        if (raw?.cameras !== undefined) {
            for (const name in raw.cameras) {
                const properties = raw.cameras[name]
                switch (properties.type) {
                    case 'orbital.perspective':
                        this.cameras[name] = new PerspectiveOrbitalCameraConfiguration(properties)
                        break
                }
            }
        }

        this.objects = {}
        if (raw?.objects !== undefined) {
            for (const name in raw.objects) {
                const properties = raw.objects[name]
                switch (properties.type) {
                    case 'card.2d':
                        this.objects[name] = new Card2DConfiguration(properties)
                        break
                    case 'card.3d':
                        this.objects[name] = new Card3DConfiguration(properties)
                        break
                    case 'model.glb':
                        this.objects[name] = new GLBModelConfiguration(properties)
                        break
                    case 'light.point':
                        this.objects[name] = new PointLightConfiguration(properties)
                        break
                    case 'light.ambient':
                        this.objects[name] = new AmbientLightConfiguration(properties)
                        break
                }
            }
        }
    }

    public encode() {
        const encodedCameras: { [name: string]: any } = {}
        for (const name in this.cameras) {
            encodedCameras[name] = this.cameras[name].encode()
        }

        const encodedObjects: { [name: string]: any } = {}
        for (const name in this.objects) {
            encodedObjects[name] = this.objects[name].encode()
        }

        return {
            active_camera: this.activeCamera.encode(),
            background_color: this.backgroundColor.encode(),
            cameras: encodedCameras,
            objects: encodedObjects,
        }
    }
}
