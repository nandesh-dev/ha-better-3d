import { GLBModelProperties, ObjectProperties, PointLightProperties } from '@/configuration/v1'

import { SegmentedButtons } from '@/components/segmented_buttons'

import { GLBModelEditor } from './glb_model_editor'
import { PointLightEditor } from './point_light.editor'

type ObjectEditorProperties = {
    config: ObjectProperties
    setConfig: (config: ObjectProperties) => void
}

export function ObjectEditor({ config, setConfig }: ObjectEditorProperties) {
    const setType = (type: string) => {
        switch (type as ObjectProperties['type']) {
            case 'model.glb':
                setConfig({
                    type: 'model.glb',
                    url: (config as GLBModelProperties).url || '""',
                    position: (config as GLBModelProperties).position || { x: '0', y: '0', z: '0' },
                    rotation: (config as GLBModelProperties).rotation || {
                        x: 'Math.PI / 180 * 0',
                        y: 'Math.PI / 180 * 0',
                        z: 'Math.PI / 180 * 0',
                    },
                    scale: (config as GLBModelProperties).scale || { x: '1', y: '1', z: '1' },
                })
                break
            case 'light.point':
                setConfig({
                    type: 'light.point',
                    position: (config as PointLightProperties).position || { x: '0', y: '0', z: '0' },
                    intensity: (config as PointLightProperties).intensity || '1',
                    color: (config as PointLightProperties).color || 'Color.fromHEX("#ffffff")',
                })
                break
        }
    }

    return (
        <div class="box">
            <SegmentedButtons buttons={['model.glb', 'light.point']} selected={config.type} onChange={setType} />
            {config.type == 'model.glb' && <GLBModelEditor config={config} setConfig={setConfig} />}
            {config.type == 'light.point' && <PointLightEditor config={config} setConfig={setConfig} />}
        </div>
    )
}
