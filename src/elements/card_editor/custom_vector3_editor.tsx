import { Expression } from '@/configuration/v1'

import { Input } from '@/components/input'

type CustomVector3EditorProperties = {
    vector: { x: Expression; y: Expression; z: Expression }
    setVector: (vector: { x: Expression; y: Expression; z: Expression }) => void
}

export function CustomVector3Editor({ vector, setVector }: CustomVector3EditorProperties) {
    const setX = (x: Expression) => {
        setVector({ ...vector, x })
    }
    const setY = (y: Expression) => {
        setVector({ ...vector, y })
    }
    const setZ = (z: Expression) => {
        setVector({ ...vector, z })
    }

    return (
        <div class="box">
            <Input value={vector.x} setValue={setX} type="expression">
                X
            </Input>
            <Input value={vector.y} setValue={setY} type="expression">
                Y
            </Input>
            <Input value={vector.z} setValue={setZ} type="expression">
                Z
            </Input>
        </div>
    )
}
