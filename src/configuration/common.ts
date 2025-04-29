import { Expression } from '@/utility/evaluater'

export type CommonSizeDefaultValue = {
    width: Expression
    height: Expression
}

export class CommonSizeConfiguration {
    public width: ExpressionConfiguration
    public height: ExpressionConfiguration

    constructor(raw: any, defaultValue: CommonSizeDefaultValue) {
        this.width = new ExpressionConfiguration(raw?.width, defaultValue.width)
        this.height = new ExpressionConfiguration(raw?.height, defaultValue.height)
    }

    public encode() {
        return {
            height: this.height.encode(),
            width: this.width.encode(),
        }
    }
}

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

export class HTMLSizeConfiguration extends CommonSizeConfiguration {
    constructor(raw: any) {
        super(raw, { height: '"auto"', width: '"auto"' })
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
