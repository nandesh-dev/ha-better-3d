import { CameraProperties, Expression } from '@/configuration/v1'
import { useState } from 'preact/hooks'

import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { SegmentedButtons } from '@/components/segmented_buttons'

import { CustomVector3Editor } from './custom_vector3_editor'
import { FixedVector3Editor } from './fixed_vector3_editor'

const fixedTypePositionRegex = /^-?\d*\.?\d+$/
const fixedTypeLookAtRegex = /^-?\d*\.?\d+$/

type CameraEditorProperties = {
    config: CameraProperties
    setConfig: (config: CameraProperties) => void
}

export function CameraEditor({ config, setConfig }: CameraEditorProperties) {
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

    const [lookAtType, setLookAtType] = useState(() => {
        if (
            fixedTypeLookAtRegex.test(config.look_at.x) &&
            fixedTypeLookAtRegex.test(config.look_at.y) &&
            fixedTypeLookAtRegex.test(config.look_at.z)
        ) {
            return 'Fixed'
        }

        return 'Custom'
    })

    const setFOV = (fov: Expression) => setConfig({ ...config, fov })

    const setNear = (near: Expression) => setConfig({ ...config, near })

    const setFar = (far: Expression) => setConfig({ ...config, far })

    const setPosition = (position: CameraProperties['position']) => {
        setConfig({ ...config, position })
    }

    const setLookAt = (look_at: CameraProperties['look_at']) => {
        setConfig({ ...config, look_at })
    }

    return (
        <div class="box">
            <SegmentedButtons buttons={['orbital.perspective']} selected={'orbital.perspective'} onChange={() => {}} />
            <Input value={config.fov} setValue={setFOV} type="expression">
                FOV
            </Input>
            <Input value={config.near} setValue={setNear} type="expression">
                Near
            </Input>
            <Input value={config.far} setValue={setFar} type="expression">
                Far
            </Input>
            <Heading>Position</Heading>
            <SegmentedButtons buttons={['Fixed', 'Custom']} selected={positionType} onChange={setPositionType} />
            {positionType == 'Fixed' ? (
                <FixedVector3Editor vector={config.position} setVector={setPosition} minimum={-20} maximum={20} />
            ) : (
                <CustomVector3Editor vector={config.position} setVector={setPosition} />
            )}
            <Heading>Look At</Heading>
            <SegmentedButtons buttons={['Fixed', 'Custom']} selected={lookAtType} onChange={setLookAtType} />
            {lookAtType == 'Fixed' ? (
                <FixedVector3Editor vector={config.look_at} setVector={setLookAt} minimum={-20} maximum={20} />
            ) : (
                <CustomVector3Editor vector={config.look_at} setVector={setLookAt} />
            )}
        </div>
    )
}
