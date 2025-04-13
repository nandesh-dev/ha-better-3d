import { Configuration } from '@/configuration'
import { GlobalResourceManager } from '@/global'

import { evaluate } from '@/utility/evaluate'
import { HomeAssistant } from '@/utility/home_assistant/types'
import { LogLevel, Logger } from '@/utility/logger'
import { ResourceManager } from '@/utility/resource_manager'

import { Renderer } from './renderer'
import { Scene } from './scene'

const RENDER_TO_PROPERTIES_UPDATE_RATIO = 5

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

    private disposed: boolean = false
    private paused: boolean = false

    public domElement: HTMLDivElement

    private renderCyclesLeftForPropertiesUpdate: number = 1
    constructor(size: Size, configuration: Configuration, homeAssistant: HomeAssistant) {
        this.size = size
        this.configuration = configuration
        this.homeAssistant = homeAssistant

        this.resourceManager = GlobalResourceManager
        this.logger = new Logger(LogLevel.Error)

        this.renderer = new Renderer()
        this.domElement = this.renderer.domElement

        this.animate()
    }

    public updateConfig(config: Configuration) {
        console.log(config)
        this.configuration = config
        this.paused = false
        this.updateProperties()
    }

    public updateHomeAssistant(homeAssistant: HomeAssistant) {
        this.homeAssistant = homeAssistant
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
            const sceneProperties = this.configuration.scenes[sceneName]
            let scene = this.scenes[sceneName]

            if (!scene) {
                scene = new Scene(sceneName, this.renderer, this.resourceManager, this.logger)
                this.scenes[sceneName] = scene
            }

            scene.updateProperties(sceneProperties, this.homeAssistant)
            scene.updateSize(this.size)
        }

        const [activeSceneName, error] = evaluate<string>(this.configuration.activeScene.value)
        if (error) this.logger.error(`cannot evaluate active scene name due to error: ${error}`)
        else {
            this.activeScene = this.scenes[activeSceneName]
        }
        this.renderer.setSize(this.size.height, this.size.width)
    }

    private animate() {
        if (this.disposed) return
        requestAnimationFrame(() => this.animate())

        if (this.renderCyclesLeftForPropertiesUpdate == 0) this.updateProperties()
        this.renderCyclesLeftForPropertiesUpdate =
            (this.renderCyclesLeftForPropertiesUpdate - 1) % RENDER_TO_PROPERTIES_UPDATE_RATIO

        if (this.paused || !this.configuration) return
        if (!this.activeScene || !this.activeScene.activeCamera) return

        this.renderer.render(this.activeScene.three, this.activeScene.activeCamera.three)
    }
}
