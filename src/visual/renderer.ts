import { Camera, Scene, WebGLRenderer } from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/Addons.js'

export class Renderer {
    private webGL: WebGLRenderer
    private css3D: CSS3DRenderer
    public domElement: HTMLDivElement
    private webGLWrapperElement: HTMLDivElement
    private css3DWrapperElement: HTMLDivElement

    constructor() {
        this.webGL = new WebGLRenderer({ antialias: true })
        this.css3D = new CSS3DRenderer()

        const styles: Record<string, Partial<CSSStyleDeclaration>> = {
            container: {
                position: 'relative',
            },
            webGLWrapper: {
                position: 'absolute',
                overflow: 'hidden',
            },
            css3DWrapper: {
                position: 'absolute',
                overflow: 'hidden',
            },
        }

        this.domElement = document.createElement('div')
        Object.assign(this.domElement.style, styles.container)

        this.webGLWrapperElement = document.createElement('div')
        Object.assign(this.webGLWrapperElement.style, styles.webGLWrapper)
        this.domElement.append(this.webGLWrapperElement)
        this.webGLWrapperElement.append(this.webGL.domElement)

        this.css3DWrapperElement = document.createElement('div')
        Object.assign(this.css3DWrapperElement.style, styles.css3DWrapper)
        this.domElement.append(this.css3DWrapperElement)
        this.css3DWrapperElement.append(this.css3D.domElement)
    }

    public setSize(height: number, width: number) {
        const style: Partial<CSSStyleDeclaration> = {
            height: height + 'px',
            width: width + 'px',
        }
        Object.assign(this.domElement.style, style)
        Object.assign(this.webGLWrapperElement.style, style)
        Object.assign(this.css3DWrapperElement.style, style)

        this.webGL.setSize(width, height)
        this.css3D.setSize(width, height)
    }

    public render(scene: Scene, camera: Camera) {
        this.webGL.render(scene, camera)
        this.css3D.render(scene, camera)
    }

    public dispose() {
        this.webGL.dispose()
        this.webGL.forceContextLoss()
    }
}
