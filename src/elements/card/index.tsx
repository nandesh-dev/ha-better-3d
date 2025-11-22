import { DEFAULT_CONFIGURATION, decodeConfiguration } from '@/configuration'
import { Visual } from '@/visual'

import { HomeAssistant } from '@/utility/home_assistant/types'
import { setLastCreatedVisual } from '@/utility/hot_reload'

import { EDITOR_ELEMENT_TAG_NAME } from '../editor'

export class CardHTMLElement extends HTMLElement {
    private homeAssistant: HomeAssistant | null = null
    private rawConfiguration: unknown | null = null
    private visual: Visual | null = null
    private connected: boolean = false
    private styleElement: HTMLStyleElement

    constructor() {
        super()
        this.styleElement = document.createElement('style')
    }

    public set hass(hass: HomeAssistant) {
        this.homeAssistant = hass
        if (this.visual) this.visual.updateHomeAssistant(hass)
        this.update()
    }

    public setConfig(rawConfig: unknown) {
        this.rawConfiguration = rawConfig
        if (this.visual) this.visual.updateConfig(decodeConfiguration(rawConfig))
        this.update()
    }

    public connectedCallback() {
        this.connected = true
        this.update()
    }

    public disconnectedCallback() {
        if (!this.visual) return
        this.removeChild(this.visual.domElement)
        this.visual.dispose()
        this.visual = null
    }

    private update() {
        if (!this.homeAssistant || !this.rawConfiguration || !this.connected) return

        const configuration = decodeConfiguration(this.rawConfiguration)
        this.styleElement.innerText = configuration.styles

        if (this.visual) return
        this.visual = new Visual(configuration, this.homeAssistant)

        setLastCreatedVisual(this.visual)

        this.className = 'better-3d__card'

        this.appendChild(this.styleElement)
        this.appendChild(this.visual.domElement)
    }

    public getStubConfig() {
        return DEFAULT_CONFIGURATION
    }

    public static getConfigElement() {
        return document.createElement(EDITOR_ELEMENT_TAG_NAME)
    }
}
