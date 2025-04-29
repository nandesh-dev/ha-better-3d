import { Configuration, SceneConfiguration } from '@/configuration'
import { useEffect, useState } from 'preact/hooks'

import {
    AmbientLightConfiguration,
    Card2DConfiguration,
    Card3DConfiguration,
    GLBModelConfiguration,
    PointLightConfiguration,
} from '@/configuration/objects'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

import { CameraIcon } from './components/camera_icon'
import { CardIcon } from './components/card_icon'
import { Expression, FixedColorPattern, FixedStringPattern, RGBEntityColorPattern } from './components/expression'
import { LightIcon } from './components/light_icon'
import { ModelIcon } from './components/model_icon'
import Style from './style.css?raw'

export const EDITOR_CUSTOM_ELEMENT_TAGNAME = 'better-3d-editor'

export function Editor({ config: rawConfiguration }: ComponentProps) {
    if (!rawConfiguration) return

    const [configuration, setConfiguration] = useState<Configuration | null>(null)
    const [selectedPanelType, setSelectedPanelType] = useState<'scene' | 'camera' | 'object'>('scene')
    const [selectedPanelName, setSelectedPanelName] = useState<string | null>(null)

    useEffect(() => {
        if (configuration || !rawConfiguration) return

        const newConfiguration = new Configuration(rawConfiguration)
        setConfiguration(newConfiguration)
        setSelectedPanelName(Object.keys(newConfiguration.scenes)[0] || null)
    }, [rawConfiguration])

    if (!configuration) return

    const updateConfiguration = () => {
        setConfiguration(new Configuration(configuration.encode()))
    }

    return (
        <>
            <style>{Style}</style>
            <div class="editor">
                <GeneralSettings configuration={configuration} onChange={updateConfiguration} />
                <Sidebar scenes={configuration.scenes} />
                {selectedPanelName !== null ? (
                    selectedPanelType == 'scene' &&
                    (configuration.scenes[selectedPanelName] ? (
                        <SceneSettings
                            configuration={configuration.scenes[selectedPanelName]}
                            onChange={updateConfiguration}
                        />
                    ) : (
                        <div class="panel" />
                    ))
                ) : (
                    <div class="panel" />
                )}
            </div>
        </>
    )
}

export function registerEditor() {
    registerElement(EDITOR_CUSTOM_ELEMENT_TAGNAME, Editor)
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
}

function Sidebar({ scenes }: SidebarProperties) {
    let isEvenItem = true
    return (
        <div class="panel sidebar">
            <span class="panel-name">Scenes</span>
            {Object.keys(scenes).map((sceneName) => {
                const scene = scenes[sceneName]
                isEvenItem = !isEvenItem
                return (
                    <div style="display: flex; flex-direction: column;">
                        <span
                            class={`sidebar-scene-name ${isEvenItem ? 'sidebar-scene-name__even' : 'sidebar-scene-name__odd'}`}
                        >
                            {sceneName}
                        </span>
                        {Object.keys(scene.cameras).map((cameraName) => {
                            const camera = scene.cameras[cameraName]
                            isEvenItem = !isEvenItem
                            return (
                                <div
                                    class={`sidebar-scene-item ${isEvenItem ? 'sidebar-scene-item__even' : 'sidebar-scene-item__odd'}`}
                                >
                                    <span class="sidebar-scene-item-name">{cameraName}</span>
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
                                    <span class="sidebar-scene-item-name">{objectName}</span>
                                    <Icon />
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

type SceneSettingsProperties = {
    configuration: SceneConfiguration
    onChange: () => void
}

function SceneSettings({ configuration, onChange }: SceneSettingsProperties) {
    return (
        <div class="panel scene">
            <span class="panel-name">Scene Settings</span>
            <div class="scene-inner">
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
                    patterns={{ Fixed: FixedColorPattern, 'RGB Entity': RGBEntityColorPattern }}
                />
            </div>
        </div>
    )
}
