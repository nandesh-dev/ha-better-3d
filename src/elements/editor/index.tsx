import { Configuration, SceneConfiguration } from '@/configuration'
import { useEffect, useState } from 'preact/hooks'

import { CameraConfiguration, PerspectiveOrbitalCameraConfiguration } from '@/configuration/cameras'
import {
    AmbientLightConfiguration,
    Card2DConfiguration,
    Card3DConfiguration,
    GLBModelConfiguration,
    ObjectConfiguration,
    PointLightConfiguration,
} from '@/configuration/objects'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

import { CameraIcon } from './components/camera_icon'
import { CardConfigEditor } from './components/card_config_editor'
import { CardIcon } from './components/card_icon'
import {
    EntityBoolPattern,
    EntityBrightnessPattern,
    EntityRGBColorPattern,
    EulerPattern,
    Expression,
    FixedBoolPattern,
    FixedColorPattern,
    FixedNumberPattern,
    FixedStringPattern,
    HTMLSizePattern,
    Vector3Pattern,
} from './components/expression'
import { Input } from './components/input'
import { LightIcon } from './components/light_icon'
import { ModelIcon } from './components/model_icon'
import { Select } from './components/select'
import Style from './style.css?raw'

export const EDITOR_CUSTOM_ELEMENT_TAGNAME = 'better-3d-editor'

export function Editor({ config: rawConfiguration, setConfig }: ComponentProps) {
    if (!rawConfiguration) return

    const [configuration, setConfiguration] = useState<Configuration | null>(null)
    const [selectedSceneName, setSelectedSceneName] = useState<string | null>(null)
    const [selectedSceneChildrenName, setSelectedSceneChildrenName] = useState<string | null>(null)
    const [selectedSceneChildrenType, setSelectedSceneChildrenType] = useState<'object' | 'camera' | null>(null)

    useEffect(() => {
        if (!configuration) return
        const timeout = setTimeout(() => {
            setConfig(configuration.encode())
        }, 50)

        return () => clearTimeout(timeout)
    }, [configuration])

    useEffect(() => {
        if (configuration || !rawConfiguration) return

        const newConfiguration = new Configuration(rawConfiguration)
        setConfiguration(newConfiguration)
        setSelectedSceneName(Object.keys(newConfiguration.scenes)[0] || null)
    }, [rawConfiguration])

    if (!configuration) return

    const updateConfiguration = () => {
        setConfiguration(new Configuration(configuration.encode()))
    }

    const updateSelectedSceneChildrenName = (newName: string) => {
        if (selectedSceneName == null || selectedSceneChildrenType == null || selectedSceneChildrenName == null) return

        if (selectedSceneChildrenType == 'object') {
            while (configuration.scenes[selectedSceneName].objects[newName]) {
                newName = '_' + newName
            }
            configuration.scenes[selectedSceneName].objects[newName] =
                configuration.scenes[selectedSceneName].objects[selectedSceneChildrenName]
            delete configuration.scenes[selectedSceneName].objects[selectedSceneChildrenName]
        } else if (selectedSceneChildrenType == 'camera') {
            while (configuration.scenes[selectedSceneName].cameras[newName]) {
                newName = '_' + newName
            }
            configuration.scenes[selectedSceneName].cameras[newName] =
                configuration.scenes[selectedSceneName].cameras[selectedSceneChildrenName]
            delete configuration.scenes[selectedSceneName].cameras[selectedSceneChildrenName]
        }

        updateConfiguration()
        setSelectedSceneChildrenName(newName)
    }

    const updateSelectedSceneName = (newName: string) => {
        if (selectedSceneName == null) return

        configuration.scenes[newName] = configuration.scenes[selectedSceneName]
        delete configuration.scenes[selectedSceneName]
        updateConfiguration()
        setSelectedSceneName(newName)
    }

    return (
        <>
            <style>{Style}</style>
            <div class="editor">
                <GeneralSettings configuration={configuration} onChange={updateConfiguration} />
                <Sidebar
                    scenes={configuration.scenes}
                    onSelectedSceneNameChange={setSelectedSceneName}
                    onSelectedSceneChildrenNameChange={setSelectedSceneChildrenName}
                    onSelectedSceneChildrenTypeChange={setSelectedSceneChildrenType}
                    onChange={updateConfiguration}
                />
                <SelectedPanelSetting
                    selectedSceneName={selectedSceneName}
                    selectedSceneChildrenName={selectedSceneChildrenName}
                    selectedSceneChildrenType={selectedSceneChildrenType}
                    configuration={configuration}
                    onChange={updateConfiguration}
                    updateSelectedSceneName={updateSelectedSceneName}
                    updateSelectedSceneChildrenName={updateSelectedSceneChildrenName}
                />
            </div>
        </>
    )
}

