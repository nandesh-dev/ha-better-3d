import { useEffect, useState } from 'preact/hooks'

import { Dropdown, DropdownStyle } from '@/components/dropdown'
import { Heading, HeadingStyle } from '@/components/heading'
import { Input, InputStyle } from '@/components/input'
import { SegmentedButtonsStyle } from '@/components/segmented_buttons'
import { SliderStyle } from '@/components/slider'

import { Config, SceneProperties } from '@/configuration/v1'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

import { SceneEditor } from './scene_editor'
import style from './style.css?raw'

export const CARD_EDITOR_CUSTOM_ELEMENT_TAGNAME = process.env.PRODUCTION
    ? 'better-3d-card-editor'
    : 'better-3d-card-editor_development'

function CardEditor(props: ComponentProps) {
    const [config, setConfig] = useState(JSON.parse(JSON.stringify(props.config)) as Config | null)
    const [selectedScene, setSelectedScene] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!props.config) return

        if (!config) {
            setConfig(props.config)
            setSelectedScene(Object.keys(props.config.scenes)[0])
        }
    }, [props.config])

    useEffect(() => {
        if (!config) return
        const timeout = setTimeout(() => {
            props.setConfig(config)
        }, 500)

        return () => {
            clearTimeout(timeout)
        }
    }, [config])

    if (!config) return

    const addNewScene = () => {
        if (Object.keys(config.scenes).indexOf('untitled') !== -1) {
            setError(
                "Scene with name 'untitled' already exists! Please name your scenes properly before creating new once"
            )
            return
        }
        setConfig({
            ...config,
            scenes: { ...config.scenes, untitled: { active_camera: '', cameras: {}, objects: {} } },
        })
    }

    const renameScene = (oldName: string, newName: string) => {
        let name = newName

        const scene = config.scenes[oldName]
        delete config.scenes[oldName]

        while (true) {
            if (Object.keys(config.scenes).indexOf(name) == -1) break
            setError(`Scene with name '${name}' already exists!`)
            name = '_' + name
        }

        setConfig({
            ...config,
            scenes: {
                ...config.scenes,
                [name]: scene,
            },
        })
        setSelectedScene(name)
    }

    const deleteScene = (name: string) => {
        const scenes = { ...config.scenes }
        delete scenes[name]

        setConfig({ ...config, scenes })

        if (name == selectedScene) {
            let differentScene = Object.keys(config.scenes)[0]
            if (differentScene == name) {
                differentScene = Object.keys(config.scenes)[-1]
            }

            setSelectedScene(differentScene)
        }
    }

    const updateSelectedSceneConfig = (newSceneConfig: SceneProperties) => {
        if (!selectedScene) return
        setConfig({ ...config, scenes: { ...config.scenes, [selectedScene]: newSceneConfig } })
    }

    return (
        <>
            <style>{style}</style>
            <InputStyle />
            <SegmentedButtonsStyle />
            <HeadingStyle />
            <DropdownStyle />
            <SliderStyle />
            <div class="outer">
                {error && <p>{error}</p>}
                <Input
                    type="expression"
                    value={config.active_scene}
                    setValue={(newValue) => {
                        setConfig({ ...config, active_scene: newValue })
                    }}
                >
                    Active Scene
                </Input>
                <div class="scroll">
                    <Heading>Scenes</Heading>
                    <Dropdown
                        options={Object.keys(config.scenes)}
                        selectedOption={selectedScene}
                        setSelectedOption={setSelectedScene}
                        addNewOption={() => addNewScene()}
                        renameOption={renameScene}
                        deleteOption={deleteScene}
                    />
                    <div class="box">
                        {selectedScene !== null && Object.keys(config.scenes).indexOf(selectedScene) !== -1 && (
                            <SceneEditor
                                config={config.scenes[selectedScene]}
                                setConfig={updateSelectedSceneConfig}
                                setError={setError}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export function registerCardEditor() {
    registerElement(CARD_EDITOR_CUSTOM_ELEMENT_TAGNAME, CardEditor)
}
