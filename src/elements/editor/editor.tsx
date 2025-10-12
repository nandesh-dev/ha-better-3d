import { Configuration, SceneConfiguration, decodeConfiguration, encodeConfiguration } from '@/configuration'
import { Visual } from '@/visual'
import { useEffect, useState } from 'preact/hooks'

import { GroupConfiguration, ObjectConfiguration, ObjectConfigurationMap } from '@/configuration/objects'

import { HomeAssistant } from '@/utility/home_assistant/types'
import { getLastCreatedVisual } from '@/utility/hot_reload'

import { Button } from './components/button'
import { CameraIcon } from './components/camera_icon'
import { CardIcon } from './components/card_icon'
import { LightIcon } from './components/light_icon'
import { FlowerPotIcon } from './components/model_icon'
import { ParkIcon } from './components/park_icon'
import { PenIcon } from './components/pen_icon'
import { SettingIcon } from './components/setting_icon'
import { StyleIcon } from './components/style_icon'
import { EditorEditor } from './editor_editor'
import { GeneralEditor } from './general_editor'
import { ObjectEditor } from './object_editor'
import { SceneEditor } from './scene_editor'
import StyleSheet from './style.css?raw'
import { StyleEditor } from './style_editor'

const CONFIGURATION_UPDATE_DELAY = 500

function useVisual(): [Visual | null | undefined, () => void] {
    const [visual, setVisual] = useState<Visual | null | undefined>(null)

    useEffect(() => {
        if (!visual) {
            getLastCreatedVisual()
                .then(setVisual)
                .catch(() => {
                    setVisual(undefined)
                })
        }
    }, [visual])

    const refetchVisual = () => {
        setVisual(null)
    }

    return [visual, refetchVisual]
}

export type EditorParameters = {
    homeAssistant: HomeAssistant
    rawConfiguration: unknown
    updateRawConfiguration: (updatedRawConfiguration: unknown) => void
}