export function registerEditor() {
    registerElement(EDITOR_CUSTOM_ELEMENT_TAGNAME, Editor)
}

type SelectedPanelSettingProperties = {
    selectedSceneName: string | null
    selectedSceneChildrenName: string | null
    selectedSceneChildrenType: 'camera' | 'object' | null
    configuration: Configuration
    onChange: () => void
    updateSelectedSceneName: (newName: string) => void
    updateSelectedSceneChildrenName: (newName: string) => void
}

function SelectedPanelSetting({
    selectedSceneName,
    selectedSceneChildrenName,
    selectedSceneChildrenType,
    configuration,
    onChange,
    updateSelectedSceneName,
    updateSelectedSceneChildrenName,
}: SelectedPanelSettingProperties) {
    if (selectedSceneName !== null) {
        const selectedScene = configuration.scenes[selectedSceneName]
        if (selectedScene) {
            if (selectedSceneChildrenName !== null) {
                if (selectedSceneChildrenType == 'object' && selectedScene.objects[selectedSceneChildrenName]) {
                    const changeObjectType = (type: string) => {
                        const rawObjectConfiguration = selectedScene.objects[selectedSceneChildrenName].encode()
                        switch (type) {
                            case 'card.2d':
                                selectedScene.objects[selectedSceneChildrenName] = new Card2DConfiguration(
                                    rawObjectConfiguration
                                )
                                break
                            case 'card.3d':
                                selectedScene.objects[selectedSceneChildrenName] = new Card3DConfiguration(
                                    rawObjectConfiguration
                                )
                                break
                            case 'model.glb':
                                selectedScene.objects[selectedSceneChildrenName] = new GLBModelConfiguration(
                                    rawObjectConfiguration
                                )
                                break
                            case 'light.point':
                                selectedScene.objects[selectedSceneChildrenName] = new PointLightConfiguration(
                                    rawObjectConfiguration
                                )
                                break
                            case 'light.ambient':
                                selectedScene.objects[selectedSceneChildrenName] = new AmbientLightConfiguration(
                                    rawObjectConfiguration
                                )
                                break
                        }

                        onChange()
                    }

                    return (
                        <ObjectSettings
                            key={selectedSceneChildrenName}
                            configuration={selectedScene.objects[selectedSceneChildrenName]}
                            onChange={onChange}
                            changeType={changeObjectType}
                            name={selectedSceneChildrenName}
                            updateName={updateSelectedSceneChildrenName}
                        />
                    )
                }

                if (selectedSceneChildrenType == 'camera' && selectedScene.cameras[selectedSceneChildrenName]) {
                    return (
                        <CameraSettings
                            key={selectedSceneChildrenName}
                            configuration={selectedScene.cameras[selectedSceneChildrenName]}
                            onChange={onChange}
                            name={selectedSceneChildrenName}
                            updateName={updateSelectedSceneChildrenName}
                        />
                    )
                }
            }

            return (
                <SceneSettings
                    key={selectedSceneName}
                    configuration={configuration.scenes[selectedSceneName]}
                    name={selectedSceneName}
                    updateName={updateSelectedSceneName}
                    onChange={onChange}
                />
            )
        }
    }

    return <div class="panel" />
}

type GeneralSettingsProperties = {
    configuration: Configuration
    onChange: () => void
}

