import { render } from 'preact'

import { HomeAssistant } from '@/utility/home_assistant/types'

import { Editor } from './editor'

export const EDITOR_ELEMENT_TAG_NAME = process.env.PRODUCTION ? 'better-3d-editor' : 'better-3d-editor_development'

export class EditorHTMLElement extends HTMLElement {
    private homeAssistant: HomeAssistant | null = null
    private rawConfiguration: unknown | null = null

    constructor() {
        super()
    }

    public set hass(hass: HomeAssistant) {
        this.homeAssistant = hass
        this.update()
    }

    public setConfig(rawConfig: unknown) {
        this.rawConfiguration = rawConfig
        this.update()
    }

    public connectedCallback() {
        this.update()
    }

    public disconnectedCallback() {
        render(null, this)
    }

    private updateRawConfiguration(updatedRawConfig: unknown) {
        const event = new CustomEvent<{ config: unknown }>('config-changed', {
            detail: { config: updatedRawConfig },
            bubbles: true,
            composed: true,
        })
        this.dispatchEvent(event)
    }

    private update() {
        if (!this.homeAssistant || !this.rawConfiguration) return
        render(
            <Editor
                homeAssistant={this.homeAssistant}
                rawConfiguration={this.rawConfiguration}
                updateRawConfiguration={(newRawConfiguration) => this.updateRawConfiguration(newRawConfiguration)}
            />,
            this
        )
    }
}
