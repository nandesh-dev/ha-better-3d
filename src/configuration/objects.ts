import { Expression } from './expression'

export type ObjectConfiguration =
    | Card2DConfiguration
    | Card3DConfiguration
    | GLBModelConfiguration
    | PointLightConfiguration
    | AmbientLightConfiguration

export class CardConfigConfiguration {
    type: string
    config: any

    constructor(raw: any) {
        this.type = raw?.type !== undefined ? raw.type : '""'
        this.config = raw
    }

    public encode() {
        return this.config
    }
}

export class Card3DConfiguration {
    public config: CardConfigConfiguration
    public size: Expression
    public position: Expression
    public rotation: Expression
    public scale: Expression
    public visible: Expression

    constructor(raw: any) {
        this.config = new CardConfigConfiguration(raw?.config)
        this.size = new Expression(raw?.size, 'new HTMLSize("auto", "auto")')
        this.position = new Expression(raw?.position, 'new Vector3(0, 0, 0)')
        this.rotation = new Expression(raw?.rotation, 'new Euler(0, 0, 0)')
        this.scale = new Expression(raw?.scale, 'new Vector2(1, 1)')
        this.visible = new Expression(raw?.visible, 'true')
    }

    public encode() {
        return {
            type: 'card.3d',
            config: this.config.encode(),
            size: this.size.encode(),
            position: this.position.encode(),
            rotation: this.rotation.encode(),
            scale: this.scale.encode(),
            visible: this.visible.encode(),
        }
    }
}

export class Card2DConfiguration {
    public config: CardConfigConfiguration
    public size: Expression
    public position: Expression
    public rotation: Expression
    public scale: Expression
    public visible: Expression

    constructor(raw: any) {
        this.config = new CardConfigConfiguration(raw?.config)
        this.size = new Expression(raw?.size, 'new HTMLSize("auto", "auto")')
        this.position = new Expression(raw?.position, 'new Vector3(0, 0, 0)')
        this.rotation = new Expression(raw?.rotation, 'new Euler(0, 0, 0)')
        this.scale = new Expression(raw?.scale, 'new Vector2(1, 1)')
        this.visible = new Expression(raw?.visible, 'true')
    }

    public encode() {
        return {
            type: 'card.2d',
            config: this.config.encode(),
            size: this.size.encode(),
            position: this.position.encode(),
            rotation: this.rotation.encode(),
            scale: this.scale.encode(),
            visible: this.visible.encode(),
        }
    }
}

export class GLBModelConfiguration {
    public url: Expression
    public position: Expression
    public rotation: Expression
    public scale: Expression
    public visible: Expression

    constructor(raw: any) {
        this.url = new Expression(raw?.url, '')
        this.position = new Expression(raw?.position, 'new Vector3(0, 0, 0)')
        this.rotation = new Expression(raw?.rotation, 'new Euler(0, 0, 0)')
        this.scale = new Expression(raw?.scale, 'new Vector3(1, 1, 1)')
        this.visible = new Expression(raw?.visible, 'true')
    }

    public encode() {
        return {
            type: 'model.glb',
            url: this.url.encode(),
            position: this.position.encode(),
            rotation: this.rotation.encode(),
            scale: this.scale.encode(),
            visible: this.visible.encode(),
        }
    }
}

export class PointLightConfiguration {
    public position: Expression
    public intensity: Expression
    public color: Expression
    public visible: Expression

    constructor(raw: any) {
        this.position = new Expression(raw?.position, 'new Vector3(0, 0, 0)')
        this.intensity = new Expression(raw?.intensity, '"1000"')
        this.color = new Expression(raw?.color, 'new Color("#ffffff")')
        this.visible = new Expression(raw?.visible, 'true')
    }

    public encode() {
        return {
            type: 'light.point',
            position: this.position.encode(),
            intensity: this.intensity.encode(),
            color: this.color.encode(),
            visible: this.visible.encode(),
        }
    }
}

export class AmbientLightConfiguration {
    public intensity: Expression
    public color: Expression
    public visible: Expression

    constructor(raw: any) {
        this.intensity = new Expression(raw?.intensity, '"10"')
        this.color = new Expression(raw?.color, 'new Color("#ffffff")')
        this.visible = new Expression(raw?.visible, 'true')
    }

    public encode() {
        return {
            type: 'light.ambient',
            intensity: this.intensity.encode(),
            color: this.color.encode(),
            visible: this.visible.encode(),
        }
    }
}
