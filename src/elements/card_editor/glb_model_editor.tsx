import { Expression, GLBModelProperties } from '@/configuration/v1'
import { useState } from 'preact/hooks'

import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { SegmentedButtons } from '@/components/segmented_buttons'

import { CustomVector3Editor } from './custom_vector3_editor'
import { FixedVector3Editor } from './fixed_vector3_editor'

type GLBModelEditorProperties = {
    config: GLBModelProperties
    setConfig: (config: GLBModelProperties) => void
}

const fixedTypePositionRegex = /^-?\d*\.?\d+$/
const fixedTypeRotationRegex = /^Math\.PI \/ 180 \* (\d*\.?\d*)$/

export function GLBModelEditor({ config, setConfig }: GLBModelEditorProperties) {
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

    const [rotationType, setRotationType] = useState(() => {
        if (
            fixedTypeRotationRegex.test(config.rotation.x) &&
            fixedTypeRotationRegex.test(config.rotation.y) &&
            fixedTypeRotationRegex.test(config.rotation.z)
        ) {
            return 'Fixed'
        }

        return 'Custom'
    })

    const setURL = (url: Expression) => {
        setConfig({ ...config, url })
    }

    const setPosition = (position: GLBModelProperties['position']) => {
        setConfig({ ...config, position })
    }

    const setCustomRotation = (rotation: GLBModelProperties['rotation']) => {
        setConfig({ ...config, rotation })
    }

    const setFixedRotation = (rotation: { x: string; y: string; z: string }) => {
        setConfig({
            ...config,
            rotation: {
                x: `Math.PI / 180 * ${rotation.x}`,
                y: `Math.PI / 180 * ${rotation.y}`,
                z: `Math.PI / 180 * ${rotation.z}`,
            },
        })
    }

    const setScale = (scale: GLBModelProperties['scale']) => {
        setConfig({ ...config, scale })
    }

    return (
        <>
            <Input value={config.url} setValue={setURL} type="expression">
                URL
            </Input>
            <Heading>Position</Heading>
            <SegmentedButtons buttons={['Fixed', 'Custom']} selected={positionType} onChange={setPositionType} />
            {positionType == 'Fixed' ? (
                <FixedVector3Editor vector={config.position} setVector={setPosition} minimum={-20} maximum={20} />
            ) : (
                <CustomVector3Editor vector={config.position} setVector={setPosition} />
            )}
            <Heading>Rotation</Heading>
            <SegmentedButtons buttons={['Fixed', 'Custom']} selected={rotationType} onChange={setRotationType} />
            {rotationType == 'Fixed' ? (
                <FixedVector3Editor
                    vector={{
                        x: (fixedTypeRotationRegex.exec(config.rotation.x) || [null, '0'])[1],
                        y: (fixedTypeRotationRegex.exec(config.rotation.y) || [null, '0'])[1],
                        z: (fixedTypeRotationRegex.exec(config.rotation.z) || [null, '0'])[1],
                    }}
                    setVector={setFixedRotation}
                    minimum={0}
                    maximum={360}
                />
            ) : (
                <CustomVector3Editor vector={config.rotation} setVector={setCustomRotation} />
            )}
            <Heading>Scale</Heading>
            <SegmentedButtons buttons={['Fixed']} selected={'Fixed'} onChange={() => {}} />
            <FixedVector3Editor vector={config.scale} setVector={setScale} minimum={0} maximum={10} />
        </>
    )
}