function GeneralSettings({ configuration, onChange }: GeneralSettingsProperties) {
    return (
        <div class="panel general">
            <span class="panel-name">General</span>
            <div class="general-inner">
                <Expression
                    label="Active Scene"
                    configuration={configuration.activeScene}
                    onChange={onChange}
                    patterns={{ Fixed: FixedStringPattern }}
                />
            </div>
        </div>
    )
}

type SidebarProperties = {
    scenes: Configuration['scenes']
    onSelectedSceneNameChange: (name: string) => void
    onSelectedSceneChildrenNameChange: (name: string | null) => void
    onSelectedSceneChildrenTypeChange: (name: 'object' | 'camera' | null) => void
    onChange: () => void
}

function Sidebar({
    scenes,
    onSelectedSceneNameChange,
    onSelectedSceneChildrenNameChange,
    onSelectedSceneChildrenTypeChange,
    onChange,
}: SidebarProperties) {
    const onSceneClick = (name: string) => {
        onSelectedSceneNameChange(name)
        onSelectedSceneChildrenNameChange(null)
        onSelectedSceneChildrenTypeChange(null)
    }

    const onCameraClick = (name: string) => {
        onSelectedSceneChildrenNameChange(name)
        onSelectedSceneChildrenTypeChange('camera')
    }

    const onObjectClick = (name: string) => {
        onSelectedSceneChildrenNameChange(name)
        onSelectedSceneChildrenTypeChange('object')
    }

    const addScene = () => {
        if (!scenes['untitled']) {
            scenes['untitled'] = new SceneConfiguration({})
        } else {
            let count = 2
            while (scenes[`untitled_${count}`]) {
                count++
            }

            scenes[`untitled_${count}`] = new SceneConfiguration({})
        }

        onChange()
    }

    let isEvenItem = true
    return (
        <div class="panel sidebar">
            <span class="panel-name">Scenes</span>
            {Object.keys(scenes).map((sceneName) => {
                const scene = scenes[sceneName]
                isEvenItem = !isEvenItem
                return (
                    <div style="display: flex; flex-direction: column;">
                        <button
                            class={`sidebar-scene-name ${isEvenItem ? 'sidebar-scene-name__even' : 'sidebar-scene-name__odd'}`}
                            onClick={() => onSceneClick(sceneName)}
                        >
                            {sceneName}
                        </button>
                        {Object.keys(scene.cameras).map((cameraName) => {
                            isEvenItem = !isEvenItem
                            return (
                                <div
                                    class={`sidebar-scene-item ${isEvenItem ? 'sidebar-scene-item__even' : 'sidebar-scene-item__odd'}`}
                                >
                                    <button class="sidebar-scene-item-name" onClick={() => onCameraClick(cameraName)}>
                                        {cameraName}
                                    </button>
                                    <CameraIcon />
                                </div>
                            )
                        })}
                        {Object.keys(scene.objects).map((objectName) => {
                            const object = scene.objects[objectName]
                            isEvenItem = !isEvenItem
                            let Icon = () => <div />
                            if (
                                object instanceof PointLightConfiguration ||
                                object instanceof AmbientLightConfiguration
                            ) {
                                Icon = LightIcon
                            } else if (object instanceof GLBModelConfiguration) {
                                Icon = ModelIcon
                            } else if (object instanceof Card2DConfiguration || object instanceof Card3DConfiguration) {
                                Icon = CardIcon
                            }

                            return (
                                <div
                                    class={`sidebar-scene-item ${isEvenItem ? 'sidebar-scene-item__even' : 'sidebar-scene-item__odd'}`}
                                >
                                    <button class="sidebar-scene-item-name" onClick={() => onObjectClick(objectName)}>
                                        {objectName}
                                    </button>
                                    <Icon />
                                </div>
                            )
                        })}
                    </div>
                )
            })}
            <button class="add-button" onClick={addScene}>
                Add Scene
            </button>
        </div>
    )
}

type SceneSettingsProperties = {
    configuration: SceneConfiguration
    name: string
    updateName: (newName: string) => void
    onChange: () => void
}

