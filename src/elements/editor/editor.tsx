import { Configuration, SceneConfiguration, decodeConfiguration, encodeConfiguration } from '@/configuration'
import { useEffect, useState } from 'preact/hooks'

import { ObjectConfiguration } from '@/configuration/objects'

import { HomeAssistant } from '@/utility/home_assistant/types'

import { CameraIcon } from './components/camera_icon'
import { ParkIcon } from './components/park_icon'
import { SettingIcon } from './components/setting_icon'
import { StyleIcon } from './components/style_icon'
import { GeneralEditor } from './general_editor'
import { ObjectEditor } from './object_editor'
import { SceneEditor } from './scene_editor'
import StyleSheet from './style.css?raw'
import { StyleEditor } from './style_editor'

const CONFIGURATION_UPDATE_DELAY = 500

export type EditorParameters = {
    homeAssistant: HomeAssistant
    rawConfiguration: unknown
    updateRawConfiguration: (updatedRawConfiguration: unknown) => void
}

export function Editor(parameters: EditorParameters) {
    const [configuration, setConfiguration] = useState(() => decodeConfiguration(parameters.rawConfiguration))
    const [activeEditor, setActiveEditor] = useState<'general' | 'style' | 'scene' | 'object'>('general')
    const [activeScene, setActiveScene] = useState<string | null>(null)
    const [activeObject, setActiveObject] = useState<string | null>(null)

    const switchToGeneralEditor = () => {
        setActiveEditor('general')
        setActiveScene(null)
        setActiveObject(null)
    }

    const switchToStyleEditor = () => {
        setActiveEditor('style')
        setActiveScene(null)
        setActiveObject(null)
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            parameters.updateRawConfiguration(encodeConfiguration(configuration))
        }, CONFIGURATION_UPDATE_DELAY)

        return () => clearTimeout(timeout)
    }, [configuration])

    const updateConfiguration = (newConfiguration: Configuration) => {
        setConfiguration({ ...newConfiguration })
    }

    const updateSceneConfiguration = (newSceneConfiguration: SceneConfiguration) => {
        if (!activeScene) return

        setConfiguration({
            ...configuration,
            scenes: { ...configuration.scenes, [activeScene]: newSceneConfiguration },
        })
    }

    const updateSceneName = (newSceneName: string) => {
        if (!activeScene) return

        const newConfiguration = { ...configuration }
        newConfiguration.scenes[newSceneName] = newConfiguration.scenes[activeScene]
        delete newConfiguration.scenes[activeScene]
        setConfiguration(newConfiguration)
    }

    const deleteScene = () => {
        if (!activeScene) return

        const newConfiguration = { ...configuration }
        delete newConfiguration.scenes[activeScene]
        setConfiguration(newConfiguration)
    }

    const updateObjectConfiguration = (newObjectConfiguration: ObjectConfiguration) => {
        if (!activeScene || !activeObject) return

        setConfiguration({
            ...configuration,
            scenes: {
                ...configuration.scenes,
                [activeScene]: {
                    ...configuration.scenes[activeScene],
                    objects: { ...configuration.scenes[activeScene].objects, [activeObject]: newObjectConfiguration },
                },
            },
        })
    }

    const updateObjectName = (newObjectName: string) => {
        if (!activeScene || !activeObject) return

        const newScene = { ...configuration.scenes[activeScene] }
        newScene.objects[newObjectName] = newScene.objects[activeObject]
        delete newScene.objects[activeObject]
        setConfiguration({ ...configuration, scenes: { ...configuration.scenes, [activeScene]: newScene } })
    }

    const deleteObject = () => {
        if (!activeScene || !activeObject) return

        const newScene = { ...configuration.scenes[activeScene] }
        delete newScene.objects[activeObject]
        setConfiguration({ ...configuration, scenes: { ...configuration.scenes, [activeScene]: newScene } })
    }

    return (
        <div class="editor">
            <style>{StyleSheet}</style>
            <div class="panel sidebar">
                <div class="panel__section">
                    <span class="panel__label">GENERAL</span>
                    <SidebarItem
                        type="setting"
                        name="Settings"
                        onClick={switchToGeneralEditor}
                        selected={activeEditor === 'general'}
                    />
                    <SidebarItem
                        type="style"
                        name="Style"
                        onClick={switchToStyleEditor}
                        selected={activeEditor === 'style'}
                    />
                </div>
                <div class="panel__section">
                    <span class="panel__label">SCENES</span>
                    {Object.keys(configuration.scenes).map((name) => {
                        const switchToSceneEditor = () => {
                            setActiveEditor('scene')
                            setActiveScene(name)
                            setActiveObject(null)
                        }
                        return (
                            <SidebarItem
                                type="scene"
                                name={name}
                                onClick={switchToSceneEditor}
                                selected={name === activeScene}
                            />
                        )
                    })}
                </div>
                {activeScene && (
                    <div class="panel__section">
                        <span class="panel__label">OBJECTS</span>
                        {activeScene &&
                            configuration.scenes[activeScene] &&
                            Object.keys(configuration.scenes[activeScene].objects).map((name) => {
                                const switchToObjectEditor = () => {
                                    setActiveEditor('object')
                                    setActiveObject(name)
                                }
                                return (
                                    <SidebarItem
                                        type="camera"
                                        name={name}
                                        onClick={switchToObjectEditor}
                                        selected={name === activeObject}
                                    />
                                )
                            })}
                    </div>
                )}
            </div>
            {activeEditor === 'general' && (
                <GeneralEditor configuration={configuration} onConfigurationChange={updateConfiguration} />
            )}
            {activeEditor === 'style' && (
                <StyleEditor configuration={configuration} onConfigurationChange={updateConfiguration} />
            )}
            {activeEditor === 'scene' && activeScene && configuration.scenes[activeScene] && (
                <SceneEditor
                    key={activeScene}
                    sceneName={activeScene}
                    sceneConfiguration={configuration.scenes[activeScene]}
                    onSceneConfigurationChange={updateSceneConfiguration}
                    onSceneNameChange={updateSceneName}
                    onSceneDelete={deleteScene}
                />
            )}
            {activeEditor === 'object' &&
                activeScene &&
                activeObject &&
                configuration.scenes[activeScene]?.objects[activeObject] && (
                    <ObjectEditor
                        key={activeObject}
                        objectName={activeObject}
                        objectConfiguration={configuration.scenes[activeScene].objects[activeObject]}
                        onObjectConfigurationChange={updateObjectConfiguration}
                        onObjectNameChange={updateObjectName}
                        onObjectDelete={deleteObject}
                    />
                )}
        </div>
    )
}

type SidebarItemParameters = {
    type: 'setting' | 'style' | 'camera' | 'scene'
    name: string
    selected?: boolean
    onClick: () => void
}

function SidebarItem(parameters: SidebarItemParameters) {
    let Icon
    switch (parameters.type) {
        case 'setting':
            Icon = SettingIcon
            break
        case 'style':
            Icon = StyleIcon

            break
        case 'camera':
            Icon = CameraIcon
            break
        case 'scene':
            Icon = ParkIcon
    }
    return (
        <a
            class={`sidebar__section__item ${parameters.selected && 'sidebar__section__item--selected'}`}
            onClick={parameters.onClick}
        >
            <Icon selected={parameters.selected} />
            <span
                class={`sidebar__section__item__name ${parameters.selected && 'sidebar__section__item__name--selected'}`}
            >
                {parameters.name}
            </span>
        </a>
    )
}
