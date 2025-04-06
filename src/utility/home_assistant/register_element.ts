import { ComponentType, h, render } from 'preact'

import { HomeAssistant } from './types'

export type ComponentProps<ConfigType> = {
    config: ConfigType | null
    setConfig: (config: ConfigType) => void
    homeAssistant: HomeAssistant | null
}

export type Component<ConfigType> = ComponentType<ComponentProps<ConfigType>>

export type PropertyKey = Exclude<
    string,
    'setConfig' | 'connectedCallback' | 'disconnectedCallback' | 'update' | 'config' | 'homeAssistant'
>

export type PropertyMap = Record<PropertyKey, any>

export function registerElement<ConfigType>(name: string, component: Component<ConfigType>, propertyMap: PropertyMap) {
    class CustomElement extends HTMLElement {
        private homeAssistant: HomeAssistant | null = null
        private config: ConfigType | null = null

        constructor() {
            super()
        }

        public set hass(hass: HomeAssistant) {
            this.homeAssistant = hass
            this.update()
        }

        public setConfig(config: ConfigType) {
            this.config = config
            this.update()
        }

        public connectedCallback() {
            this.update()
        }

        public disconnectedCallback() {
            render(null, this)
        }

        private updateConfig(config: ConfigType) {
            const event = new CustomEvent<{ config: ConfigType }>('config-changed', {
                detail: { config },
                bubbles: true,
                composed: true,
            })
            this.dispatchEvent(event)
        }

        private update() {
            render(
                h(component, {
                    config: this.config,
                    setConfig: (config) => this.updateConfig(config),
                    homeAssistant: this.homeAssistant,
                }),
                this
            )
        }
    }

    for (const propertyName in propertyMap) {
        ;(CustomElement as unknown as { [key: PropertyKey]: any })[propertyName] = propertyMap[propertyName]
    }

    customElements.define(name, CustomElement)
}
