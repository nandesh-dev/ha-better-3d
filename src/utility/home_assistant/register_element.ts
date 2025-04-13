import { ComponentType, h, render } from 'preact'

import { HomeAssistant } from './types'

export type ComponentProps = {
    config: unknown | null
    setConfig: (config: unknown) => void
    homeAssistant: HomeAssistant | null
}

export type Component = ComponentType<ComponentProps>

export type PropertyKey = Exclude<
    string,
    'setConfig' | 'connectedCallback' | 'disconnectedCallback' | 'update' | 'config' | 'homeAssistant'
>

export type PropertyMap = Record<PropertyKey, any>

export function registerElement(name: string, component: Component, propertyMap: PropertyMap) {
    class CustomElement extends HTMLElement {
        private homeAssistant: HomeAssistant | null = null
        private config: unknown | null = null

        constructor() {
            super()
        }

        public set hass(hass: HomeAssistant) {
            this.homeAssistant = hass
            this.update()
        }

        public setConfig(config: unknown) {
            this.config = config
            this.update()
        }

        public connectedCallback() {
            this.update()
        }

        public disconnectedCallback() {
            render(null, this)
        }

        private updateConfig(config: unknown) {
            const event = new CustomEvent<{ config: unknown }>('config-changed', {
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
