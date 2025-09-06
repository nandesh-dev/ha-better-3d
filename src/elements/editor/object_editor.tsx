import { useState } from 'preact/hooks'
import { parse, stringify } from 'yaml'

import { OBJECT_TYPES } from '@/visual/scene/group'

import {
    AmbientLightConfiguration,
    Card2DConfiguration,
    Card3DConfiguration,
    CustomLightConfiguration,
    DEFAULT_AMBIENT_LIGHT_CONFIGURATION,
    DEFAULT_CARD_2D_CONFIGURATION,
    DEFAULT_CARD_3D_CONFIGURATION,
    DEFAULT_GLB_MODEL_CONFIGURATION,
    DEFAULT_GROUP_CONFIGURATION,
    DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION,
    DEFAULT_POINT_LIGHT_CONFIGURATION,
    GLBModelConfiguration,
    GroupConfiguration,
    ObjectConfiguration,
    PerspectiveCameraConfiguration,
    PointLightConfiguration,
} from '@/configuration/objects'
import { Expression as ConfigurationExpression } from '@/configuration/value'

import { Button } from './components/button'
import { Dropdown } from './components/dropdown'
import { Input } from './components/input'
import { TextArea } from './components/text_area'
import {
    EntityBrightnessPattern,
    EntityRGBColorPattern,
    Expression,
    FixedBoolPattern,
    FixedColorPattern,
    FixedCombinedVector2Pattern,
    FixedCombinedVector3Pattern,
    FixedEulerPattern,
    FixedHTMLSizePattern,
    FixedNumberPattern,
    FixedStringPattern,
    FixedVector2Pattern,
    FixedVector3Pattern,
} from './expression'

export type ObjectEditorParameters = {
    objectName: string
    objectConfiguration: ObjectConfiguration
    existingObjectNames: Set<string>
    parentType: 'scene' | 'group'
    parentName: string
    existingGroupNames: Set<string>
    existingSceneNames: Set<string>
    onObjectConfigurationChange: (newConfiguration: ObjectConfiguration) => void
    onObjectNameChange: (newName: string) => void
    onObjectDelete: () => void
    onObjectParentChange: (parentType: 'scene' | 'group', parentName: string) => void
}