function SceneSettings({ configuration, onChange, name, updateName }: SceneSettingsProperties) {
    const addCamera = () => {
        if (!configuration.cameras['untitled']) {
            configuration.cameras['untitled'] = new PerspectiveOrbitalCameraConfiguration({})
        } else {
            let count = 2
            while (configuration.cameras[`untitled_${count}`]) {
                count++
            }

            configuration.cameras[`untitled_${count}`] = new PerspectiveOrbitalCameraConfiguration({})
        }

        onChange()
    }

    const addObject = () => {
        if (!configuration.objects['untitled']) {
            configuration.objects['untitled'] = new GLBModelConfiguration({})
        } else {
            let count = 2
            while (configuration.objects[`untitled_${count}`]) {
                count++
            }

            configuration.objects[`untitled_${count}`] = new GLBModelConfiguration({})
        }

        onChange()
    }

    return (
        <div class="panel scene">
            <span class="panel-name">Scene Settings</span>
            <div class="scene-inner">
                <Input label="Name" value={name} setValue={updateName} />
                <Expression
                    label="Active Camera"
                    configuration={configuration.activeCamera}
                    onChange={onChange}
                    patterns={{ Fixed: FixedStringPattern }}
                />
                <Expression
                    label="Background Color"
                    configuration={configuration.backgroundColor}
                    onChange={onChange}
                    patterns={{ Fixed: FixedColorPattern, 'Entity RGB': EntityRGBColorPattern }}
                />
            </div>
            <div class="add-buttons-outer">
                <button class="add-button" onClick={addCamera}>
                    Add Camera
                </button>
                <button class="add-button" onClick={addObject}>
                    Add Object
                </button>
            </div>
        </div>
    )
}

type ObjectSettingsProperties = {
    configuration: ObjectConfiguration
    changeType: (type: string) => void
    onChange: () => void
    name: string
    updateName: (newName: string) => void
}

