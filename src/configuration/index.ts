import { CameraConfiguration, PerspectiveOrbitalCameraConfiguration } from './cameras'
import { ExpressionConfiguration } from './common'
import { CardConfiguration, GLBModelConfiguration, ObjectConfiguration, PointLightConfiguration } from './objects'

export class Configuration {
    activeScene: ExpressionConfiguration
    scenes: { [name: string]: SceneConfiguration }
    constructor(raw: any) {
        this.activeScene = new ExpressionConfiguration(raw?.active_scene, '""')

        this.scenes = {}
        if (raw?.scenes !== undefined) {
            for (const name in raw.scenes) {
                const properties = raw.scenes[name]
                this.scenes[name] = new SceneConfiguration(properties)
            }
        }
    }
}

export class SceneConfiguration {
    public activeCamera: ExpressionConfiguration
    public cameras: { [name: string]: CameraConfiguration }
    public objects: { [name: string]: ObjectConfiguration }
    constructor(raw: any) {
        this.activeCamera = new ExpressionConfiguration(raw?.active_camera, '""')

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
                    case 'card':
                        this.objects[name] = new CardConfiguration(properties)
                        break
                    case 'model.glb':
                        this.objects[name] = new GLBModelConfiguration(properties)
                        break
                    case 'light.point':
                        this.objects[name] = new PointLightConfiguration(properties)
                        break
                }
            }
        }
    }
}
