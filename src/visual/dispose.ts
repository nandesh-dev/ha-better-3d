import { BufferGeometry, Material, Object3D, ShaderMaterial, Texture } from 'three'

// [ SOURCE ] https://discourse.threejs.org/t/three-js-dispose-things-so-hard/46664/10
export function dispose(object: Object3D | BufferGeometry | Material | Texture) {
    const dispose = (object: BufferGeometry | Material | Texture) => object.dispose()
    const disposeObject = (object: any) => {
        if (object.geometry) dispose(object.geometry)
        if (object.material) traverseMaterialsTextures(object.material, dispose, dispose)
    }

    if (object instanceof BufferGeometry || object instanceof Texture) return dispose(object)

    if (object instanceof Material) return traverseMaterialsTextures(object, dispose, dispose)

    disposeObject(object)

    if (object.traverse) object.traverse((obj) => disposeObject(obj))
}

function traverseMaterialsTextures(
    material: Material | Material[],
    materialCallback?: (material: any) => void,
    textureCallback?: (texture: any) => void
) {
    const traverseMaterial = (mat: Material) => {
        if (materialCallback) materialCallback(mat)

        if (!textureCallback) return

        Object.values(mat)
            .filter((value) => value instanceof Texture)
            .forEach((texture) => textureCallback(texture))

        if ((mat as ShaderMaterial).uniforms)
            Object.values((mat as ShaderMaterial).uniforms)
                .filter(({ value }) => value instanceof Texture)
                .forEach(({ value }) => textureCallback(value))
    }

    if (Array.isArray(material)) {
        material.forEach((mat) => traverseMaterial(mat))
    } else traverseMaterial(material)
}
