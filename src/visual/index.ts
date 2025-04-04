import { Config } from '@/configuration/v1'
import { GlobalResourceManager } from '@/global'

import { LogLevel, Logger } from '@/utility/logger'
import { ResourceManager } from '@/utility/resource_manager'

import { evaluate } from './evaluate'
import { Renderer } from './renderer'
import { Scene } from './scene'

const RENDER_TO_PROPERTIES_UPDATE_RATIO = 5

export type Size = {
    height: number
    width: number
}

export class Visual {
    private size: Size
    private config: Config

    private renderer: Renderer
    private scenes: { [name: string]: Scene } = {}
    private activeScene: Scene | null = null

    private resourceManager: ResourceManager
    private logger: Logger

    private disposed: boolean = false
    private paused: boolean = false

    public domElement: HTMLDivElement

    private renderCyclesLeftForPropertiesUpdate: number = 1
    constructor(size: Size, config: Config) {
        this.size = size
        this.config = config

        this.resourceManager = GlobalResourceManager
        this.logger = new Logger(LogLevel.Error)

        this.renderer = new Renderer()
        this.domElement = this.renderer.domElement

        this.animate()
    }

    public updateConfig(config: Config) {
        this.config = config
        this.paused = false
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
        switch (this.config.log_level) {
            case 'none':
                this.logger.setLevel(LogLevel.None)
                break
            case 'error':
                this.logger.setLevel(LogLevel.Error)
                break
            case 'info':
                this.logger.setLevel(LogLevel.Info)
                break
            case 'debug':
                this.logger.setLevel(LogLevel.Debug)
                break
            default:
                this.logger.error(`invalid log level '${this.config.log_level}'`)
        }

        for (const sceneName in this.scenes) {
            const scene = this.scenes[sceneName]
            const sceneProperties = this.config.scenes[sceneName]

            if (!sceneProperties) {
                scene.dispose()
                delete this.scenes[sceneName]
            }
        }

        for (const sceneName in this.config.scenes) {
            const sceneProperties = this.config.scenes[sceneName]
            let scene = this.scenes[sceneName]

            if (!scene) {
                scene = new Scene(sceneName, this.renderer, this.resourceManager, this.logger)
                this.scenes[sceneName] = scene
            }

            scene.updateProperties(sceneProperties)
            scene.updateSize(this.size)
        }

        const [activeSceneName, error] = evaluate<string>(this.config.active_scene)
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

        if (this.paused || !this.config) return
        if (!this.activeScene || !this.activeScene.activeCamera) return

        this.renderer.render(this.activeScene.three, this.activeScene.activeCamera.three)
    }
}
