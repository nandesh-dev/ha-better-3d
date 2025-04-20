import { Configuration } from '@/configuration'
import { GlobalResourceManager } from '@/global'

import { Evaluator } from '@/utility/evaluater'
import { HomeAssistant } from '@/utility/home_assistant/types'
import { LogLevel, Logger } from '@/utility/logger'
import { ResourceManager } from '@/utility/resource_manager'

import { Renderer } from './renderer'
import { Scene } from './scene'

export type Size = {
    height: number
    width: number
}

export class Visual {
    private size: Size
    private configuration: Configuration
    private homeAssistant: HomeAssistant

    private renderer: Renderer
    private scenes: { [name: string]: Scene } = {}
    private activeScene: Scene | null = null

    private resourceManager: ResourceManager
    private logger: Logger
    private evaluator: Evaluator

    private disposed: boolean = false
    private paused: boolean = false

    public domElement: HTMLDivElement
    constructor(size: Size, configuration: Configuration, homeAssistant: HomeAssistant, logger: Logger) {
        this.size = size
        this.configuration = configuration
        this.homeAssistant = homeAssistant

        this.resourceManager = GlobalResourceManager
        this.logger = logger
        this.evaluator = new Evaluator({ Entities: homeAssistant.entities })

        this.renderer = new Renderer()
        this.domElement = this.renderer.domElement

        this.animate()
    }

    public updateConfig(config: Configuration) {
        this.configuration = config
        this.paused = false
        this.updateProperties()
    }

    public updateHomeAssistant(homeAssistant: HomeAssistant) {
        this.homeAssistant = homeAssistant
        this.evaluator.setContextValue('Entities', homeAssistant.entities)
        this.updateProperties()
    }

    public updateSize(size: Size) {
        this.size = size
        this.paused = false
        this.updateProperties()
    }

    public dispose() {
        this.disposed = true
        for (const scene of Object.values(this.scenes)) {
            scene.dispose()
        }
        this.renderer.dispose()
    }

    private updateProperties() {
        for (const sceneName in this.scenes) {
            const scene = this.scenes[sceneName]
            const sceneProperties = this.configuration.scenes[sceneName]

            if (!sceneProperties) {
                scene.dispose()
                delete this.scenes[sceneName]
            }
        }

        for (const sceneName in this.configuration.scenes) {
            let scene = this.scenes[sceneName]

            if (!scene) {
                scene = new Scene(sceneName, this.renderer, this.resourceManager, this.logger, this.evaluator)
                this.scenes[sceneName] = scene
            }
        }

        const [activeSceneName, error] = this.evaluator.evaluate<string>(this.configuration.activeScene.value)
        if (error) this.logger.error(`cannot evaluate active scene name due to error: ${error}`)
        else {
            this.activeScene = this.scenes[activeSceneName]
            const sceneConfiguration = this.configuration.scenes[activeSceneName]

            this.activeScene?.updateActiveCamera(sceneConfiguration)

            if (this.activeScene?.activeCamera) {
                const camera = this.activeScene.activeCamera.three
                this.evaluator.setContextValue('Camera', {
                    position: {
                        x: camera.position.x,
                        y: camera.position.y,
                        z: camera.position.z,
                    },
                    rotation: {
                        x: camera.rotation.x,
                        y: camera.rotation.y,
                        z: camera.rotation.z,
                    },
                })
            }

            this.activeScene?.updateObjectsProperty(sceneConfiguration, this.homeAssistant)
            this.activeScene?.updateSize(this.size)
        }
        this.renderer.setSize(this.size.height, this.size.width)
    }

    private animate() {
        if (this.disposed) return
        requestAnimationFrame(() => this.animate())

        this.updateProperties()

        if (this.paused || !this.configuration) return
        if (!this.activeScene || !this.activeScene.activeCamera) return

        this.renderer.render(this.activeScene.three, this.activeScene.activeCamera.three)
    }
}
