import { Expression } from './expression'

export type CameraConfiguration = PerspectiveOrbitalCameraConfiguration

export class PerspectiveOrbitalCameraConfiguration {
    public fov: Expression
    public near: Expression
    public far: Expression
    public position: Expression
    public lookAt: Expression

    constructor(raw: any) {
        this.fov = new Expression(raw?.fov, '50')
        this.near = new Expression(raw?.near, '0.1')
        this.far = new Expression(raw?.far, '1000')
        this.position = new Expression(raw?.position, 'new Vector3(100, 20, 300)')
        this.lookAt = new Expression(raw?.look_at, 'new Vector3(0, 0, 0)')
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