export function Editor(parameters: EditorParameters) {
    const [visual, refetchVisual] = useVisual()
    const [hotReloadEnabled, setHotReloadEnabled] = useState(true)
    const [configuration, setConfiguration] = useState(() => decodeConfiguration(parameters.rawConfiguration))
    const [activeEditor, setActiveEditor] = useState<'editor' | 'general' | 'style' | 'scene' | 'object'>('editor')
    const [activeScene, setActiveScene] = useState<string | null>(null)
    const [activeObject, setActiveObject] = useState<string | null>(null)

    useEffect(() => {
        if (hotReloadEnabled && visual) {
            visual.updateConfig(configuration)
            return
        }
        const timeout = setTimeout(() => {
            if (hotReloadEnabled) return
            forceSaveConfiguration()
        }, CONFIGURATION_UPDATE_DELAY)

        return () => clearTimeout(timeout)
    }, [configuration, hotReloadEnabled])

    const changeHotReload = (value: boolean) => {
        if (!visual) return
        setHotReloadEnabled(value)
    }

    const changeActiveEditor = (value: typeof activeEditor) => {
        setActiveEditor(value)
        setActiveScene(null)
        setActiveObject(null)
    }

    const selectScene = (value: string) => {
        setActiveEditor('scene')
        setActiveScene(value)
        setActiveObject(null)
    }

    const selectObject = (value: string) => {
        setActiveEditor('object')
        setActiveObject(value)
    }

    const forceSaveConfiguration = () => {
        parameters.updateRawConfiguration(encodeConfiguration(configuration))
        refetchVisual()
    }

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
        if (!activeScene || !activeObject || !configuration.scenes[activeScene]) return

        const parent = searchObjectParentConfiguration(activeObject, configuration.scenes[activeScene])
        const objectMap =
            (parent as GroupConfiguration).type === 'group'
                ? (parent as GroupConfiguration).children
                : (parent as SceneConfiguration).objects
        objectMap[activeObject] = newObjectConfiguration
        setConfiguration({ ...configuration })
    }

    const updateObjectName = (newObjectName: string) => {
        if (!activeScene || !activeObject || !configuration.scenes[activeScene]) return

        const parent = searchObjectParentConfiguration(activeObject, configuration.scenes[activeScene])
        const objectMap =
            (parent as GroupConfiguration).type === 'group'
                ? (parent as GroupConfiguration).children
                : (parent as SceneConfiguration).objects
        objectMap[newObjectName] = objectMap[activeObject]
        delete objectMap[activeObject]
        setConfiguration({ ...configuration })
    }

    const deleteObject = () => {
        if (!activeScene || !activeObject || !configuration.scenes[activeScene]) return

        const parent = searchObjectParentConfiguration(activeObject, configuration.scenes[activeScene])
        const objectMap =
            (parent as GroupConfiguration).type === 'group'
                ? (parent as GroupConfiguration).children
                : (parent as SceneConfiguration).objects
        delete objectMap[activeObject]
        setConfiguration({ ...configuration })
    }

    const objectConfiguration =
        activeScene && activeObject && configuration.scenes[activeScene]
            ? searchObjectConfiguration(activeObject, configuration.scenes[activeScene].objects)
            : null

    const objectNames =
        activeScene && configuration.scenes[activeScene]
            ? flattenObjectNames(configuration.scenes[activeScene].objects)
            : new Set<string>()

    const groupNames =
        activeScene && configuration.scenes[activeScene]
            ? flattenGroupNames(configuration.scenes[activeScene].objects)
            : new Set<string>()

    const parentType =
        !activeObject ||
        !activeScene ||
        !configuration.scenes[activeScene] ||
        (searchObjectParentConfiguration(activeObject, configuration.scenes[activeScene]) as GroupConfiguration | null)
            ?.type === 'group'
            ? 'group'
            : 'scene'
    const parentName =
        (activeObject &&
            activeScene &&
            searchObjectParentName(activeObject, activeScene, configuration.scenes[activeScene])) ||
        ''

    const changeObjectParent = (parentType: 'scene' | 'group', parentName: string) => {
        if (
            !activeObject ||
            !activeScene ||
            (parentType === 'scene' && !configuration.scenes[parentName]) ||
            !objectConfiguration
        )
            return
        const oldParent = searchObjectParentConfiguration(activeObject, configuration.scenes[activeScene])
        const oldParentObjectMap =
            (oldParent as GroupConfiguration).type === 'group'
                ? (oldParent as GroupConfiguration).children
                : (oldParent as SceneConfiguration).objects
        delete oldParentObjectMap[activeObject]

        const newParent =
            parentType === 'scene'
                ? configuration.scenes[parentName]
                : searchObjectConfiguration(parentName, configuration.scenes[activeScene].objects)
        if (!newParent) return
        const newParentObjectMap =
            (newParent as GroupConfiguration).type === 'group'
                ? (newParent as GroupConfiguration).children
                : (newParent as SceneConfiguration).objects
        newParentObjectMap[activeObject] = objectConfiguration
        setConfiguration({ ...configuration })
    }

    return (
        <div class="editor">
            <style>{StyleSheet}</style>
            <div class="panel sidebar">
                <SidebarEditorsSection activeEditor={activeEditor} onActiveEditorChange={changeActiveEditor} />
                <SidebarSceneListSection
                    scenes={Object.keys(configuration.scenes)}
                    activeScene={activeScene}
                    onSceneChange={selectScene}
                />
                {activeScene && configuration.scenes[activeScene] && (
                    <SidebarObjectListSection
                        objects={configuration.scenes[activeScene].objects}
                        activeObject={activeObject}
                        onObjectChange={selectObject}
                    />
                )}
                {hotReloadEnabled && (
                    <div class="panel__section">
                        <Button name="Save" onClick={forceSaveConfiguration} />
                    </div>
                )}
            </div>
            {activeEditor === 'editor' && (
                <EditorEditor visual={visual} hotReloadEnabled={hotReloadEnabled} onHotReloadChange={changeHotReload} />
            )}
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
                    existingObjectNames={objectNames}
                    onSceneConfigurationChange={updateSceneConfiguration}
                    onSceneNameChange={updateSceneName}
                    onSceneDelete={deleteScene}
                />
            )}
            {activeEditor === 'object' && activeObject && objectConfiguration && (
                <ObjectEditor
                    key={activeObject}
                    objectName={activeObject}
                    objectConfiguration={objectConfiguration}
                    existingObjectNames={objectNames}
                    parentType={parentType}
                    parentName={parentName}
                    existingGroupNames={groupNames}
                    existingSceneNames={new Set(Object.keys(configuration.scenes))}
                    onObjectConfigurationChange={updateObjectConfiguration}
                    onObjectNameChange={updateObjectName}
                    onObjectDelete={deleteObject}
                    onObjectParentChange={changeObjectParent}
                />
            )}
        </div>
    )
}

function flattenObjectNames(objectMap: ObjectConfigurationMap): Set<string> {
    const names = new Set(Object.keys(objectMap))
    for (const name in objectMap) {
        if (objectMap[name].type === 'group') {
            const nestedNames = flattenObjectNames(objectMap[name].children)
            for (const nestedName of nestedNames) {
                names.add(nestedName)
            }
        }
    }
    return names
}

function flattenGroupNames(objectMap: ObjectConfigurationMap): Set<string> {
    const names = new Set<string>()
    for (const name in objectMap) {
        if (objectMap[name].type === 'group') {
            names.add(name)
            const nestedNames = flattenGroupNames(objectMap[name].children)
            for (const nestedName of nestedNames) {
                names.add(nestedName)
            }
        }
    }
    return names
}

function searchObjectConfiguration(objectName: string, objectMap: ObjectConfigurationMap): ObjectConfiguration | null {
    for (const name in objectMap) {
        if (name === objectName) {
            return objectMap[name]
        }

        if (objectMap[name].type === 'group') {
            const object = searchObjectConfiguration(objectName, objectMap[name].children)
            if (object) return object
        }
    }
    return null
}

