import { useState } from 'preact/hooks'
import { parse, stringify } from 'yaml'

import {
    AmbientLightConfiguration,
    Card2DConfiguration,
    Card3DConfiguration,
    CustomLightConfiguration,
    GLBModelConfiguration,
    ObjectConfiguration,
    PerspectiveCameraConfiguration,
    PointLightConfiguration,
} from '@/configuration/objects'
import { Expression as ConfigurationExpression } from '@/configuration/value'

import { Button } from './components/button'
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
    onObjectConfigurationChange: (newConfiguration: ObjectConfiguration) => void
    onObjectNameChange: (newName: string) => void
    onObjectDelete: () => void
}

export function ObjectEditor(parameters: ObjectEditorParameters) {
    const [name, setName] = useState(parameters.objectName)

    const updateObjectName = () => {
        parameters.onObjectNameChange(name)
    }

    const objectConfiguration = parameters.objectConfiguration

    const createOnValueChangeHandler = <T extends ObjectConfiguration>(property: keyof T) => {
        return (newValue: ConfigurationExpression) => {
            parameters.onObjectConfigurationChange({ ...objectConfiguration, [property]: newValue })
        }
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
    }

    return (
        <div class="panel">
            <div class="panel__section">
                <span class="panel__label">NAME</span>
                <Input value={name} onValueChange={setName} placeholder="Object name" />
                {name !== parameters.objectName && <Button name="Update" onClick={updateObjectName} />}
            </div>
            {PropertyEditors}
            <div class="panel__section">
                <Button name="Delete Object" type="danger" onClick={parameters.onObjectDelete} />
            </div>
        </div>
    )
}
