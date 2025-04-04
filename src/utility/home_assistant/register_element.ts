import { ComponentType, h, render } from 'preact'

import { HomeAssistant } from './types'

export type ComponentProps<ConfigType> = {
    config: ConfigType | null
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
        [key: string]: any
        private homeAssistant: HomeAssistant | null = null
        private config: ConfigType | null = null

        constructor() {
            super()
            for (const propertyName in propertyMap) {
                this[propertyName] = propertyMap[propertyName]
            }
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

        private update() {
            render(
                h(component, {
                    config: this.config,
                    homeAssistant: this.homeAssistant,
                }),
                this
            )
        }
    }

    customElements.define(name, CustomElement)
}
