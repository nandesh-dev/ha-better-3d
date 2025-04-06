import { Expression } from '@/configuration/v1'

import { Slider } from '@/components/slider'

type FixedVector3EditorProperties = {
    vector: { x: Expression; y: Expression; z: Expression }
    maximum: number
    minimum: number
    setVector: (vector: { x: Expression; y: Expression; z: Expression }) => void
}

export function FixedVector3Editor({ vector, minimum, maximum, setVector }: FixedVector3EditorProperties) {
    const setX = (x: number) => {
        setVector({ ...vector, x: x.toString() })
    }
    const setY = (y: number) => {
        setVector({ ...vector, y: y.toString() })
    }
    const setZ = (z: number) => {
        setVector({ ...vector, z: z.toString() })
    }

    return (
        <div class="box">
            <Slider value={parseFloat(vector.x)} setValue={setX} minimum={minimum} maximum={maximum} step={0.01}>
                X
            </Slider>
            <Slider value={parseFloat(vector.y)} setValue={setY} minimum={minimum} maximum={maximum} step={0.01}>
                Y
            </Slider>
            <Slider value={parseFloat(vector.z)} setValue={setZ} minimum={minimum} maximum={maximum} step={0.01}>
                Z
            </Slider>
        </div>
    )
}
