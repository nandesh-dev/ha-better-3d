import { Configuration } from '@/configuration'
import { GlobalResourceManager } from '@/global'

import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'
import { encodeStates } from '@/utility/home_assistant/encode_states'
import { HomeAssistant } from '@/utility/home_assistant/types'
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
    private evaluator: Evaluator

    private disposed: boolean = false
    private paused: boolean = false
    private errorElement: HTMLParagraphElement

    public domElement: HTMLDivElement
    constructor(size: Size, configuration: Configuration, homeAssistant: HomeAssistant) {
        this.size = size
        this.configuration = configuration
        this.homeAssistant = homeAssistant

        this.resourceManager = GlobalResourceManager
        this.evaluator = new Evaluator({ Entities: encodeStates(homeAssistant.states) })

        this.domElement = document.createElement('div')
        this.domElement.classList.add('visual')

        this.renderer = new Renderer()
        const rendererContainerElement = document.createElement('div')
        rendererContainerElement.classList.add('visual__renderer')
        rendererContainerElement.append(this.renderer.domElement)
        this.domElement.append(rendererContainerElement)

        this.errorElement = document.createElement('p')
        this.errorElement.classList.add('visual__error')

        this.animate()
    }

    public updateConfig(config: Configuration) {
        this.configuration = config
        this.updateProperties()
    }

    public updateHomeAssistant(homeAssistant: HomeAssistant) {
        this.homeAssistant = homeAssistant
        this.evaluator.setContextValue('Entities', encodeStates(homeAssistant.states))
        this.updateProperties()
    }

    public updateSize(size: Size) {
        this.size = size
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
        try {
            this.renderer.setSize(this.size.height, this.size.width)

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
                    scene = new Scene(sceneName, this.renderer, this.resourceManager, this.evaluator)
                    this.scenes[sceneName] = scene
                }
            }

            let activeSceneName
            try {
                activeSceneName = this.evaluator.evaluate<string>(this.configuration.activeScene)
            } catch (error) {
                throw new Error(
                    `${encodeExpression(this.configuration.activeScene)}: Error evaluating active scene`,
                    error
                )
            }
            this.activeScene = this.scenes[activeSceneName]
            if (!this.activeScene) return

            const sceneConfiguration = this.configuration.scenes[activeSceneName]
            try {
                this.activeScene.updateActiveCamera(sceneConfiguration)
            } catch (error) {
                throw new Error(`Update active camera`, error)
            }
            if (!this.activeScene.activeCamera) return

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

            try {
                this.activeScene.updateProperties(sceneConfiguration, this.homeAssistant)
            } catch (error) {
                throw new Error(`Update scene properties`, error)
            }
            this.activeScene.updateSize(this.size)

            if (this.paused) {
                this.paused = false
                this.clearError()
            }
        } catch (error) {
            if (!this.paused) {
                this.paused = true
                this.setError(error as Error)
            }
        }
    }

    private setError(error: Error) {
        this.domElement.append(this.errorElement)
        this.errorElement.innerText = error.toString()
    }

    private clearError() {
        if (!this.domElement.contains(this.errorElement)) return
        this.domElement.removeChild(this.errorElement)
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
