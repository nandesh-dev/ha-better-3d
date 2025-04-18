import {
    CommonPositionConfiguration,
    CommonRotationConfiguration,
    CommonScaleConfiguration,
    ExpressionConfiguration,
    HTMLSizeConfiguration,
} from './common'

export type ObjectConfiguration = CardConfiguration | GLBModelConfiguration | PointLightConfiguration

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

export class CardConfiguration {
    public config: CardConfigConfiguration
    public size: HTMLSizeConfiguration
    public position: CommonPositionConfiguration
    public rotation: CommonRotationConfiguration
    public scale: CommonScaleConfiguration
    public visible: ExpressionConfiguration

    constructor(raw: any) {
        this.config = new CardConfigConfiguration(raw?.config)
        this.size = new HTMLSizeConfiguration(raw?.size)
        this.position = new CommonPositionConfiguration(raw?.position)
        this.rotation = new CommonPositionConfiguration(raw?.rotation)
        this.scale = new CommonPositionConfiguration(raw?.scale)
        this.visible = new ExpressionConfiguration(raw?.visible, 'true')
    }

    public encode() {
        return {
            type: 'card',
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
    public url: ExpressionConfiguration
    public position: CommonPositionConfiguration
    public rotation: CommonRotationConfiguration
    public scale: CommonScaleConfiguration
    public visible: ExpressionConfiguration

    constructor(raw: any) {
        this.url = new ExpressionConfiguration(raw?.url, '')
        this.position = new CommonPositionConfiguration(raw?.position)
        this.rotation = new CommonPositionConfiguration(raw?.rotation)
        this.scale = new CommonPositionConfiguration(raw?.scale)
        this.visible = new ExpressionConfiguration(raw?.visible, 'true')
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
    public position: CommonPositionConfiguration
    public intensity: ExpressionConfiguration
    public color: ExpressionConfiguration
    public visible: ExpressionConfiguration

    constructor(raw: any) {
        this.position = new CommonPositionConfiguration(raw?.position)
        this.intensity = new ExpressionConfiguration(raw?.intensity, '"10"')
        this.color = new ExpressionConfiguration(raw?.color, 'Color.fromHEX("#FFFFFF")')
        this.visible = new ExpressionConfiguration(raw?.visible, 'true')
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
