import { CommonPositionConfiguration, ExpressionConfiguration } from './common'

export type CameraConfiguration = PerspectiveOrbitalCameraConfiguration

export class PerspectiveOrbitalCameraConfiguration {
    public fov: ExpressionConfiguration
    public near: ExpressionConfiguration
    public far: ExpressionConfiguration
    public position: CommonPositionConfiguration
    public lookAt: CommonPositionConfiguration

    constructor(raw: any) {
        this.fov = new ExpressionConfiguration(raw?.fov, '50')
        this.near = new ExpressionConfiguration(raw?.near, '0.1')
        this.far = new ExpressionConfiguration(raw?.far, '1000')
        this.position = new CommonPositionConfiguration(raw?.position)
        this.lookAt = new CommonPositionConfiguration(raw?.loot_at)
    }

    public encode() {
        return {
            type: 'orbital.perspective',
            fov: this.fov.encode(),
            near: this.near.encode(),
            far: this.far.encode(),
            position: this.position.encode(),
            look_at: this.lookAt.encode(),
        }
    }
}
