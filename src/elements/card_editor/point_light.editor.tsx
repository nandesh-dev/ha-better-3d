import { CameraProperties, Expression, PointLightProperties } from '@/configuration/v1'
import { useState } from 'preact/hooks'

import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { SegmentedButtons } from '@/components/segmented_buttons'

import { CustomVector3Editor } from './custom_vector3_editor'
import { FixedVector3Editor } from './fixed_vector3_editor'

const fixedTypePositionRegex = /^-?\d*\.?\d+$/
const hexTypeColorRegex = /^Color\.fromHEX\("(#[\w\d]{6})"\)$/

type PointLightEditorProperties = {
    config: PointLightProperties
    setConfig: (config: PointLightProperties) => void
}

export function PointLightEditor({ config, setConfig }: PointLightEditorProperties) {
    const [positionType, setPositionType] = useState(() => {
        if (
            fixedTypePositionRegex.test(config.position.x) &&
            fixedTypePositionRegex.test(config.position.y) &&
            fixedTypePositionRegex.test(config.position.z)
        ) {
            return 'Fixed'
        }

        return 'Custom'
    })

    const [colorType, setColorType] = useState(() => {
        if (hexTypeColorRegex.test(config.color)) {
            return 'HEX'
        }

        return 'Custom'
    })

    const setHEXColor = (color: string) => {
        setConfig({ ...config, color: `Color.fromHEX("${color}")` })
    }

    const setCustomColor = (color: Expression) => setConfig({ ...config, color })

    const setIntensity = (intensity: Expression) => setConfig({ ...config, intensity })

    const setPosition = (position: CameraProperties['position']) => {
        setConfig({ ...config, position })
    }

    return (
        <div class="box">
            <SegmentedButtons buttons={['orbital.perspective']} selected={'orbital.perspective'} onChange={() => {}} />
            <Input value={config.intensity} setValue={setIntensity} type="expression">
                Intensity
            </Input>
            <Heading>Color</Heading>
            <SegmentedButtons buttons={['HEX', 'Custom']} selected={colorType} onChange={setColorType} />
            {colorType == 'HEX' ? (
                <Input
                    value={(hexTypeColorRegex.exec(config.color) || [null, '#FFFFFF'])[1]}
                    setValue={setHEXColor}
                    type="value"
                >
                    HEX
                </Input>
            ) : (
                <Input value={config.color} setValue={setCustomColor} type="expression">
                    Custom
                </Input>
            )}
            <Heading>Position</Heading>
            <SegmentedButtons buttons={['Fixed', 'Custom']} selected={positionType} onChange={setPositionType} />
            {positionType == 'Fixed' ? (
                <FixedVector3Editor vector={config.position} setVector={setPosition} minimum={-20} maximum={20} />
            ) : (
                <CustomVector3Editor vector={config.position} setVector={setPosition} />
            )}
        </div>
    )
}
