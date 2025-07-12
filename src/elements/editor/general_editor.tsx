import { Configuration, DEFAULT_SCENE_CONFIGURATION } from '@/configuration'
import { useState } from 'preact/hooks'

import { Expression as ConfigurationExpression } from '@/configuration/value'

import { Button } from './components/button'
import { Input } from './components/input'
import { Expression, FixedStringPattern } from './expression'

export type GeneralEditorParameters = {
    configuration: Configuration
    onConfigurationChange: (newConfiguration: Configuration) => void
}

export function GeneralEditor(parameters: GeneralEditorParameters) {
    const [newSceneName, setNewSceneName] = useState('')

    const updateActiveScene = (newActiveScene: ConfigurationExpression) => {
        parameters.onConfigurationChange({ ...parameters.configuration, activeScene: newActiveScene })
    }

    const handleAddNewScene = () => {
        if (!newSceneName) return
        if (Object.keys(parameters.configuration.scenes).includes(newSceneName)) return
        parameters.onConfigurationChange({
            ...parameters.configuration,
            scenes: {
                ...parameters.configuration.scenes,
                [newSceneName]: JSON.parse(JSON.stringify(DEFAULT_SCENE_CONFIGURATION)),
            },
        })
    }

    return (
        <div class="panel">
            <div class="panel__section">
                <Expression
                    value={parameters.configuration.activeScene}
                    onValueChange={updateActiveScene}
                    label="ACTIVE SCENE"
                    patterns={{ Fixed: FixedStringPattern }}
                />
            </div>
            <div class="panel__section">
                <span class="panel__label">ADD SCENE</span>
                <Input value={newSceneName} onValueChange={setNewSceneName} placeholder="Scene name" />
                {newSceneName && (
                    <>
                        {Object.keys(parameters.configuration.scenes).includes(newSceneName) && (
                            <p class="warning">A scene with the name '{newSceneName}' already exists.</p>
                        )}
                        <Button
                            name="Add Sceen"
                            onClick={handleAddNewScene}
                            dissabled={Object.keys(parameters.configuration.scenes).includes(newSceneName)}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