function ObjectSettings({ configuration, name, updateName, onChange, changeType }: ObjectSettingsProperties) {
    let objectType = ''
    if (configuration instanceof Card2DConfiguration) {
        objectType = 'card.2d'
    } else if (configuration instanceof Card3DConfiguration) {
        objectType = 'card.3d'
    } else if (configuration instanceof GLBModelConfiguration) {
        objectType = 'model.glb'
    } else if (configuration instanceof PointLightConfiguration) {
        objectType = 'light.point'
    } else if (configuration instanceof AmbientLightConfiguration) {
        objectType = 'light.ambient'
    }

    return (
        <div class="panel object">
            <span class="panel-name">Object Settings</span>
            <div class="object-inner">
                <Input label="Name" value={name} setValue={updateName} />
                <Select
                    label="Type"
                    selected={objectType}
                    options={['card.2d', 'card.3d', 'model.glb', 'light.point', 'light.ambient']}
                    setSelected={changeType}
                />
                {(configuration instanceof Card3DConfiguration || configuration instanceof Card2DConfiguration) && (
                    <>
                        <CardConfigEditor label="Config" configuration={configuration.config} onChange={onChange} />
                        <Expression
                            label="Size"
                            configuration={configuration.size}
                            onChange={onChange}
                            patterns={{ Fixed: HTMLSizePattern }}
                        />
                        <Expression
                            label="Position"
                            configuration={configuration.position}
                            onChange={onChange}
                            patterns={{ Fixed: Vector3Pattern }}
                        />
                        <Expression
                            label="Rotation"
                            configuration={configuration.rotation}
                            onChange={onChange}
                            patterns={{ Fixed: EulerPattern }}
                        />
                        <Expression
                            label="Scale"
                            configuration={configuration.scale}
                            onChange={onChange}
                            patterns={{ Fixed: Vector3Pattern }}
                        />
                        <Expression
                            label="Visible"
                            configuration={configuration.visible}
                            onChange={onChange}
                            patterns={{ Fixed: FixedBoolPattern, 'Entity State': EntityBoolPattern }}
                        />
                    </>
                )}
                {configuration instanceof GLBModelConfiguration && (
                    <>
                        <Expression
                            label="URL"
                            configuration={configuration.url}
                            onChange={onChange}
                            patterns={{ Fixed: FixedStringPattern }}
                        />
                        <Expression
                            label="Position"
                            configuration={configuration.position}
                            onChange={onChange}
                            patterns={{ Fixed: Vector3Pattern }}
                        />
                        <Expression
                            label="Rotation"
                            configuration={configuration.rotation}
                            onChange={onChange}
                            patterns={{ Fixed: EulerPattern }}
                        />
                        <Expression
                            label="Scale"
                            configuration={configuration.scale}
                            onChange={onChange}
                            patterns={{ Fixed: Vector3Pattern }}
                        />
                        <Expression
                            label="Visible"
                            configuration={configuration.visible}
                            onChange={onChange}
                            patterns={{ Fixed: FixedBoolPattern, 'Entity State': EntityBoolPattern }}
                        />
                    </>
                )}
                {configuration instanceof PointLightConfiguration && (
                    <>
                        <Expression
                            label="Color"
                            configuration={configuration.color}
                            onChange={onChange}
                            patterns={{ Fixed: FixedColorPattern, 'Entity RGB': EntityRGBColorPattern }}
                        />
                        <Expression
                            label="Intensity"
                            configuration={configuration.intensity}
                            onChange={onChange}
                            patterns={{ Fixed: FixedNumberPattern, 'Entity Brightness': EntityBrightnessPattern }}
                        />
                        <Expression
                            label="Position"
                            configuration={configuration.position}
                            onChange={onChange}
                            patterns={{ Fixed: Vector3Pattern }}
                        />
                        <Expression
                            label="Visible"
                            configuration={configuration.visible}
                            onChange={onChange}
                            patterns={{ Fixed: FixedBoolPattern, 'Entity State': EntityBoolPattern }}
                        />
                    </>
                )}
                {configuration instanceof AmbientLightConfiguration && (
                    <>
                        <Expression
                            label="Color"
                            configuration={configuration.color}
                            onChange={onChange}
                            patterns={{ Fixed: FixedColorPattern, 'Entity RGB': EntityRGBColorPattern }}
                        />
                        <Expression
                            label="Intensity"
                            configuration={configuration.intensity}
                            onChange={onChange}
                            patterns={{ Fixed: FixedNumberPattern, 'Entity Brightness': EntityBrightnessPattern }}
                        />
                        <Expression
                            label="Visible"
                            configuration={configuration.visible}
                            onChange={onChange}
                            patterns={{ Fixed: FixedBoolPattern, 'Entity State': EntityBoolPattern }}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

type CameraSettingsProperties = {
    configuration: CameraConfiguration
    onChange: () => void
    name: string
    updateName: (newName: string) => void
}

function CameraSettings({ configuration, name, onChange, updateName }: CameraSettingsProperties) {
    return (
        <div class="panel camera">
            <span class="panel-name">Camera Settings</span>
            <div class="camera-inner">
                <Input label="Name" value={name} setValue={updateName} />
                <Expression
                    label="FOV"
                    configuration={configuration.fov}
                    onChange={onChange}
                    patterns={{ Fixed: FixedNumberPattern }}
                />
                <Expression
                    label="Near Point"
                    configuration={configuration.near}
                    onChange={onChange}
                    patterns={{ Fixed: FixedNumberPattern }}
                />
                <Expression
                    label="Far Point"
                    configuration={configuration.far}
                    onChange={onChange}
                    patterns={{ Fixed: FixedNumberPattern }}
                />
                <Expression
                    label="Position"
                    configuration={configuration.position}
                    onChange={onChange}
                    patterns={{ Fixed: Vector3Pattern }}
                />
                <Expression
                    label="Look At"
                    configuration={configuration.lookAt}
                    onChange={onChange}
                    patterns={{ Fixed: Vector3Pattern }}
                />
            </div>
        </div>
    )
}