export function ObjectEditor(parameters: ObjectEditorParameters) {
    const { objectName, objectConfiguration, existingObjectNames, existingSceneNames, existingGroupNames } = parameters
    const [name, setName] = useState(objectName)
    const [newObjectType, setNewObjectType] = useState<(typeof OBJECT_TYPES)[number]>('card.2d')
    const [newObjectName, setNewObjectName] = useState('')
    const [parentType, setParentType] = useState(parameters.parentType)
    const [parentName, setParentName] = useState(parameters.parentName)

    const updateObjectName = () => {
        parameters.onObjectNameChange(name)
    }

    const createOnValueChangeHandler = <T extends ObjectConfiguration>(property: keyof T) => {
        return (newValue: ConfigurationExpression) => {
            parameters.onObjectConfigurationChange({ ...objectConfiguration, [property]: newValue })
        }
    }

    const addNewObject = () => {
        if (!newObjectName || objectConfiguration.type !== 'group') return
        if (Object.keys(objectConfiguration.children).includes(newObjectName)) return
        let newObjectConfiguration
        switch (newObjectType) {
            case 'card.2d':
                newObjectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_CARD_2D_CONFIGURATION)
                ) as Card2DConfiguration
                break
            case 'card.3d':
                newObjectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_CARD_3D_CONFIGURATION)
                ) as Card3DConfiguration
                break
            case 'model.glb':
                newObjectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_GLB_MODEL_CONFIGURATION)
                ) as GLBModelConfiguration
                break
            case 'camera.perspective':
                newObjectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_PERSPECTIVE_CAMERA_CONFIGURATION)
                ) as PerspectiveCameraConfiguration
                break
            case 'light.point':
                newObjectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_POINT_LIGHT_CONFIGURATION)
                ) as PointLightConfiguration
                break
            case 'light.ambient':
                newObjectConfiguration = JSON.parse(
                    JSON.stringify(DEFAULT_AMBIENT_LIGHT_CONFIGURATION)
                ) as AmbientLightConfiguration
                break
            case 'group':
                newObjectConfiguration = JSON.parse(JSON.stringify(DEFAULT_GROUP_CONFIGURATION)) as GroupConfiguration
                break
        }
        parameters.onObjectConfigurationChange({
            ...objectConfiguration,
            children: { ...objectConfiguration.children, [newObjectName]: newObjectConfiguration },
        })
    }

    const moveObject = () => {
        parameters.onObjectParentChange(parentType, parentName)
    }

    let PropertyEditors
    switch (objectConfiguration.type) {
        case 'card.2d':
            const updateCard2DConfig = (newRawConfig: string) => {
                const config = parse(newRawConfig)
                if (typeof config.type !== 'string') {
                    config.type = ''
                }

                parameters.onObjectConfigurationChange({ ...objectConfiguration, config })
            }

            PropertyEditors = (
                <>
                    <div class="panel__section">
                        <span class="panel__label">CONFIG</span>
                        <TextArea
                            value={stringify(objectConfiguration.config)}
                            placeholder="type: picture"
                            onValueChange={updateCard2DConfig}
                        />
                    </div>
                    <Expression
                        label="Size"
                        value={objectConfiguration.size}
                        patterns={{ Fixed: FixedHTMLSizePattern }}
                        onValueChange={createOnValueChangeHandler<Card2DConfiguration>('size')}
                    />
                    <Expression
                        label="Position"
                        value={objectConfiguration.position}
                        patterns={{ Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<Card2DConfiguration>('position')}
                    />
                    <Expression
                        label="Rotation"
                        value={objectConfiguration.rotation}
                        patterns={{ Fixed: FixedEulerPattern }}
                        onValueChange={createOnValueChangeHandler<Card2DConfiguration>('rotation')}
                    />
                    <Expression
                        label="Scale"
                        value={objectConfiguration.scale}
                        patterns={{ 'Fixed Combined': FixedCombinedVector2Pattern, Fixed: FixedVector2Pattern }}
                        onValueChange={createOnValueChangeHandler<Card2DConfiguration>('scale')}
                    />
                    <Expression
                        label="Visible"
                        value={objectConfiguration.visible}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<Card2DConfiguration>('visible')}
                    />
                </>
            )
            break
        case 'card.3d':
            const updateCard3DConfig = (newRawConfig: string) => {
                const config = parse(newRawConfig)
                if (typeof config.type !== 'string') {
                    config.type = ''
                }

                parameters.onObjectConfigurationChange({ ...objectConfiguration, config })
            }

            PropertyEditors = (
                <>
                    <div class="panel__section">
                        <span class="panel__label">CONFIG</span>
                        <TextArea
                            value={stringify(objectConfiguration.config)}
                            placeholder="type: picture"
                            onValueChange={updateCard3DConfig}
                        />
                    </div>
                    <Expression
                        label="Size"
                        value={objectConfiguration.size}
                        patterns={{ Fixed: FixedHTMLSizePattern }}
                        onValueChange={createOnValueChangeHandler<Card3DConfiguration>('size')}
                    />
                    <Expression
                        label="Position"
                        value={objectConfiguration.position}
                        patterns={{ Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<Card3DConfiguration>('position')}
                    />
                    <Expression
                        label="Rotation"
                        value={objectConfiguration.rotation}
                        patterns={{ Fixed: FixedEulerPattern }}
                        onValueChange={createOnValueChangeHandler<Card3DConfiguration>('rotation')}
                    />
                    <Expression
                        label="Scale"
                        value={objectConfiguration.scale}
                        patterns={{ 'Fixed Combined': FixedCombinedVector2Pattern, Fixed: FixedVector2Pattern }}
                        onValueChange={createOnValueChangeHandler<Card3DConfiguration>('scale')}
                    />
                    <Expression
                        label="Visible"
                        value={objectConfiguration.visible}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<Card3DConfiguration>('visible')}
                    />
                </>
            )
            break
        case 'model.glb':
            PropertyEditors = (
                <>
                    <Expression
                        label="URL"
                        value={objectConfiguration.url}
                        patterns={{ Fixed: FixedStringPattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('url')}
                    />
                    <Expression
                        label="Position"
                        value={objectConfiguration.position}
                        patterns={{ Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('position')}
                    />
                    <Expression
                        label="Rotation"
                        value={objectConfiguration.rotation}
                        patterns={{ Fixed: FixedEulerPattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('rotation')}
                    />
                    <Expression
                        label="Scale"
                        value={objectConfiguration.scale}
                        patterns={{ 'Fixed Combined': FixedCombinedVector3Pattern, Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('scale')}
                    />
                    <Expression
                        label="Visible"
                        value={objectConfiguration.visible}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('visible')}
                    />
                </>
            )
            break
        case 'light.point':
            PropertyEditors = (
                <>
                    <Expression
                        label="Position"
                        value={objectConfiguration.position}
                        patterns={{ Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<PointLightConfiguration>('position')}
                    />
                    <Expression
                        label="Intensity"
                        value={objectConfiguration.intensity}
                        patterns={{ Fixed: FixedNumberPattern, 'Entity Intensity': EntityBrightnessPattern }}
                        onValueChange={createOnValueChangeHandler<PointLightConfiguration>('intensity')}
                    />
                    <Expression
                        label="Color"
                        value={objectConfiguration.color}
                        patterns={{ Fixed: FixedColorPattern, 'Entity RGB': EntityRGBColorPattern }}
                        onValueChange={createOnValueChangeHandler<PointLightConfiguration>('color')}
                    />
                    <Expression
                        label="Helper"
                        value={objectConfiguration.helper}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<PointLightConfiguration>('helper')}
                    />
                    <Expression
                        label="Visible"
                        value={objectConfiguration.visible}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('visible')}
                    />
                </>
            )
            break
        case 'light.ambient':
            PropertyEditors = (
                <>
                    <Expression
                        label="Intensity"
                        value={objectConfiguration.intensity}
                        patterns={{ Fixed: FixedNumberPattern, 'Entity Intensity': EntityBrightnessPattern }}
                        onValueChange={createOnValueChangeHandler<AmbientLightConfiguration>('intensity')}
                    />
                    <Expression
                        label="Color"
                        value={objectConfiguration.color}
                        patterns={{ Fixed: FixedColorPattern, 'Entity RGB': EntityRGBColorPattern }}
                        onValueChange={createOnValueChangeHandler<AmbientLightConfiguration>('color')}
                    />
                    <Expression
                        label="Visible"
                        value={objectConfiguration.visible}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<AmbientLightConfiguration>('visible')}
                    />
                </>
            )
            break
        case 'light.custom':
            PropertyEditors = (
                <>
                    <Expression
                        label="URL"
                        value={objectConfiguration.url}
                        patterns={{ Fixed: FixedStringPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('url')}
                    />
                    <Expression
                        label="Position"
                        value={objectConfiguration.position}
                        patterns={{ Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('position')}
                    />
                    <Expression
                        label="Rotation"
                        value={objectConfiguration.rotation}
                        patterns={{ Fixed: FixedEulerPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('rotation')}
                    />
                    <Expression
                        label="Scale"
                        value={objectConfiguration.scale}
                        patterns={{ 'Fixed Combined': FixedCombinedVector3Pattern, Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('scale')}
                    />
                    <Expression
                        label="Density"
                        value={objectConfiguration.density}
                        patterns={{
                            Fixed: {
                                matchRegex: (value) => {
                                    const match = /^(\s*-?\d*\.?\d*\s*)$/.exec(value)
                                    return match !== null ? [match[1].trim()] : null
                                },
                                computeValue: (values) => `${parseFloat(values[0])}`,
                                inputs: [{ name: 'number', type: 'number', min: 0, max: 1 }],
                            },
                        }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('density')}
                    />
                    <Expression
                        label="Intensity"
                        value={objectConfiguration.intensity}
                        patterns={{ Fixed: FixedNumberPattern, 'Entity Intensity': EntityBrightnessPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('intensity')}
                    />
                    <Expression
                        label="Color"
                        value={objectConfiguration.color}
                        patterns={{ Fixed: FixedColorPattern, 'Entity RGB': EntityRGBColorPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('color')}
                    />
                    <Expression
                        label="Mesh Intensity"
                        value={objectConfiguration.meshIntensity}
                        patterns={{ Fixed: FixedNumberPattern, 'Entity Intensity': EntityBrightnessPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('meshIntensity')}
                    />
                    <Expression
                        label="Mesh Visible"
                        value={objectConfiguration.meshVisible}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('meshVisible')}
                    />
                    <Expression
                        label="Helper"
                        value={objectConfiguration.helper}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('helper')}
                    />
                    <Expression
                        label="Visible"
                        value={objectConfiguration.visible}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('visible')}
                    />
                </>
            )
            break
        case 'camera.perspective':
            PropertyEditors = (
                <>
                    <Expression
                        label="FOV"
                        value={objectConfiguration.fov}
                        patterns={{ Fixed: FixedNumberPattern }}
                        onValueChange={createOnValueChangeHandler<PerspectiveCameraConfiguration>('fov')}
                    />
                    <Expression
                        label="Near"
                        value={objectConfiguration.near}
                        patterns={{ Fixed: FixedNumberPattern }}
                        onValueChange={createOnValueChangeHandler<PerspectiveCameraConfiguration>('near')}
                    />
                    <Expression
                        label="Far"
                        value={objectConfiguration.far}
                        patterns={{ Fixed: FixedNumberPattern }}
                        onValueChange={createOnValueChangeHandler<PerspectiveCameraConfiguration>('far')}
                    />
                    <Expression
                        label="Position"
                        value={objectConfiguration.position}
                        patterns={{ Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<PerspectiveCameraConfiguration>('position')}
                    />
                    <Expression
                        label="Look At"
                        value={objectConfiguration.lookAt}
                        patterns={{ Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<PerspectiveCameraConfiguration>('lookAt')}
                    />
                </>
            )
            break
        case 'group':
            PropertyEditors = (
                <>
                    <Expression
                        label="Position"
                        value={objectConfiguration.position}
                        patterns={{ Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('position')}
                    />
                    <Expression
                        label="Rotation"
                        value={objectConfiguration.rotation}
                        patterns={{ Fixed: FixedEulerPattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('rotation')}
                    />
                    <Expression
                        label="Scale"
                        value={objectConfiguration.scale}
                        patterns={{ 'Fixed Combined': FixedCombinedVector3Pattern, Fixed: FixedVector3Pattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('scale')}
                    />
                    <Expression
                        label="Visible"
                        value={objectConfiguration.visible}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<GLBModelConfiguration>('visible')}
                    />
                    <Expression
                        label="Helper"
                        value={objectConfiguration.helper}
                        patterns={{ Fixed: FixedBoolPattern }}
                        onValueChange={createOnValueChangeHandler<CustomLightConfiguration>('helper')}
                    />
                    <div class="panel__section">
                        <span class="panel__label">ADD CHILD</span>
                        <Dropdown options={OBJECT_TYPES} selected={newObjectType} onSelectedChange={setNewObjectType} />
                        <Input value={newObjectName} onValueChange={setNewObjectName} placeholder="Object name" />
                        {newObjectName && (
                            <>
                                {existingObjectNames.has(newObjectName) && (
                                    <p class="warning">An object with the name '{newObjectName}' already exists.</p>
                                )}
                                <Button
                                    name="Add Child"
                                    onClick={addNewObject}
                                    dissabled={existingObjectNames.has(newObjectName)}
                                />
                            </>
                        )}
                    </div>
                </>
            )
            break
    }

    return (
        <div class="panel">
            <div class="panel__section">
                <span class="panel__label">NAME</span>
                <Input value={name} onValueChange={setName} placeholder="Object name" />
                {name !== objectName && <Button name="Update" onClick={updateObjectName} />}
            </div>
            {PropertyEditors}
            <div class="panel__section">
                <span class="panel__label">MOVE TO</span>
                <Dropdown
                    options={['scene', 'group'] as const}
                    selected={parentType}
                    onSelectedChange={setParentType}
                />
                <Dropdown
                    options={
                        parentType === 'scene'
                            ? Array.from(existingSceneNames)
                            : Array.from(existingGroupNames).filter((name) => name !== objectName)
                    }
                    selected={parentName}
                    onSelectedChange={setParentName}
                />
                <Button name="Move Object" onClick={moveObject} />
            </div>
            <div class="panel__section">
                <Button
                    name="Delete Object"
                    type="danger"
                    onClick={parameters.onObjectDelete}
                    dissabled={parentType === 'group' && parentName === objectName}
                />
                {parentType === 'group' && parentName === objectName && (
                    <p class="warning">An object with the name '{newObjectName}' already exists.</p>
                )}
            </div>
        </div>
    )
}
