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
}

export class CardConfiguration {
    public config: CardConfigConfiguration
    public size: { height: ExpressionConfiguration; width: ExpressionConfiguration }
    public position: CommonPositionConfiguration
    public rotation: CommonRotationConfiguration
    public scale: CommonScaleConfiguration

    constructor(raw: any) {
        this.config = new CardConfigConfiguration(raw?.config)
        this.size = new HTMLSizeConfiguration(raw?.size)
        this.position = new CommonPositionConfiguration(raw?.position)
        this.rotation = new CommonPositionConfiguration(raw?.rotation)
        this.scale = new CommonPositionConfiguration(raw?.scale)
    }
}

export class GLBModelConfiguration {
    public url: ExpressionConfiguration
    public position: CommonPositionConfiguration
    public rotation: CommonRotationConfiguration
    public scale: CommonScaleConfiguration

    constructor(raw: any) {
        this.url = new ExpressionConfiguration(raw?.url, '')
        this.position = new CommonPositionConfiguration(raw?.position)
        this.rotation = new CommonPositionConfiguration(raw?.rotation)
        this.scale = new CommonPositionConfiguration(raw?.scale)
    }
}

export class PointLightConfiguration {
    public position: CommonPositionConfiguration
    public intensity: ExpressionConfiguration
    public color: ExpressionConfiguration

    constructor(raw: any) {
        this.position = new CommonPositionConfiguration(raw?.position)
        this.intensity = new ExpressionConfiguration(raw?.intensity, '"10"')
        this.color = new ExpressionConfiguration(raw?.color, 'Color.fromHEX("#FFFFFF")')
    }
}
