import { CameraProperties, ObjectProperties, SceneProperties } from '@/configuration/v1'
import { useState } from 'preact/hooks'

import { Dropdown } from '@/components/dropdown'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'

import { CameraEditor } from './camera_editor'
import { ObjectEditor } from './object_editor'

type SceneEditorProperties = {
    config: SceneProperties
    setConfig: (newConfig: SceneProperties) => void
    setError: (error: string) => void
}
export function SceneEditor({ config, setConfig, setError }: SceneEditorProperties) {
    const [selectedCamera, setSelectedCamera] = useState<string | null>(Object.keys(config.cameras)[0] || null)
    const [selectedObject, setSelectedObject] = useState<string | null>(Object.keys(config.objects)[0] || null)

    const setActiveCamera = (expression: string) => {
        setConfig({ ...config, active_camera: expression })
    }

    const addNewCamera = () => {
        if (Object.keys(config.cameras).indexOf('untitled') !== -1) {
            setError(
                "Camera with name 'untitled' already exists! Please name your scenes properly before creating new once"
            )
            return
        }
        setConfig({
            ...config,
            cameras: {
                ...config.cameras,
                untitled: {
                    type: 'orbital.perspective',
                    fov: '20',
                    far: '1000',
                    near: '0.1',
                    position: { x: '0', y: '0', z: '-5' },
                    look_at: { x: '0', y: '0', z: '0' },
                },
            },
        })
    }

    const renameCamera = (oldName: string, newName: string) => {
        let name = newName

        const cameras = { ...config.cameras }
        delete cameras[oldName]

        while (true) {
            if (Object.keys(config.cameras).indexOf(name) == -1) break
            setError(`Camera with name '${name}' already exists!`)
            name = '_' + name
        }

        cameras[name] = config.cameras[oldName]

        setConfig({
            ...config,
            cameras,
        })
        setSelectedCamera(name)
    }

    const deleteCamera = (name: string) => {
        const cameras = { ...config.cameras }
        delete cameras[name]

        setConfig({ ...config, cameras })

        if (name == selectedCamera) {
            let differentCamera = Object.keys(config.cameras)[0]
            if (differentCamera == name) {
                differentCamera = Object.keys(config.cameras)[-1]
            }

            setSelectedCamera(differentCamera)
        }
    }

    const addNewObject = () => {
        if (Object.keys(config.objects).indexOf('untitled') !== -1) {
            setError(
                "Object with name 'untitled' already exists! Please name your scenes properly before creating new once"
            )
            return
        }
        setConfig({
            ...config,
            objects: {
                ...config.objects,
                untitled: {
                    type: 'model.glb',
                    url: '""',
                    position: { x: '0', y: '0', z: '0' },
                    rotation: { x: 'Math.PI / 180 * 0', y: 'Math.PI / 180 * 0', z: 'Math.PI / 180 * 0' },
                    scale: { x: '1', y: '1', z: '1' },
                },
            },
        })
    }

    const renameObject = (oldName: string, newName: string) => {
        let name = newName

        const objects = { ...config.objects }
        delete objects[oldName]

        while (true) {
            if (Object.keys(config.objects).indexOf(name) == -1) break
            setError(`Object with name '${name}' already exists!`)
            name = '_' + name
        }

        objects[name] = config.objects[oldName]

        setConfig({
            ...config,
            objects,
        })
        setSelectedObject(name)
    }

    const deleteObject = (name: string) => {
        const objects = { ...config.objects }
        delete objects[name]

        setConfig({ ...config, objects })

        if (name == selectedObject) {
            let differentObject = Object.keys(config.objects)[0]
            if (differentObject == name) {
                differentObject = Object.keys(config.objects)[-1]
            }

            setSelectedObject(differentObject)
        }
    }

    const updateSelectedCameraConfig = (newCameraConfig: CameraProperties) => {
        if (!selectedCamera) return
        setConfig({ ...config, cameras: { ...config.cameras, [selectedCamera]: newCameraConfig } })
    }

    const updateSelectedObjectConfig = (newObjectConfig: ObjectProperties) => {
        if (!selectedObject) return
        setConfig({ ...config, objects: { ...config.objects, [selectedObject]: newObjectConfig } })
    }

    return (
        <>
            <Input value={config.active_camera} setValue={setActiveCamera} type="expression">
                Active Camera
            </Input>
            <Heading>Cameras</Heading>
            <Dropdown
                options={Object.keys(config.cameras)}
                selectedOption={selectedCamera}
                setSelectedOption={setSelectedCamera}
                addNewOption={addNewCamera}
                renameOption={renameCamera}
                deleteOption={deleteCamera}
            />
            {selectedCamera !== null && Object.keys(config.cameras).indexOf(selectedCamera) !== -1 && (
                <CameraEditor config={config.cameras[selectedCamera]} setConfig={updateSelectedCameraConfig} />
            )}
            <Heading>Object</Heading>
            <Dropdown
                options={Object.keys(config.objects)}
                selectedOption={selectedObject}
                setSelectedOption={setSelectedObject}
                addNewOption={addNewObject}
                renameOption={renameObject}
                deleteOption={deleteObject}
            />
            {selectedObject !== null && Object.keys(config.objects).indexOf(selectedObject) !== -1 && (
                <ObjectEditor config={config.objects[selectedObject]} setConfig={updateSelectedObjectConfig} />
            )}
        </>
    )
}
