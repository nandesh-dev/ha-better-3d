import { Expression } from '@/utility/evaluater'

export type Vector3DefaultValue = {
    x: Expression
    y: Expression
    z: Expression
}

export class Vector3Configuration {
    public x: ExpressionConfiguration
    public y: ExpressionConfiguration
    public z: ExpressionConfiguration

    constructor(raw: any, defaultValue: Vector3DefaultValue) {
        this.x = new ExpressionConfiguration(raw?.x, defaultValue.x)
        this.y = new ExpressionConfiguration(raw?.y, defaultValue.y)
        this.z = new ExpressionConfiguration(raw?.z, defaultValue.z)
    }

    public encode() {
        return {
            x: this.x.encode(),
            y: this.y.encode(),
            z: this.z.encode(),
        }
    }
}

export class CommonPositionConfiguration extends Vector3Configuration {
    constructor(raw: any) {
        super(raw, { x: '0', y: '0', z: '0' })
    }
}

export class CommonRotationConfiguration extends Vector3Configuration {
    constructor(raw: any) {
        super(raw, { x: '0', y: '0', z: '0' })
    }
}

export class CommonScaleConfiguration extends Vector3Configuration {
    constructor(raw: any) {
        super(raw, { x: '1', y: '1', z: '1' })
    }
}

export class HTMLSizeConfiguration {
    public height: ExpressionConfiguration
    public width: ExpressionConfiguration

    constructor(raw: any) {
        this.height = new ExpressionConfiguration(raw?.height, '"200px"')
        this.width = new ExpressionConfiguration(raw?.width, '"400px"')
    }

    public encode() {
        return { height: this.height.encode(), width: this.width.encode() }
    }
}

export class ExpressionConfiguration {
    public value: Expression

    constructor(raw: any, defaultValue: Expression) {
        this.value = defaultValue
        if (typeof raw == 'string') this.value = raw
        if (typeof raw == 'number') this.value = raw.toString()
    }

    public encode() {
        return this.value
    }
}
