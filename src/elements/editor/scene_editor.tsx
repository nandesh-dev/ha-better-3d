import { SceneConfiguration } from '@/configuration'
import { useState } from 'preact/hooks'

import { OBJECT_TYPES } from '@/visual/scene/group'

import {
    AmbientLightConfiguration,
    Card2DConfiguration,
    Card3DConfiguration,
    DEFAULT_AMBIENT_LIGHT_CONFIGURATION,
    DEFAULT_CARD_2D_CONFIGURATION,
    DEFAULT_CARD_3D_CONFIGURATION,
    DEFAULT_GLB_MODEL_CONFIGURATION,
    DEFAULT_GROUP_CONFIGURATION,
    DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION,
    DEFAULT_POINT_LIGHT_CONFIGURATION,
    GLBModelConfiguration,
    GroupConfiguration,
    PerspectiveCameraConfiguration,
    PointLightConfiguration,
} from '@/configuration/objects'
import { Expression as ConfigurationExpression } from '@/configuration/value'

import { Button } from './components/button'
import { Dropdown } from './components/dropdown'
import { Input } from './components/input'
import { EntityRGBColorPattern, Expression, FixedColorPattern, FixedStringPattern } from './expression'

export type SceneEditorParameters = {
    sceneName: string
    sceneConfiguration: SceneConfiguration
    existingObjectNames: Set<string>
    onSceneConfigurationChange: (newConfiguration: SceneConfiguration) => void
    onSceneNameChange: (newName: string) => void
    onSceneDelete: () => void
}

export function SceneEditor(parameters: SceneEditorParameters) {
    const { sceneName, sceneConfiguration, existingObjectNames } = parameters
    const [name, setName] = useState(sceneName)
    const [newObjectName, setNewObjectName] = useState('')
    const [newObjectType, setNewObjectType] = useState<(typeof OBJECT_TYPES)[number]>('card.2d')

    const updateSceneName = () => {
        parameters.onSceneNameChange(name)
    }

    const updateActiveCamera = (newActiveCamera: ConfigurationExpression) => {
        parameters.onSceneConfigurationChange({ ...sceneConfiguration, activeCamera: newActiveCamera })
    }

    const updateBackgroundColor = (newBackgroundColor: ConfigurationExpression) => {
        parameters.onSceneConfigurationChange({
            ...sceneConfiguration,
            backgroundColor: newBackgroundColor,
        })
    }

    const addNewObject = () => {
        if (!newObjectName) return
        if (Object.keys(sceneConfiguration.objects).includes(newObjectName)) return
        let objectConfiguration
        switch (newObjectType) {
            case 'card.2d':
                objectConfiguration = JSON.parse(JSON.stringify(DEFAULT_CARD_2D_CONFIGURATION)) as Card2DConfiguration
                break
            case 'card.3d':
                objectConfiguration = JSON.parse(JSON.stringify(DEFAULT_CARD_3D_CONFIGURATION)) as Card3DConfiguration
                break
            case 'model.glb':
                objectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_GLB_MODEL_CONFIGURATION)
                ) as GLBModelConfiguration
                break
            case 'camera.perspective':
                objectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION)
                ) as PerspectiveCameraConfiguration
                break
            case 'light.point':
                objectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_POINT_LIGHT_CONFIGURATION)
                ) as PointLightConfiguration
                break
            case 'light.ambient':
                objectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_AMBIENT_LIGHT_CONFIGURATION)
                ) as AmbientLightConfiguration
                break
            case 'group':
                objectConfiguration = JSON.parse(JSON.stringify(DEFAULT_GROUP_CONFIGURATION)) as GroupConfiguration
                break
        }
        parameters.onSceneConfigurationChange({
            ...sceneConfiguration,
            objects: { ...sceneConfiguration.objects, [newObjectName]: objectConfiguration },
        })
    }
    return (
        <div class="panel">
            <div class="panel__section">
                <span class="panel__label">NAME</span>
                <Input value={name} onValueChange={setName} placeholder="Scene name" />
                {name !== sceneName && <Button name="Update" onClick={updateSceneName} />}
            </div>
            <Expression
                label="Active Camera"
                value={sceneConfiguration.activeCamera}
                onValueChange={updateActiveCamera}
                patterns={{ Fixed: FixedStringPattern }}
            />
            <Expression
                label="Background Color"
                value={sceneConfiguration.backgroundColor}
                onValueChange={updateBackgroundColor}
                patterns={{ Fixed: FixedColorPattern, 'RGB Entity': EntityRGBColorPattern }}
            />
            <div class="panel__section">
                <Button name="Delete Scene" type="danger" onClick={parameters.onSceneDelete} />
            </div>
            <div class="panel__section">
                <span class="panel__label">ADD OBJECT</span>
                <Dropdown options={OBJECT_TYPES} selected={newObjectType} onSelectedChange={setNewObjectType} />
                <Input value={newObjectName} onValueChange={setNewObjectName} placeholder="Object name" />
                {newObjectName && (
                    <>
                        {existingObjectNames.has(newObjectName) && (
                            <p class="warning">An object with the name '{newObjectName}' already exists.</p>
                        )}
                        <Button
                            name="Add Object"
                            onClick={addNewObject}
                            dissabled={existingObjectNames.has(newObjectName)}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