function searchObjectParentName(
    objectName: string,
    parentName: string,
    parentConfiguration: SceneConfiguration | GroupConfiguration
): string | null {
    const objectMap =
        (parentConfiguration as GroupConfiguration).type === 'group'
            ? (parentConfiguration as GroupConfiguration).children
            : (parentConfiguration as SceneConfiguration).objects
    for (const name in objectMap) {
        if (name === objectName) {
            return parentName
        }

        if (objectMap[name].type === 'group') {
            const parentName = searchObjectParentName(objectName, name, objectMap[name])
            if (parentName) return parentName
        }
    }
    return null
}

function searchObjectParentConfiguration(
    objectName: string,
    configuration: SceneConfiguration | GroupConfiguration
): SceneConfiguration | GroupConfiguration | null {
    const objectMap =
        (configuration as GroupConfiguration).type === 'group'
            ? (configuration as GroupConfiguration).children
            : (configuration as SceneConfiguration).objects
    for (const name in objectMap) {
        if (name === objectName) {
            return configuration
        }

        if (objectMap[name].type === 'group') {
            const parent = searchObjectParentConfiguration(objectName, objectMap[name])
            if (parent) return parent
        }
    }
    return null
}

type SidebarObjectListSectionParameters = {
    objects: { [name: string]: ObjectConfiguration }
    activeObject: string | null
    onObjectChange: (newActiveObject: string) => void
}

function SidebarObjectListSection(parameters: SidebarObjectListSectionParameters) {
    const { objects, activeObject } = parameters
    const changeObject = parameters.onObjectChange

    const Item = ({ name, objects }: { name: string; objects: ObjectConfigurationMap }) => {
        const selected = name === activeObject
        const handleOnClick = () => {
            changeObject(name)
        }

        const object = objects[name]

        let Icon
        switch (object.type) {
            case 'card.2d':
                Icon = CardIcon
                break
            case 'card.3d':
                Icon = CardIcon
                break
            case 'model.glb':
                Icon = FlowerPotIcon
                break
            case 'light.point':
                Icon = LightIcon
                break
            case 'light.ambient':
                Icon = LightIcon
                break
            case 'light.custom':
                Icon = LightIcon
                break
            case 'camera.perspective':
                Icon = CameraIcon
                break
            case 'group':
                Icon = CardIcon
                break
        }

        return (
            <div class="sidebar__item">
                <a class={`sidebar__item__card ${selected && 'sidebar__item__card--selected'}`} onClick={handleOnClick}>
                    <Icon selected={selected} />
                    <span class={`sidebar__item__card__name ${selected && 'sidebar__item__card__name--selected'}`}>
                        {name}
                    </span>
                </a>
                <div class="sidebar__item__children">
                    {object.type === 'group' &&
                        Object.keys(object.children).map((name) => <Item name={name} objects={object.children} />)}
                </div>
            </div>
        )
    }

    return (
        <div class="panel__section">
            <span class="panel__label">OBJECTS</span>
            {Object.keys(objects).map((name) => (
                <Item name={name} objects={objects} />
            ))}
        </div>
    )
}

type SidebarSceneListSectionParameters = {
    scenes: string[]
    activeScene: string | null
    onSceneChange: (newActiveScene: string) => void
}

function SidebarSceneListSection(parameters: SidebarSceneListSectionParameters) {
    const { scenes, activeScene } = parameters
    const changeScene = parameters.onSceneChange

    return (
        <div class="panel__section">
            <span class="panel__label">SCENES</span>
            {scenes.map((name) => {
                const selected = name === activeScene
                const handleOnClick = () => {
                    changeScene(name)
                }

                return (
                    <a
                        class={`sidebar__item__card ${selected && 'sidebar__item__card--selected'}`}
                        onClick={handleOnClick}
                    >
                        <ParkIcon selected={selected} />
                        <span class={`sidebar__item__card__name ${selected && 'sidebar__item__card__name--selected'}`}>
                            {name}
                        </span>
                    </a>
                )
            })}
        </div>
    )
}

type SidebarEditorsSectionParameters = {
    activeEditor: 'editor' | 'general' | 'style' | string
    onActiveEditorChange: (newActiveEditor: 'editor' | 'general' | 'style') => void
}

function SidebarEditorsSection(parameters: SidebarEditorsSectionParameters) {
    const { activeEditor } = parameters
    const changeActiveEditor = parameters.onActiveEditorChange

    return (
        <div class="panel__section">
            <span class="panel__label">GENERAL</span>
            {(
                [
                    { type: 'editor', name: 'Editor', Icon: PenIcon },
                    { type: 'general', name: 'Settings', Icon: SettingIcon },
                    { type: 'style', name: 'Style', Icon: StyleIcon },
                ] as const
            ).map(({ type, name, Icon }) => {
                const selected = type === activeEditor
                const handleOnClick = () => {
                    changeActiveEditor(type)
                }

                return (
                    <a
                        class={`sidebar__item__card ${selected && 'sidebar__item__card--selected'}`}
                        onClick={handleOnClick}
                    >
                        <Icon selected={selected} />
                        <span class={`sidebar__item__card__name ${selected && 'sidebar__item__card__name--selected'}`}>
                            {name}
                        </span>
                    </a>
                )
            })}
        </div>
    )
}
