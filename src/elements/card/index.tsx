import { Configuration } from '@/configuration'
import { Visual } from '@/visual'
import { useEffect, useRef, useState } from 'preact/hooks'

import { ComponentProps, registerElement } from '@/utility/home_assistant/register_element'

export const CARD_CUSTOM_ELEMENT_TAGNAME = process.env.PRODUCTION ? 'better-3d-card' : 'better-3d-card_development'

function Card({ config, homeAssistant }: ComponentProps) {
    if (!config || !homeAssistant) return

    const ref = useRef<HTMLDivElement>(null)
    const [visual, setVisual] = useState<Visual>()

    useEffect(() => {
        if (!ref.current) return

        const visual = new Visual(
            { height: ref.current.clientHeight, width: ref.current.clientWidth },
            new Configuration(config),
            homeAssistant
        )
        ref.current.append(visual.domElement)
        setVisual(visual)

        const resizeObserver = new ResizeObserver(() => {
            if (!ref.current) return
            visual.updateSize({ height: ref.current.clientHeight, width: ref.current.clientWidth })
        })

        resizeObserver.observe(ref.current)

        return () => {
            resizeObserver.disconnect()
            if (ref.current?.contains(visual.domElement)) {
                ref.current.removeChild(visual.domElement)
            }
            visual?.dispose()
        }
    }, [ref.current])

    useEffect(() => {
        if (!visual) return

        visual.updateConfig(new Configuration(config))
    }, [config, visual])

    useEffect(() => {
        if (!visual) return

        visual.updateHomeAssistant(homeAssistant)
    }, [homeAssistant, visual])

    return <div ref={ref} style={{ overflow: 'hidden', width: '100%', aspectRatio: '2/1' }}></div>
}

export function registerCard() {
    registerElement(
        CARD_CUSTOM_ELEMENT_TAGNAME,
        Card,
        {
            getStubConfig: () => {
                return DefaultConfiguration.encode()
            },
        },
        {
            name: 'Better 3D',
            description: 'Fully customizable 3D rendering card',
            documentationURL: 'https://github.com/nandesh-dev/ha-better-3d',
        }
    )
}

const DefaultConfiguration = new Configuration({
    type: `custom:${CARD_CUSTOM_ELEMENT_TAGNAME}`,
    active_scene: '"primary_scene"',
    scenes: {
        primary_scene: {
            active_camera: '"primary_camera"',
            cameras: {
                primary_camera: {
                    type: 'orbital.perspective',
                    fov: '50',
                    near: '0.1',
                    far: '10000',
                    position: {
                        x: '500',
                        y: '50',
                        z: '-100',
                    },
                    look_at: {
                        x: '0',
                        y: '0',
                        z: '0',
                    },
                },
            },
            objects: {
                light: {
                    type: 'light.point',
                    position: {
                        x: '15',
                        y: '4',
                        z: '10',
                    },
                    intensity: '2000',
                    color: 'Color.fromHEX("#ffffff")',
                    visible: 'true',
                },
                logo: {
                    type: 'card',
                    config: {
                        type: 'picture',
                        image: 'https://raw.githubusercontent.com/nandesh-dev/ha-better-3d/main/assets/favicon.png',
                    },
                    size: {
                        height: '"auto"',
                        width: '"auto"',
                    },
                    position: {
                        x: '0',
                        y: '0',
                        z: '0',
                    },
                    rotation: {
                        x: '0',
                        y: 'Math.PI / 2',
                        z: '0',
                    },
                    scale: {
                        x: '1',
                        y: '1',
                        z: '1',
                    },
                    visible: 'true',
                },
            },
        },
    },
})
