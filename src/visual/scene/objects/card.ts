import { Group } from 'three'
import { CSS3DObject } from 'three/examples/jsm/Addons.js'

import { dispose } from '@/visual/dispose'

import { CardConfiguration } from '@/configuration/objects'

import { Evaluator } from '@/utility/evaluater'
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
    private evaluator: Evaluator

    constructor(name: string, configuration: CardConfiguration, logger: Logger, evaluator: Evaluator) {
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
        this.evaluator = evaluator

        this.cardType = configuration.config.type
        this.loadCard(configuration.config)

        this.logger.debug(`new card '${this.name}'`)
    }

    public updateConfig(configuration: CardConfiguration, homeAssistant: HomeAssistant) {
        this.updateCardType(configuration.config)
        this.updateSize(configuration.size)
        this.updatePosition(configuration.position)
        this.updateRotation(configuration.rotation)
        this.updateScale(configuration.scale)

        if (!this.cardConfigSet && typeof (this.card as any)?.setConfig == 'function') {
            try {
                this.cardConfigSet = true
                ;(this.card as any).setConfig(configuration.config)
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

    private updateCardType(configuration: CardConfiguration['config']) {
        const cardType = configuration.type

        if (this.cardType !== cardType) {
            this.cardType = cardType
            this.loadCard(configuration)
            return
        }
    }

    private updateSize(configuration: CardConfiguration['size']) {
        if (!this.cardOuterElement) return

        const [height, heightError] = this.evaluator.evaluate<string>(configuration.height.value)
        if (heightError) {
            return this.logger.error(`cannot evaluate card '${this.name}' height due to error: ${heightError}`)
        }

        const [width, widthError] = this.evaluator.evaluate<string>(configuration.width.value)
        if (widthError) {
            return this.logger.error(`cannot evaluate card '${this.name}' width due to error: ${widthError}`)
        }

        this.cardOuterElement.style.height = height
        this.cardOuterElement.style.width = width
    }

    private updatePosition(configuration: CardConfiguration['position']) {
        const [x, xError] = this.evaluator.evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate card '${this.name}' x position due to error: ${xError}`)
        }

        const [y, yError] = this.evaluator.evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate card '${this.name}' y position due to error: ${yError}`)
        }

        const [z, zError] = this.evaluator.evaluate<number>(configuration.z.value)
        if (zError) {
            return this.logger.error(`cannot evaluate card '${this.name}' z position due to error: ${zError}`)
        }

        this.three.position.set(x, y, z)
    }

    private updateRotation(configuration: CardConfiguration['rotation']) {
        const [x, xError] = this.evaluator.evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate card '${this.name}' x rotation due to error: ${xError}`)
        }

        const [y, yError] = this.evaluator.evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate card '${this.name}' y rotation due to error: ${yError}`)
        }

        const [z, zError] = this.evaluator.evaluate<number>(configuration.z.value)
        if (zError) {
            return this.logger.error(`cannot evaluate card '${this.name}' z rotation due to error: ${zError}`)
        }

        this.three.rotation.set(x % (2 * Math.PI), y % (Math.PI * 2), z % (Math.PI * 2))
    }

    private updateScale(configuration: CardConfiguration['scale']) {
        const [x, xError] = this.evaluator.evaluate<number>(configuration.x.value)
        if (xError) {
            return this.logger.error(`cannot evaluate card '${this.name}' x scale due to error: ${xError}`)
        }

        const [y, yError] = this.evaluator.evaluate<number>(configuration.y.value)
        if (yError) {
            return this.logger.error(`cannot evaluate card '${this.name}' y scale due to error: ${yError}`)
        }

        const [z, zError] = this.evaluator.evaluate<number>(configuration.z.value)
        if (zError) {
            return this.logger.error(`cannot evaluate card '${this.name}' z scale due to error: ${zError}`)
        }

        this.three.scale.set(x, y, z)
    }

    private async loadCard(configuration: CardConfiguration['config']) {
        const cardHelper = await (window as any).loadCardHelpers()
        this.card = cardHelper.createCardElement(configuration.config)
        if (this.card) this.cardOuterElement.append(this.card)

        this.logger.debug(`card '${this.name}' loaded`)
    }
}
