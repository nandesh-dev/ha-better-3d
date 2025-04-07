import { CardProperties } from '@/configuration/v1'
import { Euler, Group } from 'three'
import { CSS3DObject } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'
import { evaluate } from '@/visual/evaluate'

import { HomeAssistant } from '@/utility/home_assistant/types'
import { Logger } from '@/utility/logger'

export class Card {
    public type: string = 'card'
    public three: Group

    public name: string
    private cardType: string | null = null
    private cardConfigSet: boolean = false

    private card: HTMLElement | null = null
    private cardOuterElement: HTMLDivElement
    private cardOuterElementCommonEventListener: (e: Event) => void

    private logger: Logger

    constructor(name: string, properties: CardProperties, logger: Logger) {
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

        this.logger = logger

        this.cardType = properties.config.type
        this.loadCard(properties.config)

        this.logger.debug(`new card '${this.name}'`)
    }

    public updateProperties(properties: CardProperties, homeAssistant: HomeAssistant) {
        this.updateCardType(properties)
        this.updateSize(properties.size)
        this.updatePosition(properties.position)
        this.updateRotation(properties.rotation)
        this.updateScale(properties.scale)

        if (!this.cardConfigSet && typeof (this.card as any)?.setConfig == 'function') {
            try {
                this.cardConfigSet = true
                ;(this.card as any).setConfig(properties.config)
            } catch {}
        }

        if (this.card) {
            ;(this.card as any).hass = homeAssistant
        }
    }

    public dispose() {
        if (this.three) dispose(this.three)
        this.cardOuterElement.removeEventListener('keyup', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('keydown', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('wheel', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('contextmenu', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('pointerup', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('pointerdown', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('pointercancel', this.cardOuterElementCommonEventListener)
        this.cardOuterElement.removeEventListener('pointermove', this.cardOuterElementCommonEventListener)
    }

    private updateCardType(properties: CardProperties) {
        const cardType = properties.config.type

        if (this.cardType !== cardType) {
            this.cardType = cardType
            this.loadCard(properties.config)
            return
        }
    }

    private updateSize(property: CardProperties['size']) {
        if (!this.cardOuterElement) return

        const [height, heightError] = evaluate<string>(property.height)
        if (heightError) {
            return this.logger.error(`cannot evaluate card '${this.name}' height due to error: ${heightError}`)
        }

        const [width, widthError] = evaluate<string>(property.width)
        if (widthError) {
            return this.logger.error(`cannot evaluate card '${this.name}' width due to error: ${widthError}`)
        }

        this.cardOuterElement.style.height = height
        this.cardOuterElement.style.width = width
    }

    private updatePosition(property: CardProperties['position']) {
        const [x, xError] = evaluate<number>(property.x)
        if (xError) {
            return this.logger.error(`cannot evaluate card '${this.name}' x position due to error: ${xError}`)
        }

        const [y, yError] = evaluate<number>(property.y)
        if (yError) {
            return this.logger.error(`cannot evaluate card '${this.name}' y position due to error: ${yError}`)
        }

        const [z, zError] = evaluate<number>(property.z)
        if (zError) {
            return this.logger.error(`cannot evaluate card '${this.name}' z position due to error: ${zError}`)
        }

        this.three.position.set(x, y, z)
    }

    private updateRotation(property: CardProperties['rotation']) {
        const [x, xError] = evaluate<number>(property.x)
        if (xError) {
            return this.logger.error(`cannot evaluate card '${this.name}' x rotation due to error: ${xError}`)
        }

        const [y, yError] = evaluate<number>(property.y)
        if (yError) {
            return this.logger.error(`cannot evaluate card '${this.name}' y rotation due to error: ${yError}`)
        }

        const [z, zError] = evaluate<number>(property.z)
        if (zError) {
            return this.logger.error(`cannot evaluate card '${this.name}' z rotation due to error: ${zError}`)
        }

        this.three.setRotationFromEuler(new Euler(x, y, z))
    }

    private updateScale(property: CardProperties['scale']) {
        const [x, xError] = evaluate<number>(property.x)
        if (xError) {
            return this.logger.error(`cannot evaluate card '${this.name}' x scale due to error: ${xError}`)
        }

        const [y, yError] = evaluate<number>(property.y)
        if (yError) {
            return this.logger.error(`cannot evaluate card '${this.name}' y scale due to error: ${yError}`)
        }

        const [z, zError] = evaluate<number>(property.z)
        if (zError) {
            return this.logger.error(`cannot evaluate card '${this.name}' z scale due to error: ${zError}`)
        }

        this.three.scale.set(x, y, z)
    }

    private async loadCard(config: CardProperties['config']) {
        const cardHelper = await (window as any).loadCardHelpers()
        this.card = cardHelper.createCardElement(config)
        if (this.card) this.cardOuterElement.append(this.card)

        this.logger.debug(`card '${this.name}' loaded`)
    }
}
