import { Euler, Group, Vector2, Vector3 } from 'three'
import { CSS3DSprite } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'

import { Card2DConfiguration } from '@/configuration/objects'
import { encodeExpression } from '@/configuration/value'

import { Error } from '@/utility/error'
import { Evaluator, HTMLSize } from '@/utility/evaluater'
import { HomeAssistant } from '@/utility/home_assistant/types'

export class Card2D {
    public three: Group
    public helper: Group

    public name: string
    private cardType: string | null = null
    private cardConfigSet: boolean = false

    private card: HTMLElement | null = null
    private cardOuterElement: HTMLDivElement
    private cardOuterElementCommonEventListener: (e: Event) => void

    private evaluator: Evaluator

    constructor(name: string, configuration: Card2DConfiguration, evaluator: Evaluator) {
        this.name = name
        this.three = new Group()
        this.helper = new Group()

        this.cardOuterElement = document.createElement('div')
        this.three.add(new CSS3DSprite(this.cardOuterElement))

        this.cardOuterElementCommonEventListener = (e) => e.stopPropagation()
        this.cardOuterElement.addEventListener('keyup', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.addEventListener('keydown', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.addEventListener('wheel', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.addEventListener('contextmenu', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.addEventListener('pointerup', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.addEventListener('pointerdown', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.addEventListener('pointercancel', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.addEventListener('pointermove', this.cardOuterElementCommonEventListener)

        this.evaluator = evaluator

        this.cardType = configuration.config.type
        this.loadCard(configuration.config)
    }

    public updateProperties(configuration: Card2DConfiguration, homeAssistant: HomeAssistant) {
        const evaluator = this.evaluator.withContextValue('Self', {
            position: this.three.position.clone(),
            rotation: this.three.rotation.clone(),
            scale: this.three.scale.clone(),
            visible: this.three.visible,
        })

        if (this.cardType !== configuration.config.type) {
            this.cardType = configuration.config.type
            this.loadCard(configuration.config)
        }

        try {
            this.updateCardProperties(configuration.config, homeAssistant)
        } catch {}

        try {
            const visible = evaluator.evaluate<boolean>(configuration.visible)
            this.three.visible = visible
        } catch (error) {
            throw new Error(`Error evaluating visible`, error)
        }

        if (this.three.visible) {
            try {
                const size = evaluator.evaluate<HTMLSize>(configuration.size)
                Object.assign(this.cardOuterElement.style, size)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.size)}: Error evaluating size`, error)
            }

            try {
                const position = evaluator.evaluate<Vector3>(configuration.position)
                this.three.position.copy(position)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.position)}: Error evaluating position`, error)
            }

            try {
                const rotation = evaluator.evaluate<Euler>(configuration.rotation)
                this.three.rotation.copy(rotation)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.rotation)}: Error evaluating rotation`, error)
            }

            try {
                const scale = evaluator.evaluate<Vector2>(configuration.scale)
                this.three.scale.set(scale.x, scale.y, 1)
            } catch (error) {
                throw new Error(`${encodeExpression(configuration.scale)}: Error evaluating scale`, error)
            }
        }
    }

    public dispose() {
        dispose(this.three)
        this.cardOuterElement.removeEventListener('keyup', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('keydown', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('wheel', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('contextmenu', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('pointerup', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('pointerdown', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('pointercancel', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('pointermove', this.cardOuterElementCommonEventListener)
    }

    private updateCardProperties(configuration: Card2DConfiguration['config'], homeAssistant: HomeAssistant) {
        if (!this.cardConfigSet && typeof (this.card as any)?.setConfig == 'function') {
            try {
                this.cardConfigSet = true
                ;(this.card as any).setConfig(configuration)
            } catch (error) {
                throw new Error(`Set configuration`, error)
            }
        }

        if (this.card) {
            try {
                ;(this.card as any).hass = homeAssistant
            } catch (error) {
                throw new Error(`Update hass`, error)
            }
        }
    }

    private async loadCard(configuration: Card2DConfiguration['config']) {
        const cardHelper = await (window as any).loadCardHelpers()
        this.card = cardHelper.createCardElement(configuration)
        if (this.card) this.cardOuterElement.append(this.card)
    }
}
