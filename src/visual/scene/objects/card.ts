import { Group } from 'three'
import { CSS3DObject } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'

import { ExpressionConfiguration } from '@/configuration/common'
import { CardConfiguration } from '@/configuration/objects'

import { Error } from '@/utility/error'
import { Evaluator } from '@/utility/evaluater'
import { HomeAssistant } from '@/utility/home_assistant/types'

export class Card {
    public type: string = 'card'
    public three: Group

    public name: string
    private cardType: string | null = null
    private cardConfigSet: boolean = false

    private card: HTMLElement | null = null
    private cardOuterElement: HTMLDivElement
    private cardOuterElementCommonEventListener: (e: Event) => void

    private evaluator: Evaluator

    constructor(name: string, configuration: CardConfiguration, evaluator: Evaluator) {
        this.name = name
        this.three = new Group()

        this.cardOuterElement = document.createElement('div')
        this.three.add(new CSS3DObject(this.cardOuterElement))

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

    public updateProperties(configuration: CardConfiguration, homeAssistant: HomeAssistant) {
        const evaluator = this.evaluator.withContextValue('Self', {
            position: {
                x: this.three.position.x,
                y: this.three.position.y,
                z: this.three.position.z,
            },
            rotation: {
                x: this.three.rotation.x,
                y: this.three.rotation.y,
                z: this.three.rotation.z,
            },
            scale: {
                x: this.three.scale.x,
                y: this.three.scale.y,
                z: this.three.scale.z,
            },
            visible: this.three.visible,
        })

        this.updateCardType(configuration.config)

        try {
            this.updateVisible(configuration.visible, evaluator)
        } catch (error) {
            throw new Error(`Update visible`, error)
        }

        try {
            this.updateSize(configuration.size, evaluator)
        } catch (error) {
            throw new Error('Update size', error)
        }

        try {
            this.updatePosition(configuration.position, evaluator)
        } catch (error) {
            throw new Error('Update position', error)
        }

        try {
            this.updateRotation(configuration.rotation, evaluator)
        } catch (error) {
            throw new Error('Update rotation', error)
        }

        try {
            this.updateScale(configuration.scale, evaluator)
        } catch (error) {
            throw new Error('Update scale', error)
        }

        try {
            this.updateCardProperties(configuration.config, homeAssistant)
        } catch {}
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

    private updateCardProperties(configuration: CardConfiguration['config'], homeAssistant: HomeAssistant) {
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

    private updateCardType(configuration: CardConfiguration['config']) {
        const cardType = configuration.type

        if (this.cardType !== cardType) {
            this.cardType = cardType
            this.loadCard(configuration)
            return
        }
    }

    private updateVisible(configuration: ExpressionConfiguration, evaluator: Evaluator) {
        try {
            const visible = evaluator.evaluate<boolean>(configuration.value)
            this.three.visible = visible
        } catch (error) {
            throw new Error(`${configuration.encode()}: Error evaluating expression`, error)
        }
    }

    private updateSize(configuration: CardConfiguration['size'], evaluator: Evaluator) {
        let height, width

        try {
            height = evaluator.evaluate<string>(configuration.height.value)
        } catch (error) {
            throw new Error(`${configuration.height.encode()}: Error evaluating height expression`, error)
        }

        try {
            width = evaluator.evaluate<string>(configuration.width.value)
        } catch (error) {
            throw new Error(`${configuration.width.encode()}: Error evaluating height expression`, error)
        }

        Object.assign(this.cardOuterElement.style, { height, width })
    }

    private updatePosition(configuration: CardConfiguration['position'], evaluator: Evaluator) {
        let x, y, z

        try {
            x = evaluator.evaluate<number>(configuration.x.value)
        } catch (error) {
            throw new Error(`${configuration.x.encode()}: Error evaluating x expression`, error)
        }

        try {
            y = evaluator.evaluate<number>(configuration.y.value)
        } catch (error) {
            throw new Error(`${configuration.y.encode()}: Error evaluating y expression`, error)
        }

        try {
            z = evaluator.evaluate<number>(configuration.z.value)
        } catch (error) {
            throw new Error(`${configuration.z.encode()}: Error evaluating z expression`, error)
        }

        this.three.position.set(x, y, z)
    }

    private updateRotation(configuration: CardConfiguration['rotation'], evaluator: Evaluator) {
        let x, y, z

        try {
            x = evaluator.evaluate<number>(configuration.x.value)
        } catch (error) {
            throw new Error(`${configuration.x.encode()}: Error evaluating x expression`, error)
        }

        try {
            y = evaluator.evaluate<number>(configuration.y.value)
        } catch (error) {
            throw new Error(`${configuration.y.encode()}: Error evaluating y expression`, error)
        }

        try {
            z = evaluator.evaluate<number>(configuration.z.value)
        } catch (error) {
            throw new Error(`${configuration.z.encode()}: Error evaluating z expression`, error)
        }

        this.three.rotation.set(x, y, z)
    }

    private updateScale(configuration: CardConfiguration['scale'], evaluator: Evaluator) {
        let x, y, z

        try {
            x = evaluator.evaluate<number>(configuration.x.value)
        } catch (error) {
            throw new Error(`${configuration.x.encode()}: Error evaluating x expression`, error)
        }

        try {
            y = evaluator.evaluate<number>(configuration.y.value)
        } catch (error) {
            throw new Error(`${configuration.y.encode()}: Error evaluating y expression`, error)
        }

        try {
            z = evaluator.evaluate<number>(configuration.z.value)
        } catch (error) {
            throw new Error(`${configuration.z.encode()}: Error evaluating z expression`, error)
        }

        this.three.scale.set(x, y, z)
    }

    private async loadCard(configuration: CardConfiguration['config']) {
        const cardHelper = await (window as any).loadCardHelpers()
        this.card = cardHelper.createCardElement(configuration.config)
        if (this.card) this.cardOuterElement.append(this.card)
    }
}
